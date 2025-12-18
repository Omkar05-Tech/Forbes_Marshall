# backend/config.py

import os
from dotenv import load_dotenv

load_dotenv()

# --- Gemini Configuration ---
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyDTQvqTS3giN3t_VxKQ4nT9QgjvaDGXI3I")
# GEMINI_API_KEY = "AIzaSyDTQvqTS3giN3t_VxKQ4nT9QgjvaDGXI3I"

# --- MongoDB Configuration ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "forbes_marshall_temp")
COLLECTION_NAME = "product_drawings"

if not GEMINI_API_KEY:
    print("Warning: GOOGLE_API_KEY not found in environment variables. Gemini features will not work.")

if not MONGO_URI:
    print("Warning: MONGO_URI not found. Using default mongodb://localhost:27017")