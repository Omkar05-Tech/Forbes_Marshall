# backend/main.py

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uuid
import json
from PIL import Image
from io import BytesIO
from typing import Dict
import base64
from collections import defaultdict # Required for safe report generation

# --- PDF HANDLING: PyMuPDF (No System Install Required) ---
try:
    import fitz  # PyMuPDF
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("Warning: 'pymupdf' not installed. PDF uploads will fail. Run 'pip install pymupdf'")

# Local imports
from database.mongo import startup_db_client, shutdown_db_client, save_image_document, retrieve_image_document, update_document_results
from services.image_handler import process_image_crops_manual, image_to_base64
from services.gemini_caller import get_values_from_images
from mappings.part_definitions import PART_DEFINITIONS
from fastapi.responses import Response

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB
    await startup_db_client(app)
    yield
    # Shutdown: Close DB
    await shutdown_db_client(app)

app = FastAPI(title="Forbes Marshall Drawing Mapper", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINT 1: UPLOAD (Supports PDF & Images) ---
@app.post("/api/upload")
async def upload_and_process(
    file: UploadFile = File(...),
    product_key: str = Form(...),
    crop_data_json: str = Form(...)
):
    if product_key not in PART_DEFINITIONS:
        raise HTTPException(status_code=400, detail=f"Invalid product key: {product_key}")

    upload_id = str(uuid.uuid4())
    
    try:
        file_contents = await file.read()
        
        # --- PDF LOGIC (PyMuPDF) ---
        if file.content_type == "application/pdf":
            if not PDF_SUPPORT:
                raise HTTPException(status_code=500, detail="Server missing 'pymupdf'. Please run 'pip install pymupdf'.")
            
            try:
                # 1. Open PDF stream
                doc = fitz.open(stream=file_contents, filetype="pdf")
                if doc.page_count < 1:
                    raise ValueError("Empty PDF")
                
                # 2. Load first page
                page = doc.load_page(0) 
                
                # 3. Render high-quality image (2x zoom for clarity)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) 
                
                # 4. Convert to PIL Image
                full_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
            except Exception as e:
                print(f"PDF Conversion Error: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
        else:
            # Standard Image Logic
            full_image = Image.open(BytesIO(file_contents))

        # --- UNIVERSAL FORMATTING (RGB Fix) ---
        if full_image.mode != "RGB":
            full_image = full_image.convert("RGB")
            
        crop_data = json.loads(crop_data_json)
        cropped_images_b64 = process_image_crops_manual(full_image, crop_data)
        
        image_doc = {
            "upload_id": upload_id,
            "product_key": product_key,
            "original_filename": file.filename,
            "full_image_b64": image_to_base64(full_image), 
            "cropped_images_b64": cropped_images_b64, 
            "status": "uploaded",
            "gemini_raw_results": None,
            "final_validated_data": None
        }
        
        await save_image_document(app.mongodb_client, image_doc) 
        return {"message": "Success", "upload_id": upload_id}
        
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 2: PROCESS WITH GEMINI ---
@app.post("/api/process/{upload_id}")
async def process_drawing(upload_id: str):
    image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
    if not image_doc:
        raise HTTPException(status_code=404, detail="Upload ID not found.")

    product_key = image_doc["product_key"]
    part_def = PART_DEFINITIONS.get(product_key)
    images_to_process = image_doc["cropped_images_b64"]
    
    # Consolidate questions from all zones
    all_questions = {}
    for batch in part_def["zone_batches"]:
        all_questions.update(batch["questions"])

    # Call Gemini
    enriched_results = await get_values_from_images(images_to_process, all_questions)

    if "error" in enriched_results:
        await update_document_results(app.mongodb_client, upload_id, {"status": "error", "error_msg": enriched_results["error"]})
        raise HTTPException(status_code=503, detail=enriched_results['error'])

    await update_document_results(
        app.mongodb_client, 
        upload_id, 
        {
            "status": "validation_pending", 
            "gemini_raw_results": enriched_results 
        }
    )

    print(f"[Process] Gemini results saved for {upload_id}")
    return {"upload_id": upload_id, "status": "validation_pending", "raw_results": enriched_results}
    
# --- ENDPOINT 3: GENERATE REPORT (ROBUST) ---
@app.post("/api/report/{upload_id}")
async def generate_final_report(upload_id: str, validated_data: Dict[str, str]):
    image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
    if not image_doc: raise HTTPException(status_code=404, detail="Not found")

    product_key = image_doc["product_key"]
    part_def = PART_DEFINITIONS.get(product_key)
    
    if not part_def:
        raise HTTPException(status_code=400, detail=f"Definition not found for {product_key}")

    try:
        # --- SAFE FORMATTING LOGIC ---
        # If a key is missing (e.g., missed crop), insert "[MISSING]" instead of crashing
        safe_data = defaultdict(lambda: "[MISSING VALUE]")
        safe_data.update(validated_data)

        # Use format_map to apply the safe dictionary
        template = part_def["final_template"]
        final_description = template.format_map(safe_data)
        
        await update_document_results(
            app.mongodb_client,
            upload_id,
            {
                "status": "completed",
                "final_validated_data": validated_data,
                "final_description": final_description
            }
        )
        
        return {"upload_id": upload_id, "final_description": final_description}
    except Exception as e:
        print(f"Report Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# --- ENDPOINT 4: VIEW IMAGE HELPER ---
@app.get("/api/view-image/{upload_id}")
async def view_image(upload_id: str):
    image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
    if not image_doc: raise HTTPException(status_code=404, detail="Not found")

    b64_string = image_doc.get("full_image_b64", "")
    if "base64," in b64_string: b64_string = b64_string.split("base64,")[1]
        
    try:
        return Response(content=base64.b64decode(b64_string), media_type="image/png")
    except Exception:
        return {"error": "Failed to decode"}