"""
Router for spots and forecasts API endpoints
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional

from ..database import get_supabase_client
from ..models import Spot, SpotCreate, SpotUpdate, SpotForecast
from ..services.forecast_service import (
    fetch_forecast_for_spot,
    update_all_spot_forecasts
)

router = APIRouter()


@router.get("/spots", response_model=List[Spot])
async def get_spots(location: Optional[str] = None):
    """
    Get all spots, optionally filtered by location
    """
    supabase = get_supabase_client()
    query = supabase.table("spots").select("*")
    
    if location:
        query = query.eq("location", location)
    
    response = query.execute()
    
    if response.error:
        raise HTTPException(status_code=500, detail=str(response.error))
    
    return response.data


@router.get("/spots/{spot_id}", response_model=Spot)
async def get_spot(spot_id: int):
    """
    Get a specific spot by ID
    """
    supabase = get_supabase_client()
    response = supabase.table("spots").select("*").eq("id", spot_id).execute()
    
    if response.error:
        raise HTTPException(status_code=500, detail=str(response.error))
    
    if not response.data:
        raise HTTPException(status_code=404, detail=f"Spot with ID {spot_id} not found")
    
    return response.data[0]


@router.post("/spots", response_model=Spot)
async def create_spot(spot: SpotCreate):
    """
    Create a new spot
    """
    supabase = get_supabase_client()
    response = supabase.table("spots").insert(spot.model_dump()).execute()
    
    if response.error:
        raise HTTPException(status_code=500, detail=str(response.error))
    
    return response.data[0]


@router.patch("/spots/{spot_id}", response_model=Spot)
async def update_spot(spot_id: int, spot_update: SpotUpdate):
    """
    Update an existing spot
    """
    supabase = get_supabase_client()
    # Check if spot exists
    check_response = supabase.table("spots").select("*").eq("id", spot_id).execute()
    
    if not check_response.data:
        raise HTTPException(status_code=404, detail=f"Spot with ID {spot_id} not found")
    
    # Remove None values from the update
    update_data = {k: v for k, v in spot_update.model_dump(exclude_unset=True).items() if v is not None}
    
    if not update_data:
        return check_response.data[0]
    
    # Add updated_at timestamp
    from datetime import datetime
    update_data["updated_at"] = datetime.now().isoformat()
    
    # Update the spot
    response = supabase.table("spots").update(update_data).eq("id", spot_id).execute()
    
    if response.error:
        raise HTTPException(status_code=500, detail=str(response.error))
    
    return response.data[0]


@router.delete("/spots/{spot_id}")
async def delete_spot(spot_id: int):
    """
    Delete a spot
    """
    supabase = get_supabase_client()
    # Check if spot exists
    check_response = supabase.table("spots").select("*").eq("id", spot_id).execute()
    
    if not check_response.data:
        raise HTTPException(status_code=404, detail=f"Spot with ID {spot_id} not found")
    
    # Delete the spot
    response = supabase.table("spots").delete().eq("id", spot_id).execute()
    
    if response.error:
        raise HTTPException(status_code=500, detail=str(response.error))
    
    return {"message": f"Spot with ID {spot_id} deleted"}


@router.get("/spots/{spot_id}/forecast", response_model=SpotForecast)
async def get_spot_forecast(spot_id: int, refresh: bool = False):
    """
    Get forecast for a specific spot
    
    Args:
        spot_id: ID of the spot
        refresh: Whether to force a refresh of the forecast
    """
    forecast = await fetch_forecast_for_spot(spot_id)
    
    if not forecast:
        raise HTTPException(status_code=404, detail=f"Spot with ID {spot_id} not found")
    
    return forecast


@router.post("/spots/update-forecasts")
async def update_forecasts(background_tasks: BackgroundTasks):
    """
    Update forecasts for all spots
    
    This is a long-running operation, so it runs in the background
    """
    background_tasks.add_task(update_all_spot_forecasts)
    return {"message": "Forecast update started in the background"}
