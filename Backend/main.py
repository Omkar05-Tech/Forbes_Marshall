# # backend/main.py

# from fastapi import FastAPI, File, UploadFile, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# import uuid
# import json
# from PIL import Image
# from io import BytesIO
# from typing import Dict, List, Optional
# import base64 # Needed for encoding file content
# import os

# # Local imports
# from database.mongo import startup_db_client, shutdown_db_client, save_image_document, retrieve_image_document, update_document_results
# from services.image_handler import process_image_crops_manual, image_to_base64
# from services.gemini_caller import get_values_from_images
# from mappings.part_definitions import PART_DEFINITIONS
# from fastapi.responses import Response

# # --- FastAPI Lifespan (Handles DB Connection) ---
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup: Connect to MongoDB
#     await startup_db_client(app)
#     yield
#     # Shutdown: Close MongoDB connection
#     await shutdown_db_client(app)

# app = FastAPI(title="Forbes Marshall Drawing Mapper", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     # The exact URL of your React frontend (check your browser address bar)
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all methods (POST, GET, PUT, etc.)
#     allow_headers=["*"],  # Allows all headers
# )

# # --- ENDPOINT 1: UPLOAD AND STORE IMAGES ---

# @app.post("/api/upload")
# async def upload_and_process(
#     file: UploadFile = File(..., description="The full product drawing image."),
#     product_key: str = Form(..., description="e.g., 'Control_Valve'"),
#     crop_data_json: str = Form(..., description="JSON string of {'zone_key': [x1, y1, x2, y2]} for manual cropping.")
# ):
#     """
#     Handles image upload, cropping, and temporary storage in MongoDB.
    
#     The coordinates [x1, y1, x2, y2] must be scaled to the original image's pixel dimensions.
#     """
#     if product_key not in PART_DEFINITIONS:
#         raise HTTPException(status_code=400, detail=f"Invalid product key: {product_key}")

#     upload_id = str(uuid.uuid4())
    
#     try:
#         # 1. Read the uploaded file
#         file_contents = await file.read()
#         full_image_buffer = BytesIO(file_contents)
#         full_image = Image.open(full_image_buffer)
        
#         # 2. Parse crop data (from the frontend JSON string)
#         crop_data: Dict[str, List[int]] = json.loads(crop_data_json)

#         # 3. Process Cropping and convert to Base64
#         cropped_images_b64 = process_image_crops_manual(full_image, crop_data)
        
#         # 4. Prepare Data for MongoDB
#         image_doc = {
#             "upload_id": upload_id,
#             "product_key": product_key,
#             "original_filename": file.filename,
#             # Store the full image as Base64 for maximum compatibility
#             "full_image_b64": image_to_base64(full_image), 
#             "cropped_images_b64": cropped_images_b64, 
#             "status": "uploaded",
#             "gemini_raw_results": None,
#             "final_validated_data": None
#         }
        
#         # 5. Store in MongoDB
#         await save_image_document(app.mongodb_client, image_doc) 
        
#         return {"message": "Image uploaded and stored successfully.", "upload_id": upload_id}
        
#     except json.JSONDecodeError:
#         raise HTTPException(status_code=400, detail="Invalid JSON format for crop_data_json.")
#     except Exception as e:
#         # Catch all other errors
#         print(f"Upload/Processing Error: {e}")
#         raise HTTPException(status_code=500, detail=f"Processing failed: {e.__class__.__name__}")

# # --- ENDPOINT 2: CALL GEMINI API AND GET RAW RESULTS ---

# @app.post("/api/process/{upload_id}")
# async def process_drawing(upload_id: str):
#     """
#     Retrieves stored images, calls Gemini, and saves the raw output.
#     """
#     # 1. Retrieve Stored Data
#     image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
#     if not image_doc:
#         raise HTTPException(status_code=404, detail="Upload ID not found.")

#     product_key = image_doc["product_key"]
#     if product_key not in PART_DEFINITIONS:
#         raise HTTPException(status_code=400, detail=f"Invalid product key '{product_key}' in document.")

#     part_def = PART_DEFINITIONS[product_key]
    
#     # 2. Collect images and consolidated questions for this part
#     images_to_process = image_doc["cropped_images_b64"]
    
#     # Consolidate all questions from all zones defined in the template
#     all_questions = {}
#     for batch in part_def["zone_batches"]:
#         all_questions.update(batch["questions"])
    
#     if not images_to_process:
#         raise HTTPException(status_code=400, detail="No valid cropped images found for processing.")

#     # 3. Call Gemini Model
#     raw_results = await get_values_from_images(images_to_process, all_questions)

#     if "error" in raw_results:
#         await update_document_results(app.mongodb_client, upload_id, {"status": "gemini_error", "gemini_error_msg": raw_results["error"]})
#         raise HTTPException(status_code=503, detail=f"Gemini API call failed: {raw_results['error']}")

#     # 4. Store Raw Output and return
#     await update_document_results(
#         app.mongodb_client, 
#         upload_id, 
#         {"status": "validation_pending", "gemini_raw_results": raw_results}
#     )

#     print(f"\n[DB Write] Stored raw results for ID {upload_id}: {raw_results}\n")

#     return {"upload_id": upload_id, "status": "validation_pending", "raw_results": raw_results}
    
# # --- ENDPOINT 3: GENERATE FINAL TEMPLATE (After Frontend Validation) ---

# @app.post("/api/report/{upload_id}")
# async def generate_final_report(upload_id: str, validated_data: Dict[str, str]):
#     """
#     Takes validated data (a flat key/value dictionary) from the frontend and fills the final template.
#     """
#     # 1. Retrieve document to get the template
#     image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
#     if not image_doc:
#         raise HTTPException(status_code=404, detail="Upload ID not found.")

#     product_key = image_doc["product_key"]
#     part_def = PART_DEFINITIONS[product_key]
    
#     try:
#         # 2. Fill the template with the validated data
#         final_description = part_def["final_template"].format(**validated_data)
        
#         # 3. Store the final validated data and report
#         await update_document_results(
#             app.mongodb_client,
#             upload_id,
#             {
#                 "status": "completed",
#                 "final_validated_data": validated_data,
#                 "final_description": final_description
#             }
#         )
        
#         return {"upload_id": upload_id, "final_description": final_description}
        
#     except KeyError as e:
#         # This catches errors if the validated_data is missing a key required by the template
#         raise HTTPException(status_code=400, detail=f"Missing data key '{e.args[0]}' required for template. Please ensure validation is complete.")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Report generation failed: {e}")
    
# @app.get("/api/view-image/{upload_id}")
# async def view_image(upload_id: str):
#     """
#     Helper endpoint to view the uploaded image directly in the browser.
#     """
#     # 1. Retrieve the document
#     image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
#     if not image_doc:
#         raise HTTPException(status_code=404, detail="Image not found")

#     # 2. Get the Base64 string
#     b64_string = image_doc.get("full_image_b64", "")
    
#     # 3. Clean the string (remove 'data:image/png;base64,' if present)
#     if "base64," in b64_string:
#         b64_string = b64_string.split("base64,")[1]
        
#     # 4. Convert back to bytes and return as an image response
#     try:
#         image_bytes = base64.b64decode(b64_string)
#         # We return it as a PNG (or JPEG) so the browser renders it
#         return Response(content=image_bytes, media_type="image/png")
#     except Exception as e:
#         return {"error": "Failed to decode image", "details": str(e)}

# backend/main.py

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

# --- NEW IMPORTS FOR PDF SUPPORT ---
try:
    from pdf2image import convert_from_bytes
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("Warning: 'pdf2image' not installed. PDF uploads will fail.")

# Local imports
from database.mongo import startup_db_client, shutdown_db_client, save_image_document, retrieve_image_document, update_document_results
from services.image_handler import process_image_crops_manual, image_to_base64
from services.gemini_caller import get_values_from_images
from mappings.part_definitions import PART_DEFINITIONS
from fastapi.responses import Response

@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_db_client(app)
    yield
    await shutdown_db_client(app)

app = FastAPI(title="Forbes Marshall Drawing Mapper", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINT 1: UPLOAD (Now Supports PDF) ---
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
        
        # --- PDF HANDLING LOGIC ---
        if file.content_type == "application/pdf":
            if not PDF_SUPPORT:
                raise HTTPException(status_code=500, detail="Server missing 'pdf2image' library. Please contact admin.")
            
            try:
                # Convert PDF to list of images (we take the first page)
                # fmt='jpeg' ensures it renders quickly
                images = convert_from_bytes(file_contents, fmt='jpeg')
                if not images:
                    raise ValueError("PDF appears to be empty or could not be read.")
                full_image = images[0]
            except Exception as e:
                print(f"PDF Conversion Error: {e}")
                raise HTTPException(status_code=500, detail="Failed to convert PDF. Is 'Poppler' installed on the server?")
        else:
            # Standard Image Handling
            full_image = Image.open(BytesIO(file_contents))

        # --- UNIVERSAL FORMATTING ---
        # Convert to RGB to prevent errors with PNG Palettes or CMYK PDFs
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

# --- ENDPOINT 2: PROCESS ---
@app.post("/api/process/{upload_id}")
async def process_drawing(upload_id: str):
    image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
    if not image_doc:
        raise HTTPException(status_code=404, detail="Upload ID not found.")

    product_key = image_doc["product_key"]
    part_def = PART_DEFINITIONS.get(product_key)
    images_to_process = image_doc["cropped_images_b64"]
    
    all_questions = {}
    for batch in part_def["zone_batches"]:
        all_questions.update(batch["questions"])

    # Call Gemini (Returns Values + Boxes)
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

    print(f"[Process] Gemini results (with boxes) saved for {upload_id}")
    return {"upload_id": upload_id, "status": "validation_pending", "raw_results": enriched_results}
    
# --- ENDPOINT 3: REPORT ---
@app.post("/api/report/{upload_id}")
async def generate_final_report(upload_id: str, validated_data: Dict[str, str]):
    image_doc = await retrieve_image_document(app.mongodb_client, upload_id)
    if not image_doc: raise HTTPException(status_code=404, detail="Not found")

    product_key = image_doc["product_key"]
    part_def = PART_DEFINITIONS[product_key]
    
    try:
        final_description = part_def["final_template"].format(**validated_data)
        
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
        raise HTTPException(status_code=500, detail=str(e))
    
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