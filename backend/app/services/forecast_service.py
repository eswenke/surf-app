# app/services/forecast_service.py
import os
import datetime
from datetime import timezone
import json
import pytz
import surfpy
from supabase import create_client, Client
from typing import List, Dict, Any, Optional


def tune_spot(location):
    """Tune surf location parameters based on spot name
    
    Args:
        location (surfpy.Location): The surf location to tune parameters for
    """
    # Default values if no specific tuning is applied
    default_depth = 30.0  # meters
    default_angle = 195.0  # degrees (South-Southwest facing)
    default_slope = 0.02  # beach slope
    
    # Spot-specific tuning based on name
    name = location.name.lower() if location.name else ""
    
    if "shell beach" in name:
        # Shell Beach parameters
        location.depth = 30.0  # Using default depth without specific buoy data
        location.angle = 195.0  # South-Southwest facing
        location.slope = 0.01
        
    elif "pismo beach" in name:
        # Pismo Beach parameters - more gradual slope than Shell Beach
        location.depth = 30.0  # Using default depth without specific buoy data
        location.angle = 225.0  # Southwest facing
        location.slope = 0.005  # More gradual slope
        
    elif "morro bay" in name:
        # Morro Bay parameters - protected bay
        location.depth = 30.0  # Using default depth without specific buoy data
        location.angle = 270.0  # West facing
        location.slope = 0.015
        
    else:
        # Use default parameters for unknown spots
        location.depth = default_depth
        location.angle = default_angle
        location.slope = default_slope
    
    print(f"Tuned parameters for {location.name}: depth={location.depth}m, angle={location.angle}°, slope={location.slope}")

# initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def get_all_surf_spots():
    """Retrieve all surf spots from the database"""
    response = supabase.table("surf_spots").select("*").execute()
    return response.data

def fetch_forecast_for_spot(spot):
    """Fetch forecast data for a specific spot using surfpy
    
    Args:
        spot (dict): Surf spot data containing id, name, latitude, longitude
        
    Returns:
        dict: Forecast data for the current timestamp with wave height, tide, wind, and swell components
    """
    try:
        # Create surfpy location objects for wave and wind data
        surf_location = surfpy.Location(
            spot["latitude"], 
            spot["longitude"], 
            altitude=0.0, 
            name=spot["name"]
        )
        
        # Set default wave model parameters
        surf_location.depth = 30.0  # Default depth in meters
        surf_location.angle = 270.0  # Default beach angle (South-Southwest facing)
        surf_location.slope = 0.02  # Default beach slope

        # Tune parameters for spot based on spot name
        tune_spot(surf_location)
        
        # Initialize the west coast wave model
        west_coast_wave_model = surfpy.wavemodel.us_west_coast_gfs_wave_model()
        
        print(f'Fetching GFS Wave Data for {spot["name"]}')
        # Get forecast for the next 24 hours
        wave_grib_data = west_coast_wave_model.fetch_grib_datas(0, 24, surf_location)
        raw_wave_data = west_coast_wave_model.parse_grib_datas(surf_location, wave_grib_data)
        
        if not raw_wave_data:
            print(f'Failed to fetch wave forecast data for {spot["name"]}')
            return None
            
        # Convert raw wave data to buoy data format
        data = west_coast_wave_model.to_buoy_data(raw_wave_data)
        
        # Fetch weather data (wind)
        print(f'Fetching local weather data for {spot["name"]}')
        weather_data = surfpy.WeatherApi.fetch_hourly_forecast(surf_location)
        
        # Merge wave and weather data
        if weather_data:
            surfpy.merge_wave_weather_data(data, weather_data)
        
        # Calculate breaking wave heights
        for dat in data:
            dat.solve_breaking_wave_heights(surf_location)
            dat.change_units(surfpy.units.Units.english)  # Convert to English units (feet)
        
        # Get the current forecast (first item in the data array)
        if len(data) > 0:
            current_forecast = data[0]
            
            # Get tide data if available
            tide_value = None
            try:
                # Find the nearest tide station
                tide_stations = surfpy.TideStations()
                tide_stations.fetch_stations()
                
                # Find closest station
                closest_station = None
                min_distance = float('inf')
                
                for station in tide_stations.stations:
                    # Calculate rough distance (this is simplified)
                    dist = ((station.latitude - spot["latitude"]) ** 2 + 
                           (station.longitude - spot["longitude"]) ** 2) ** 0.5
                    if dist < min_distance:
                        min_distance = dist
                        closest_station = station
                
                if closest_station:
                    # Get current tide data
                    now = datetime.datetime.now(timezone.utc)
                    end_time = now + datetime.timedelta(hours=1)
                    tide_data = closest_station.fetch_tide_data(
                        now, end_time, 
                        interval=surfpy.TideStation.DataInterval.default, 
                        unit=surfpy.units.Units.english
                    )
                    
                    # Extract current tide level if available
                    if tide_data and tide_data[1] and len(tide_data[1]) > 0:
                        tide_value = tide_data[1][0].water_level
            except Exception as e:
                print(f"Error fetching tide data: {e}")
            
            # Extract the required data for our forecast
            forecast = {
                "spot_id": spot["id"],
                "timestamp": datetime.datetime.now(timezone.utc).isoformat(),
                "wave_height": current_forecast.minimum_breaking_height,  # Using min breaking height as requested
                "tide": tide_value,
                "wind_speed": current_forecast.wind_speed,
                "wind_direction": current_forecast.wind_direction,
                "swell_components": {}
            }
            
            # Extract swell components (up to 3)
            if hasattr(current_forecast, 'swell_components') and current_forecast.swell_components:
                swell_components = current_forecast.swell_components
                component_names = ["primary", "secondary", "tertiary"]
                
                for i, component_name in enumerate(component_names):
                    if i < len(swell_components):
                        swell = swell_components[i]
                        forecast["swell_components"][component_name] = {
                            "height": swell.wave_height,
                            "period": swell.period,
                            "direction": swell.direction
                        }
            
            return forecast
        else:
            print(f"No forecast data available for {spot['name']}")
            return None
            
    except Exception as e:
        print(f"Error fetching forecast for {spot['name']}: {e}")
        return None

def process_forecast_data(forecast_data):
    """Process forecast data into our database format
    
    Args:
        forecast_data (dict): Forecast data from fetch_forecast_for_spot
        
    Returns:
        dict: Formatted forecast data ready for database insertion
    """
    # The data is already in the correct format from fetch_forecast_for_spot
    # This function is kept for potential future processing needs
    return forecast_data

def update_spot_forecast(spot_id, forecast):
    """Update the forecast data for a specific spot
    
    Args:
        spot_id (str): ID of the surf spot
        forecast (dict): Forecast data for the spot
    """
    # First, delete old forecasts for this spot
    now = datetime.datetime.now(timezone.utc).isoformat()
    supabase.table("spot_forecasts").delete().eq("spot_id", spot_id).execute()
    
    # Then insert the new forecast
    supabase.table("spot_forecasts").insert(forecast).execute()

def update_all_spot_forecasts():
    """Update forecasts for all spots"""
    spots = get_all_surf_spots()
    updated_count = 0
    
    for spot in spots:
        forecast = fetch_forecast_for_spot(spot)
        if forecast:
            # Process the forecast data if needed
            processed_forecast = process_forecast_data(forecast)
            
            # Update the database
            update_spot_forecast(spot["id"], processed_forecast)
            updated_count += 1
    
    print(f"Updated forecasts for {updated_count}/{len(spots)} spots at {datetime.datetime.now()}")

# For testing the script directly
if __name__ == "__main__":
    update_all_spot_forecasts()