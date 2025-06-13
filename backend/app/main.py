from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import datetime

# Import the routers from the app directory structure
from app.routers import reviews_router, spots_router
from app.database import get_supabase_client
from app.services.forecast_service import update_all_spot_forecasts

# Load environment variables
load_dotenv()

# Set up the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    update_all_spot_forecasts,
    IntervalTrigger(hours=3),  # Run every 3 hours
    id="update_forecasts",
    name="Update surf spot forecasts",
    replace_existing=True
)

# Define lifespan context manager for app startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the scheduler
    scheduler.start()
    yield
    # Shutdown: Stop the scheduler
    scheduler.shutdown()

# Initialize FastAPI app
app = FastAPI(
    title="Surf Spot API",
    description="API for surf spot reviews and forecasts",
    version="0.1.0",
    lifespan=lifespan
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
