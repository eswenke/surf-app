
"""
Test script to verify that the forecast service is correctly populating the database
with forecast data for the existing spots.

This script:
1. Connects to Supabase
2. Retrieves all spots from the surf_spots table
3. For each spot, checks if there's a corresponding forecast in the surf_forecasts table
4. Optionally triggers the forecast service to update forecasts for all spots
5. Reports the results

Usage:
    python test_forecast_service.py [--update]

Options:
    --update    Trigger the forecast service to update forecasts for all spots
"""

import sys
import os
import argparse
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file first
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

# Verify that required environment variables are set
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("\n\033[91mERROR: Missing required environment variables.\033[0m")
    print("Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file.")
    print(f"Looking for .env file at: {env_path}")
    sys.exit(1)

# Import the forecast service and database client
from app.services.forecast_service import fetch_forecast_for_spot
from supabase import create_client, Client

def connect_to_db():
    """Connect to Supabase and return the client."""
    try:
        # Create a new Supabase client directly using environment variables
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase successfully.")
        return supabase
    except Exception as e:
        print(f"\n\033[91mError connecting to Supabase: {e}\033[0m")
        print("Please check your SUPABASE_URL and SUPABASE_KEY environment variables.")
        sys.exit(1)

def get_all_spots(supabase):
    """Get all spots from the surf_spots table."""
    response = supabase.table("surf_spots").select("*").execute()
    spots = response.data
    print(f"Found {len(spots)} spots in the database.")
    return spots

def check_forecasts(supabase, spots):
    """Check if there are forecasts for each spot in the database and retrieve detailed forecast information."""
    print("\n" + "=" * 80)
    print("CHECKING FORECASTS IN SUPABASE DATABASE")
    print("=" * 80)
    
    results = []
    
    for i, spot in enumerate(spots):
        spot_id = spot['id']
        print(f"\n[{i+1}/{len(spots)}] Checking forecast for: {spot['name']} (ID: {spot_id})")
        
        # Query Supabase for the latest forecast
        response = supabase.table("surf_forecasts") \
            .select("*") \
            .eq("spot_id", spot_id) \
            .order("timestamp", desc=True) \
            .limit(1) \
            .execute()
        
        forecasts = response.data
        forecast = forecasts[0] if forecasts else None
        
        if forecast:
            print(f"  ✓ Found forecast in database")
            
            # Parse timestamp and calculate age
            forecast_time = None
            age = None
            age_str = "Unknown"
            
            try:
                # Parse the timestamp string to a datetime object if needed
                if isinstance(forecast['timestamp'], str):
                    forecast_time = datetime.fromisoformat(forecast['timestamp'].replace('Z', '+00:00'))
                else:
                    forecast_time = forecast['timestamp']
                
                now = datetime.now().astimezone()  # Get current time with timezone
                age = now - forecast_time
                age_str = str(age)
                
                # Check if forecast is fresh (less than 24 hours old)
                is_fresh = age.total_seconds() < 24 * 3600
                freshness = "FRESH" if is_fresh else "STALE"
                print(f"  - Age: {age_str} [{freshness}]")
            except Exception as e:
                print(f"  - Error calculating forecast age: {e}")
            
            # Extract swell components if available
            swell_components = forecast.get('swell_components', {})
            if isinstance(swell_components, str):
                try:
                    # Try to parse JSON string if stored that way
                    import json
                    swell_components = json.loads(swell_components)
                except:
                    swell_components = {}
            
            # Create detailed result object
            result = {
                'spot_id': spot_id,
                'name': spot['name'],
                'has_forecast': True,
                'forecast_id': forecast['id'],
                'timestamp': forecast['timestamp'],
                'wave_height': forecast['wave_height'],
                'tide': forecast['tide'],
                'tide_station_id': forecast.get('tide_station_id'),
                'tide_station_name': forecast.get('tide_station_name'),
                'wind_speed': forecast['wind_speed'],
                'wind_direction': forecast['wind_direction'],
                'swell_components': swell_components,
                'has_swell': bool(swell_components),
                'forecast_age': age_str,
                'forecast_age_seconds': age.total_seconds() if age else None,
                'raw_forecast': forecast  # Store the complete forecast for reference
            }
        else:
            print(f"  ✗ No forecast found in database")
            result = {
                'spot_id': spot_id,
                'name': spot['name'],
                'has_forecast': False,
                'forecast_time': None,
                'wave_height': None,
                'tide': None,
                'wind_speed': None,
                'wind_direction': None,
                'swell_components': {},
                'has_swell': False,
                'forecast_age': None,
                'forecast_age_seconds': None,
                'raw_forecast': None
            }
        
        results.append(result)
    
    return results

def update_forecasts(supabase, spots):
    """Update forecasts for all spots using SurfPy and store in Supabase."""
    print("\n" + "=" * 80)
    print("UPDATING FORECASTS FOR ALL SPOTS")
    print("=" * 80)
    
    # Import surfpy here to avoid import errors if it's not needed
    try:
        import surfpy
        from app.services.forecast_service import fetch_forecast_for_spot, process_forecast_data
    except ImportError as e:
        print(f"\n\033[91mERROR: Could not import surfpy or forecast service: {e}\033[0m")
        print("Make sure surfpy is installed and the forecast_service module is available.")
        return []
    
    results = []
    for i, spot in enumerate(spots):
        print(f"\n[{i+1}/{len(spots)}] Fetching forecast for: {spot['name']} (ID: {spot['id']})")
        print(f"Location: {spot['latitude']}, {spot['longitude']}")
        print("-" * 50)
        
        try:
            # Call the forecast service function directly to get forecast data
            forecast = fetch_forecast_for_spot(spot)
            
            if forecast:
                # Display the retrieved forecast data
                print(f"  \033[92m✓\033[0m Successfully retrieved forecast data from SurfPy:")
                print(f"    - Wave Height: {forecast['wave_height']:.2f} ft")
                print(f"    - Tide: {forecast['tide']:.2f} ft" if forecast['tide'] is not None else "    - Tide: N/A")
                print(f"    - Wind: {forecast['wind_speed']:.1f} kts @ {forecast['wind_direction']:.0f}°")
                
                # Display swell component information
                if forecast['swell_components']:
                    print(f"    - Swell Components: {len(forecast['swell_components'])}")
                    for name, swell in forecast['swell_components'].items():
                        print(f"      * {name.capitalize()}: {swell['height']:.1f}ft @ {swell['period']:.1f}s from {swell['direction']:.0f}°")
                else:
                    print("    - Swell Components: None")
                
                print(f"    - Timestamp: {forecast['timestamp']}")
                
                # Store forecast in Supabase
                try:
                    # Process forecast data if needed
                    processed_forecast = process_forecast_data(forecast)
                    
                    # Check if there's an existing forecast to update
                    existing_response = supabase.table("surf_forecasts") \
                        .select("id") \
                        .eq("spot_id", spot['id']) \
                        .order("timestamp", desc=True) \
                        .limit(1) \
                        .execute()
                    
                    existing_forecasts = existing_response.data
                    
                    if existing_forecasts:
                        # Update existing forecast
                        forecast_id = existing_forecasts[0]['id']
                        update_response = supabase.table("surf_forecasts") \
                            .update(processed_forecast) \
                            .eq("id", forecast_id) \
                            .execute()
                        print(f"    - Updated existing forecast record (ID: {forecast_id})")
                    else:
                        # Insert new forecast
                        insert_response = supabase.table("surf_forecasts") \
                            .insert(processed_forecast) \
                            .execute()
                        print("    - Created new forecast record")
                    
                    print(f"  \033[92m✓\033[0m Successfully stored forecast in Supabase")
                    
                    # Store the result for summary
                    results.append({
                        'spot_id': spot['id'],
                        'name': spot['name'],
                        'success': True,
                        'forecast': forecast
                    })
                except Exception as db_error:
                    print(f"  \033[91m✗\033[0m Error storing forecast in Supabase: {str(db_error)}")
                    results.append({
                        'spot_id': spot['id'],
                        'name': spot['name'],
                        'success': False,
                        'error': f"Database error: {str(db_error)}"
                    })
            else:
                print(f"  \033[91m✗\033[0m No forecast data returned from SurfPy for {spot['name']}")
                results.append({
                    'spot_id': spot['id'],
                    'name': spot['name'],
                    'success': False,
                    'error': 'No forecast data returned'
                })
        except Exception as e:
            print(f"  \033[91m✗\033[0m Error updating forecast for {spot['name']}: {str(e)}")
            results.append({
                'spot_id': spot['id'],
                'name': spot['name'],
                'success': False,
                'error': str(e)
            })
    
    # Print summary
    print("\n" + "=" * 80)
    print("FORECAST UPDATE SUMMARY")
    print("=" * 80)
    
    success_count = sum(1 for r in results if r['success'])
    print(f"Successfully updated {success_count}/{len(spots)} forecasts")
    
    if success_count < len(spots):
        print("\nFailed updates:")
        for r in results:
            if not r['success']:
                print(f"  - {r['name']}: {r.get('error', 'Unknown error')}")
    
    print("=" * 80)
    return results

def print_results(results):
    """Print the results in a formatted table and detailed forecast information."""
    print("\n" + "=" * 80)
    print("FORECAST STATUS SUMMARY")
    print("=" * 80)
    
    # Count statistics
    total_spots = len(results)
    spots_with_forecasts = sum(1 for r in results if r['has_forecast'])
    fresh_forecasts = sum(1 for r in results if r['has_forecast'] and r.get('forecast_age_seconds', float('inf')) < 24 * 3600)
    stale_forecasts = spots_with_forecasts - fresh_forecasts
    missing_forecasts = total_spots - spots_with_forecasts
    
    # Print statistics
    print(f"Total spots: {total_spots}")
    print(f"Spots with forecasts: {spots_with_forecasts}/{total_spots} ({spots_with_forecasts/total_spots*100:.1f}%)")
    print(f"Fresh forecasts (<24h): {fresh_forecasts}/{total_spots} ({fresh_forecasts/total_spots*100:.1f}%)")
    print(f"Stale forecasts (>24h): {stale_forecasts}/{total_spots} ({stale_forecasts/total_spots*100:.1f}%)")
    print(f"Missing forecasts: {missing_forecasts}/{total_spots} ({missing_forecasts/total_spots*100:.1f}%)")
    
    # Print table header
    print("\nDetailed Forecast Status:")
    print("-" * 120)
    print(f"{'ID':<5} {'Name':<20} {'Status':<10} {'Wave Height':<12} {'Tide':<8} {'Wind':<20} {'Swell':<8} {'Age':<15}")
    print("-" * 120)
    
    # Print each spot's forecast data
    for result in results:
        # Determine status
        if not result['has_forecast']:
            status = "MISSING"
        elif result.get('forecast_age_seconds', float('inf')) < 24 * 3600:
            status = "FRESH"
        else:
            status = "STALE"
        
        # Format wave height
        wave_height = f"{result['wave_height']:.1f} ft" if result['wave_height'] is not None else 'N/A'
        
        # Format tide with station info if available
        if result['tide'] is not None:
            tide = f"{result['tide']:.1f} ft"
            # Add station info to detailed section later
        else:
            tide = 'N/A'
        
        # Format wind info
        if result['wind_speed'] is not None and result['wind_direction'] is not None:
            wind_info = f"{result['wind_speed']:.1f} kts @ {result['wind_direction']:.0f}°"
        else:
            wind_info = 'N/A'
        
        # Format age
        age_display = result['forecast_age'][:14] if result['forecast_age'] else 'N/A'
        
        # Print the row
        print(f"{result['spot_id']:<5} {result['name'][:19]:<20} {status:<10} "
              f"{wave_height:<12} {tide:<8} {wind_info:<20} "
              f"{str(result['has_swell']):<8} {age_display:<15}")
    
    # Print detailed tide station information
    print("\n" + "=" * 80)
    print("TIDE STATION INFORMATION")
    print("=" * 80)
    
    for result in results:
        if result['has_forecast'] and result['tide'] is not None:
            station_id = result.get('tide_station_id', 'Unknown')
            station_name = result.get('tide_station_name', 'Unknown')
            print(f"{result['name']}:")
            print(f"  - Tide: {result['tide']:.2f} ft")
            print(f"  - Station ID: {station_id}")
            print(f"  - Station Name: {station_name}")
    
    # Print detailed swell information for spots with forecasts
    print("\n" + "=" * 80)
    print("DETAILED SWELL INFORMATION")
    print("=" * 80)
    
    for result in results:
        if result['has_forecast'] and result['has_swell']:
            print(f"\n{result['name']} (ID: {result['spot_id']})")
            print(f"Forecast time: {result['timestamp']}")
            if 'forecast_age' in result:
                print(f"Age: {result['forecast_age']}")
            
            # Print swell components
            swell_components = result.get('swell_components', {})
            if swell_components:
                print("Swell components:")
                for name, swell in swell_components.items():
                    if isinstance(swell, dict):
                        height = swell.get('height', 'N/A')
                        period = swell.get('period', 'N/A')
                        direction = swell.get('direction', 'N/A')
                        print(f"  - {name.capitalize()}: {height}ft @ {period}s from {direction}°")
            else:
                print("No swell components available")
    
    print("\n" + "=" * 80)

def main():
    """Main function to run the test script."""
    print("\n" + "=" * 80)
    print("SURF FORECAST SERVICE TEST")
    print("=" * 80)
    print("This script checks if forecasts are properly stored in Supabase")
    print("and can trigger forecast updates using the SurfPy package.")
    print("=" * 80)
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the forecast service.')
    parser.add_argument('--update', action='store_true', help='Update forecasts for all spots')
    parser.add_argument('--verbose', action='store_true', help='Show detailed output')
    args = parser.parse_args()
    
    try:
        # Connect to Supabase
        print("\nConnecting to Supabase...")
        supabase = connect_to_db()
        
        # Get all spots from the database
        print("\nRetrieving surf spots from database...")
        spots = get_all_spots(supabase)
        
        if not spots:
            print("\n⚠️ No spots found in the database. Exiting.")
            return
        
        # Check current forecasts in database
        results = check_forecasts(supabase, spots)
        
        # Update forecasts if requested
        if args.update:
            print("\nUpdate flag detected. Will update forecasts for all spots.")
            update_results = update_forecasts(supabase, spots)
            
            # Re-check forecasts after update to see the changes
            print("\nRe-checking forecasts after update...")
            results = check_forecasts(supabase, spots)
        
        # Print summary results
        print_results(results)
        
        # Final status message
        missing_count = sum(1 for r in results if not r['has_forecast'])
        stale_count = sum(1 for r in results if r['has_forecast'] and 
                         r.get('forecast_age_seconds', float('inf')) >= 24 * 3600)
        fresh_count = len(results) - missing_count - stale_count
        
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        if missing_count == 0 and stale_count == 0:
            print("✅ SUCCESS: All spots have fresh forecasts!")
            print("The forecast service is working correctly.")
        else:
            if missing_count > 0:
                print(f"⚠️ WARNING: {missing_count} spots are missing forecasts.")
            if stale_count > 0:
                print(f"⚠️ WARNING: {stale_count} spots have stale forecasts (older than 24 hours).")
            if fresh_count > 0:
                print(f"✅ {fresh_count} spots have fresh forecasts.")
                
            if not args.update:
                print("\nTo update all forecasts, run with the --update flag:")
                print("  python -m backend.tests.test_forecast_service --update")
        
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ ERROR: An unexpected error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    main()
