from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import base64
import uuid
from datetime import datetime
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Professional Photo Generator API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/professional_photos")
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database()
photos_collection = db["photos"]

# OpenAI Image Generation setup
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
image_generator = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Professional Photo Generator API", "status": "running"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "professional-photo-generator"}


@app.post("/api/generate-professional-photo")
async def generate_professional_photo(file: UploadFile = File(...)):
    """
    Generate a professional LinkedIn-style photo from an uploaded selfie
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read uploaded file
        image_data = await file.read()
        
        # Convert uploaded image to base64 for storage
        original_image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Create professional photo prompt
        prompt = """Create a professional LinkedIn-style portrait photo. 
        The photo should have:
        - Professional business attire (suit or business casual)
        - Neutral, solid background (preferably light gray or white)
        - Professional lighting with no harsh shadows
        - Head and shoulders composition
        - Confident and approachable expression
        - High quality, suitable for a professional profile picture
        
        Style: Professional corporate headshot, LinkedIn profile photo"""
        
        # Generate professional photo using OpenAI
        generated_images = await image_generator.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if not generated_images or len(generated_images) == 0:
            raise HTTPException(status_code=500, detail="Failed to generate professional photo")
        
        # Convert generated image to base64
        professional_image_base64 = base64.b64encode(generated_images[0]).decode('utf-8')
        
        # Create photo record
        photo_record = {
            "_id": str(uuid.uuid4()),
            "original_image": original_image_base64,
            "professional_image": professional_image_base64,
            "created_at": datetime.utcnow().isoformat(),
            "prompt_used": prompt
        }
        
        # Save to MongoDB
        await photos_collection.insert_one(photo_record)
        
        return JSONResponse(content={
            "success": True,
            "photo_id": photo_record["_id"],
            "professional_image": professional_image_base64,
            "message": "Professional photo generated successfully"
        })
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating professional photo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating photo: {str(e)}")


@app.get("/api/photos/{photo_id}")
async def get_photo(photo_id: str):
    """
    Retrieve a specific photo by ID
    """
    try:
        photo = await photos_collection.find_one({"_id": photo_id})
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        return JSONResponse(content={
            "success": True,
            "photo_id": photo["_id"],
            "original_image": photo["original_image"],
            "professional_image": photo["professional_image"],
            "created_at": photo["created_at"]
        })
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving photo: {str(e)}")


@app.get("/api/photos")
async def list_photos(limit: int = 10):
    """
    List all generated photos (most recent first)
    """
    try:
        cursor = photos_collection.find().sort("created_at", -1).limit(limit)
        photos = await cursor.to_list(length=limit)
        
        # Remove large image data from list view
        for photo in photos:
            photo.pop("original_image", None)
            photo.pop("professional_image", None)
        
        return JSONResponse(content={
            "success": True,
            "count": len(photos),
            "photos": photos
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing photos: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
