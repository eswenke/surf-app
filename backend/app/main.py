from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Import the routers from the app directory structure
from app.routers import reviews_router, spots_router
from app.database import get_supabase_client

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Surf App API",
    description="API for surf spot reviews and forecasts",
    version="0.1.0"
)

# Set CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://wavefinder.onrender.com",
        "http://localhost:3000"
    ],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
# This connects all the endpoints defined in the routers to your main app
app.include_router(reviews_router, tags=["reviews"])
app.include_router(spots_router, tags=["spots"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Surf App API"}


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running
    and can connect to Supabase.
    """
    try:
        # Test Supabase connection
        supabase = get_supabase_client()
        # Simple query to check connection
        response = supabase.table("reviews").select("count", count="exact").limit(1).execute()
        return {
            "status": "healthy",
            "supabase_connection": "ok",
            "review_count": response.count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )
