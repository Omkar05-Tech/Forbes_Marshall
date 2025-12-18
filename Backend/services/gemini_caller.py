# backend/services/gemini_caller.py

import google.generativeai as genai
import os
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# Using Flash is faster and cheaper for this task
MODEL_NAME = "gemini-2.5-flash" 

def normalize_gemini_box(box_1000):
    """
    Converts Gemini's [ymin, xmin, ymax, xmax] (0-1000 scale)
    to Frontend {x, y, w, h} (0-100% scale).
    """
    if not box_1000 or len(box_1000) != 4:
        return { "x": 0, "y": 0, "w": 0, "h": 0 }

    ymin, xmin, ymax, xmax = box_1000

    # Convert to percentages
    # Gemini returns 0-1000. Dividing by 10 gives 0-100.
    x = xmin / 10.0
    y = ymin / 10.0
    w = (xmax - xmin) / 10.0
    h = (ymax - ymin) / 10.0

    return { "x": x, "y": y, "w": w, "h": h }

async def get_values_from_images(image_list_b64: list, questions_dict: dict):
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Prompt asking for both Value and Box
        # prompt_text = (
        #     "You are an expert Quality Control Inspector reading engineering drawings.\n"
        #     "Analyze the attached images to extract technical specifications.\n\n"
        #     "For each field listed below, return a JSON object containing two keys:\n"
        #     "1. 'value': The exact text or numeric value found (e.g. '41.5', '-0.1'). Use null if not visible.\n"
        #     "2. 'box_2d': The bounding box of the value in the image, formatted as [ymin, xmin, ymax, xmax] on a scale of 0 to 1000.\n\n"
        #     "Strictly follow this JSON structure for your response:\n"
        #     "{\n"
        #     "  \"key_name\": { \"value\": \"extracted_text\", \"box_2d\": [ymin, xmin, ymax, xmax] },\n"
        #     "  ...\n"
        #     "}\n\n"
        #     "Fields to Extract:\n"
        #     f"{json.dumps(questions_dict, indent=2)}"
        # )
        prompt_text = (
            "You are an expert technical drawing inspector. Your task is to extract specific numeric specifications and their EXACT locations from the provided image crops.\n\n"
            
            "RULES FOR EXTRACTION:\n"
            "1. **Value:** Extract only the numeric value or text code requested (e.g., '41.5', '-0.1', 'H7'). Do not include labels like 'Dia', 'Ø', or 'mm' unless they are part of the tolerance code.\n"
            "2. **Bounding Box:** You MUST return the 2D bounding box for the *VALUE TEXT ONLY*.\n"
            "   - Do NOT include the label name, leader lines, or dimension arrows in the box.\n"
            "   - The box must TIGHTLY enclose the characters of the value.\n"
            "   - Format: [ymin, xmin, ymax, xmax] on a 0-1000 scale.\n"
            "3. **Nulls:** If the value is not clearly visible, return null for both value and box.\n\n"
            
            "Output strictly valid JSON in this format:\n"
            "{\n"
            "  \"key_id\": {\n"
            "    \"value\": \"extracted_string\",\n"
            "    \"box_2d\": [ymin, xmin, ymax, xmax]\n"
            "  }\n"
            "}\n\n"
            
            "EXTRACT THESE FIELDS:\n"
            f"{json.dumps(questions_dict, indent=2)}"
        )

        content_parts = [prompt_text]
        
        # Handle input being a list or a dict of images
        images_to_send = image_list_b64.values() if isinstance(image_list_b64, dict) else image_list_b64

        for img_b64 in images_to_send:
            # Ensure header is stripped if present
            if "base64," in img_b64:
                img_b64 = img_b64.split("base64,")[1]
                
            image_part = {
                "mime_type": "image/jpeg", 
                "data": img_b64
            }
            content_parts.append(image_part)

        print(f"[Gemini Caller] Requesting data + boxes for {len(questions_dict)} fields...")

        response = await asyncio.to_thread(
            model.generate_content,
            content_parts,
            generation_config={"response_mime_type": "application/json"}
        )

        raw_text = response.text.strip()
        
        # Basic cleanup
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "")
        elif raw_text.startswith("```"):
            raw_text = raw_text.replace("```", "")
            
        result_data = json.loads(raw_text)

        # Normalize Output for Frontend
        processed_data = {}
        for key, item in result_data.items():
            if isinstance(item, dict):
                raw_box = item.get("box_2d", [])
                processed_data[key] = {
                    "value": item.get("value"),
                    "box": normalize_gemini_box(raw_box)
                }
            else:
                # Fallback for unexpected format
                processed_data[key] = {
                    "value": item,
                    "box": { "x": 0, "y": 0, "w": 0, "h": 0 }
                }

        return processed_data

    except Exception as e:
        print(f"[Gemini Caller] Error: {e}")
        return {"error": str(e)}