# backend/database/mongo.py

from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI
from config import MONGO_URI, DB_NAME, COLLECTION_NAME

def get_mongo_client() -> AsyncIOMotorClient:
    """Returns an async MongoDB client."""
    client = AsyncIOMotorClient(MONGO_URI)
    return client

async def startup_db_client(app: FastAPI):
    """Initializes the database connection on app startup."""
    try:
        app.mongodb_client = get_mongo_client()
        app.database = app.mongodb_client[DB_NAME]
        # Optional: Check connection health
        await app.mongodb_client.admin.command('ping')
        print("--- Connected to MongoDB! ---")
    except Exception as e:
        print(f"Error connecting to MongoDB. Please ensure your local database is running: {e}")
        # Note: In a real app, you might want to exit here.

async def shutdown_db_client(app: FastAPI):
    """Closes the database connection on app shutdown."""
    if hasattr(app, 'mongodb_client'):
        app.mongodb_client.close()
        print("--- Disconnected from MongoDB! ---")

# --- CRUD Operations ---

async def save_image_document(client: AsyncIOMotorClient, data: dict):
    """Inserts the image data into the temporary collection."""
    db = client[DB_NAME]
    return await db[COLLECTION_NAME].insert_one(data)

async def retrieve_image_document(client: AsyncIOMotorClient, upload_id: str) -> dict | None:
    """Retrieves a document by upload_id."""
    db = client[DB_NAME]
    document = await db[COLLECTION_NAME].find_one({"upload_id": upload_id})
    return document

async def update_document_results(client: AsyncIOMotorClient, upload_id: str, results: dict):
    """Updates the document with the Gemini result/status."""
    db = client[DB_NAME]
    await db[COLLECTION_NAME].update_one(
        {"upload_id": upload_id},
        {"$set": results}
    )