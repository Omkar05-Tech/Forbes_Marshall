# # backend/services/image_handler.py

# from PIL import Image
# from io import BytesIO
# import base64
# from typing import List, Dict

# def image_to_base64(image: Image.Image) -> str:
#     """Converts a PIL Image object to a Base64 string (JPEG format)."""
#     buffer = BytesIO()
#     image.save(buffer, format={"JPEG","PNG"}, quality=90) 
#     return base64.b64encode(buffer.getvalue()).decode('utf-8')

# def crop_and_encode(full_image: Image.Image, coords: List[int]) -> str:
#     """
#     Crops an image based on [x1, y1, x2, y2] and returns Base64.
#     """
#     try:
#         left, upper, right, lower = map(int, coords)
        
#         # Validation to prevent crashes on bad coordinates
#         if left >= right or upper >= lower:
#              return ""

#         cropped_img = full_image.crop((left, upper, right, lower))
#         return image_to_base64(cropped_img)
#     except Exception as e:
#         print(f"Error during cropping: {e}")
#         return "" 

# def process_image_crops_manual(full_image: Image.Image, crop_data: Dict[str, List[int]]) -> Dict[str, str]:
#     """
#     Processes manual crops based on zone keys and coordinates.
#     """
#     cropped_images = {}
#     for key, coords in crop_data.items():
#         if coords and len(coords) == 4:
#             cropped_images[key] = crop_and_encode(full_image, coords)
#     return cropped_images

# backend/services/image_handler.py

from PIL import Image
from io import BytesIO
import base64
from typing import List, Dict

def image_to_base64(image: Image.Image) -> str:
    """
    Converts a PIL Image object to a Base64 string (JPEG format).
    Handles mode conversion (P/RGBA -> RGB) to prevent JPEG errors.
    """
    buffer = BytesIO()
    
    # --- FIX: Convert to RGB if not already ---
    # JPEG does not support 'P' (Palette) or 'RGBA' (Transparency) modes.
    if image.mode != 'RGB':
        image = image.convert('RGB')
        
    image.save(buffer, format="JPEG", quality=90) 
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def crop_and_encode(full_image: Image.Image, coords: List[int]) -> str:
    """
    Crops an image based on [x1, y1, x2, y2] and returns Base64.
    """
    try:
        left, upper, right, lower = map(int, coords)
        
        # Validation to prevent crashes on bad coordinates
        if left >= right or upper >= lower:
             return ""

        cropped_img = full_image.crop((left, upper, right, lower))
        return image_to_base64(cropped_img)
    except Exception as e:
        print(f"Error during cropping: {e}")
        return "" 

def process_image_crops_manual(full_image: Image.Image, crop_data: Dict[str, List[int]]) -> Dict[str, str]:
    """
    Processes manual crops based on zone keys and coordinates.
    """
    cropped_images = {}
    for key, coords in crop_data.items():
        if coords and len(coords) == 4:
            cropped_images[key] = crop_and_encode(full_image, coords)
    return cropped_images