import datetime
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import FormatStrFormatter
import pytz
import math

import surfpy
from surfpy.weatherapi import WeatherApi


class WindPlots(object):

    def __init__(self):
        # Initialize the wind data container
        self.data = {}
        self.locations = {}

    def add_location(self, location_name, latitude, longitude):
        """Add a location to fetch wind data for"""
        self.locations[location_name] = {
            'latitude': latitude,
            'longitude': longitude,
            'data': None
        }
        return location_name in self.locations

    def fetch_wind_data(self, location_name, start_date, end_date):
        """Fetch wind data for the specified location and date range"""
        if location_name not in self.locations:
            print(f"Location {location_name} not found")
            return False
            
        location = self.locations[location_name]
        
        # Create a surfpy location object
        surf_location = surfpy.Location(
            location['latitude'], 
            location['longitude'],
            name=location_name
        )
        
        # Use the WeatherApi to fetch hourly forecast
        try:
            forecast_data = WeatherApi.fetch_hourly_forecast(surf_location)
            if not forecast_data:
                print(f"Failed to fetch forecast for {location_name}")
                return False
                
            # Filter the forecast data to the requested date range
            # Make sure start_date and end_date are timezone-aware
            aware_start_date = pytz.utc.localize(start_date) if start_date.tzinfo is None else start_date
            aware_end_date = pytz.utc.localize(end_date) if end_date.tzinfo is None else end_date
            
            filtered_data = []
            for hour in forecast_data:
                if aware_start_date <= hour.date <= aware_end_date:
                    filtered_data.append(hour)
                    
            # Store the filtered data
            location['data'] = filtered_data
            return len(filtered_data) > 0
        except Exception as e:
            print(f"Error fetching wind data: {e}")
            return False

    def plot_wind(self, location_name, save_path=None):
        """Plot wind speed with directional arrows for the specified location
        
        Args:
            location_name (str): Name of the location to plot
            save_path (str, optional): Path to save the plot. If None, a default path will be used.
        
        Returns:
            str: Path where the plot was saved
        """
        if location_name not in self.locations or not self.locations[location_name]['data']:
            print(f"No data available for {location_name}")
            return None
            
        location = self.locations[location_name]
        wind_data = location['data']
        
        # Extract dates and wind data
        # Convert UTC times from the API to local Pacific time for display
        pacific = pytz.timezone('US/Pacific')
        dates = [hour.date.astimezone(pacific) for hour in wind_data]
        
        # Convert wind speeds from mph to knots if they're in English units
        # and scale down by half as requested
        wind_speeds = []
        wind_gusts = []
        
        for hour in wind_data:
            # Check if we need to convert from mph to knots
            if hour.unit == surfpy.units.Units.english:
                # Convert mph to knots (1 mph ≈ 0.868976 knots) and scale down by half
                wind_speeds.append(hour.wind_speed * 0.868976 * 0.5 if hour.wind_speed is not None else None)
                if hasattr(hour, 'wind_gust') and hour.wind_gust is not None:
                    wind_gusts.append(hour.wind_gust * 0.868976 * 0.5)
                else:
                    wind_gusts.append(None)
            else:
                # Scale down by half
                wind_speeds.append(hour.wind_speed * 0.5 if hour.wind_speed is not None else None)
                if hasattr(hour, 'wind_gust') and hour.wind_gust is not None:
                    wind_gusts.append(hour.wind_gust * 0.5)
                else:
                    wind_gusts.append(None)
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Plot wind speed
        ax.plot(dates, wind_speeds, 'b-', linewidth=2, label='Wind Speed')
        
        # Plot wind gusts if available
        if any(gust is not None for gust in wind_gusts):
            ax.plot(dates, wind_gusts, 'r--', linewidth=1.5, label='Wind Gusts')
        
        # Add a simple legend for wind speed and gusts only
        ax.legend(loc='upper left')
        
        # Format the plot
        ax.set_title(f'{location_name}: Wind Speed')
        ax.set_xlabel('Date')
        ax.set_ylabel('Wind Speed (knots)')
        
        # Set up x-axis with 3-hour increments
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d\n%H:%M'))
        ax.xaxis.set_major_locator(mdates.HourLocator(interval=3))  # 3-hour intervals
        fig.autofmt_xdate()
        
        # Set y-axis to start at 0
        ax.set_ylim(bottom=0)
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        # Instead of showing the plot interactively, save it to a file
        if save_path is None:
            # Create a default filename based on location and current time
            current_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            save_path = f"{location_name.replace(' ', '_')}_{current_time}.png"
        
        plt.savefig(save_path)
        plt.close(fig)  # Close the figure to free memory
        
        return save_path


if __name__ == '__main__':
    wind_plots = WindPlots()
    
    # Add locations for San Luis Obispo area
    # Dictionary of location names and their coordinates
    slo_area_locations = {
        'San Luis Obispo': (35.2828, -120.6596),  # City center
        'Pismo Beach': (35.1428, -120.6412),      # Pismo Beach
        'Shell Beach': (35.1622, -120.6708),      # Shell Beach
        'Morro Bay': (35.3658, -120.8499),        # Morro Bay
        'Avila Beach': (35.1797, -120.7300)       # Avila Beach
    }
    
    # Add all locations to the wind plots
    for name, coords in slo_area_locations.items():
        wind_plots.add_location(name, coords[0], coords[1])
    
    # Select which location to use
    selected_location = 'Shell Beach'  # Change this to any of the locations above
    
    # Configure the number of days to forecast - reduced to 2 days
    num_days = 2  # Show a two-day span
    
    # Create timezone-aware dates in UTC to match the API data
    pacific = pytz.timezone('US/Pacific')
    now = datetime.datetime.now(pacific)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    ending_date = today + datetime.timedelta(days=num_days)
    
    # Convert to UTC for API request
    today_utc = today.astimezone(pytz.UTC)
    ending_date_utc = ending_date.astimezone(pytz.UTC)
    
    print(f"Fetching wind data for {selected_location} for {num_days} days")
    print(f"Local time range: {today.strftime('%Y-%m-%d %H:%M %Z')} to {ending_date.strftime('%Y-%m-%d %H:%M %Z')}")
    
    # Fetch and plot the wind data
    if wind_plots.fetch_wind_data(selected_location, today_utc, ending_date_utc):
        # Save the plot to a file instead of showing it
        saved_path = wind_plots.plot_wind(selected_location)
        if saved_path:
            print(f"Wind plot saved to: {saved_path}")
    else:
        print(f'Failed to fetch wind data for {selected_location}')
