"""
Service for retrieving surf forecast data using SurfPy
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

import surfpy
from ..database import get_supabase_client
from ..models import Spot, ForecastCreate, ForecastDay, SpotForecast

logger = logging.getLogger(__name__)

# Constants
FORECAST_CACHE_HOURS = 6  # How long to cache forecasts before refreshing


async def get_surf_forecast(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Get surf forecast data from NOAA via SurfPy
    
    Args:
        latitude: Latitude of the spot
        longitude: Longitude of the spot
        
    Returns:
        Dictionary containing forecast data
    """
    try:
        # Create a location object for the spot
        wave_location = surfpy.Location(latitude, longitude, altitude=0.0)
        
        # Set default wave parameters if they're not known
        wave_location.depth = 30.0  # Default depth in meters
        wave_location.angle = 315.0  # Default angle in degrees
        wave_location.slope = 0.02  # Default slope
        
        # Get wave forecast data
        global_wave_model = surfpy.wavemodel.global_gfs_wave_model_25km()
        num_hours_to_forecast = 72  # 3-day forecast
        wave_grib_data = global_wave_model.fetch_grib_datas(0, num_hours_to_forecast, wave_location)
        raw_wave_data = global_wave_model.parse_grib_datas(wave_location, wave_grib_data)
        
        if not raw_wave_data:
            raise Exception("Failed to fetch wave forecast data")
            
        wave_data = global_wave_model.to_buoy_data(raw_wave_data)
        
        # Get weather forecast data
        global_weather_model = surfpy.weathermodel.global_gfs_weather_model()
        weather_grib_data = global_weather_model.fetch_grib_datas(0, num_hours_to_forecast, wave_location)
        raw_weather_data = global_weather_model.parse_grib_datas(wave_location, weather_grib_data)
        
        if not raw_weather_data:
            raise Exception("Failed to fetch weather forecast data")
            
        weather_data = global_weather_model.to_buoy_data(raw_weather_data)
        
        # Merge wave and weather data
        surfpy.merge_wave_weather_data(wave_data, weather_data)
        
        # Calculate breaking wave heights
        for data_point in wave_data:
            data_point.solve_breaking_wave_heights(wave_location)
            data_point.change_units(surfpy.units.Units.english)  # Convert to feet
        
        # Convert to dictionary format for storage
        forecast_data = {
            "wave_data": [data.to_json() for data in wave_data],
            "model_time": global_wave_model.latest_model_time().isoformat(),
            "timestamp": datetime.now().isoformat()
        }
        
        return forecast_data
    except Exception as e:
        logger.error(f"Error getting surf forecast: {str(e)}")
        return {
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


async def get_spot_forecast(spot_id: int, force_refresh: bool = False) -> Optional[Dict[str, Any]]:
    """
    Get forecast for a specific spot, using cached data if available and recent
    
    Args:
        spot_id: ID of the spot
        force_refresh: Whether to force a refresh of the forecast
        
    Returns:
        Dictionary containing forecast data or None if spot not found
    """
    # Get spot from database
    supabase = get_supabase_client()
    spot_response = supabase.table("spots").select("*").eq("id", spot_id).execute()
    
    if not spot_response.data:
        logger.error(f"Spot with ID {spot_id} not found")
        return None
    
    spot = Spot(**spot_response.data[0])
    
    # Check if we have a recent forecast
    cache_cutoff = datetime.now() - timedelta(hours=FORECAST_CACHE_HOURS)
    forecast_response = (
        supabase.table("forecasts")
        .select("*")
        .eq("spot_id", spot_id)
        .gt("timestamp", cache_cutoff.isoformat())
        .order("timestamp", desc=True)
        .limit(1)
        .execute()
    )
    
    # If we have a recent forecast and don't need to refresh, return it
    if forecast_response.data and not force_refresh:
        logger.info(f"Using cached forecast for spot {spot_id}")
        return forecast_response.data[0]["forecast_data"]
    
    # Otherwise, fetch a new forecast
    logger.info(f"Fetching new forecast for spot {spot_id}")
    forecast_data = await get_surf_forecast(spot.latitude, spot.longitude)
    
    # Store the forecast in the database
    if "error" not in forecast_data:
        forecast_create = ForecastCreate(
            spot_id=spot_id,
            forecast_data=forecast_data,
            timestamp=datetime.now()
        )
        
        supabase.table("forecasts").insert(forecast_create.model_dump()).execute()
    
    return forecast_data


async def process_forecast_for_frontend(forecast_data: Dict[str, Any]) -> List[ForecastDay]:
    """
    Process raw forecast data into a format suitable for the frontend
    
    Args:
        forecast_data: Raw forecast data from SurfPy
        
    Returns:
        List of ForecastDay objects
    """
    forecast_days = []
    
    if not forecast_data or "wave_data" not in forecast_data:
        return forecast_days
    
    # Group data by day
    day_data = {}
    for json_data in forecast_data["wave_data"]:
        # Convert JSON back to data object for processing
        data = surfpy.buoydata.BuoyData.from_json(json_data)
        
        # Get date as string (without time)
        date_str = data.date.strftime("%Y-%m-%d")
        day_name = data.date.strftime("%A")
        
        if date_str not in day_data:
            day_data[date_str] = {
                "day": day_name,
                "date": date_str,
                "wave_heights": [],
                "wind_speeds": [],
                "wind_directions": [],
                "temperatures": []
            }
        
        # Add data points
        day_data[date_str]["wave_heights"].append(data.wave_summary.wave_height)
        day_data[date_str]["wind_speeds"].append(data.wind_speed)
        day_data[date_str]["wind_directions"].append(data.wind_direction)
        if hasattr(data, "air_temperature"):
            day_data[date_str]["temperatures"].append(data.air_temperature)
    
    # Process each day's data
    for date_str, data in day_data.items():
        # Calculate averages
        avg_wave_height = sum(data["wave_heights"]) / len(data["wave_heights"]) if data["wave_heights"] else 0
        avg_wind_speed = sum(data["wind_speeds"]) / len(data["wind_speeds"]) if data["wind_speeds"] else 0
        avg_wind_direction = sum(data["wind_directions"]) / len(data["wind_directions"]) if data["wind_directions"] else 0
        avg_temp = sum(data["temperatures"]) / len(data["temperatures"]) if data["temperatures"] else None
        
        # Get wind direction as cardinal
        wind_cardinal = get_wind_direction_cardinal(avg_wind_direction)
        
        forecast_day = ForecastDay(
            day=data["day"],
            date=date_str,
            waveHeight=f"{avg_wave_height:.1f} ft",
            wind=f"{avg_wind_speed:.1f} mph {wind_cardinal}",
            weather="",  # No direct weather description in the data
            temperature=int(avg_temp) if avg_temp is not None else None
        )
        forecast_days.append(forecast_day)
    
    # Sort by date
    forecast_days.sort(key=lambda x: x.date)
    
    return forecast_days


def get_wind_direction_cardinal(degrees: float) -> str:
    """
    Convert wind direction in degrees to cardinal direction
    """
    directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", 
                 "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    index = round(degrees / 22.5) % 16
    return directions[index]


async def get_formatted_spot_forecast(spot_id: int) -> Optional[SpotForecast]:
    """
    Get a formatted forecast for a spot suitable for the frontend
    
    Args:
        spot_id: ID of the spot
        
    Returns:
        SpotForecast object or None if spot not found
    """
    # Get spot from database
    supabase = get_supabase_client()
    spot_response = supabase.table("spots").select("*").eq("id", spot_id).execute()
    
    if not spot_response.data:
        return None
    
    spot = Spot(**spot_response.data[0])
    
    # Get the forecast data
    forecast_data = await get_spot_forecast(spot_id)
    
    if not forecast_data:
        return None
    
    # Process the forecast data
    forecast_days = await process_forecast_for_frontend(forecast_data)
    
    # Create and return the spot forecast
    return SpotForecast(
        spot_id=spot.id,
        spot_name=spot.name,
        forecast=forecast_days,
        last_updated=datetime.now()
    )


async def update_all_forecasts() -> Dict[str, Any]:
    """
    Update forecasts for all spots in the database
    
    Returns:
        Dictionary with results of the update operation
    """
    # Get all spots
    supabase = get_supabase_client()
    spots_response = supabase.table("spots").select("*").execute()
    
    if not spots_response.data:
        return {"message": "No spots found", "updated": 0}
    
    updated = 0
    errors = []
    
    # Update forecast for each spot
    for spot_data in spots_response.data:
        spot = Spot(**spot_data)
        try:
            await get_spot_forecast(spot.id, force_refresh=True)
            updated += 1
        except Exception as e:
            errors.append({"spot_id": spot.id, "error": str(e)})
    
    return {
        "message": f"Updated forecasts for {updated} spots",
        "updated": updated,
        "errors": errors
    }
