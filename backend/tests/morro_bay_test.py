import sys
import matplotlib.pyplot as plt
import surfpy


if __name__=='__main__':
    # Morro Bay coordinates: 35.3708, -120.8512
    morro_wave_location = surfpy.Location(35.3708, -120.8512, altitude=0.0, name='Morro Bay')
    morro_wave_location.depth = 30.0
    morro_wave_location.angle = 270.0  # West-facing beach
    morro_wave_location.slope = 0.02
    west_coast_wave_model = surfpy.wavemodel.us_west_coast_gfs_wave_model()

    print('Fetching GFS Wave Data for Morro Bay')
    num_hours_to_forecast = 24  # One day forecast. Change to 384 to get a 16 day forecast
    wave_grib_data = west_coast_wave_model.fetch_grib_datas(0, num_hours_to_forecast, morro_wave_location)
    raw_wave_data = west_coast_wave_model.parse_grib_datas(morro_wave_location, wave_grib_data)
    
    if raw_wave_data:
        data = west_coast_wave_model.to_buoy_data(raw_wave_data)
    else:
        print('Failed to fetch wave forecast data')
        sys.exit(1)

    print('Fetching local weather data')
    morro_wind_location = surfpy.Location(35.3708, -120.8512, altitude=0.0, name='Morro Bay')
    weather_data = surfpy.WeatherApi.fetch_hourly_forecast(morro_wind_location)
    surfpy.merge_wave_weather_data(data, weather_data)

    for dat in data:
        dat.solve_breaking_wave_heights(morro_wave_location)
        dat.change_units(surfpy.units.Units.english)
    json_data = surfpy.serialize(data)
    with open('morro_bay_forecast.json', 'w') as outfile:
        outfile.write(json_data)

    maxs = [x.maximum_breaking_height for x in data]
    mins = [x.minimum_breaking_height for x in data]
    summary = [x.wave_summary.wave_height for x in data]
    times = [x.date for x in data]

    # Create a figure with a specific size for better readability
    plt.figure(figsize=(12, 6))
    
    # Plot the data
    plt.plot(times, maxs, c='green', label='Maximum Breaking Height')
    plt.plot(times, mins, c='blue', label='Minimum Breaking Height')
    plt.plot(times, summary, c='red', label='Wave Height')
    
    # Format the x-axis dates
    from matplotlib.dates import DateFormatter, HourLocator
    ax = plt.gca()
    
    # Set major ticks every 6 hours
    ax.xaxis.set_major_locator(HourLocator(interval=6))
    
    # Format the dates as 'MM/DD HH:MM'
    date_format = DateFormatter('%m/%d\n%H:%M')
    ax.xaxis.set_major_formatter(date_format)
    
    # Rotate the labels for better readability
    plt.xticks(rotation=0)
    
    # Add labels and grid
    plt.xlabel('Date and Time')
    plt.ylabel('Breaking Wave Height (ft)')
    plt.grid(True, alpha=0.3)
    plt.title('GFS Wave West Coast - Morro Bay: ' + west_coast_wave_model.latest_model_time().strftime('%d/%m/%Y %Hz'))
    
    # Add a legend
    plt.legend(loc='best')
    
    # Save the plot to a file instead of displaying it
    plt.savefig('morro_bay_wave_heights.png')
    print(f"Plot saved to morro_bay_wave_heights.png")
    plt.close()
