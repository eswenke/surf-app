import sys
import matplotlib.pyplot as plt
import surfpy


if __name__=='__main__':
    # Shell Beach coordinates: 35.1553, -120.6724
    shell_wave_location = surfpy.Location(35.1553, -120.6724, altitude=0.0, name='Shell Beach')
    shell_wave_location.depth = 5.0
    shell_wave_location.angle = 195.0  # South-Southwest facing beach (225° is SW)
    shell_wave_location.slope = 0.01
    west_coast_wave_model = surfpy.wavemodel.us_west_coast_gfs_wave_model()

    print('Fetching GFS Wave Data for Shell Beach')
    num_hours_to_forecast = 24  # One day forecast. Change to 384 to get a 16 day forecast
    wave_grib_data = west_coast_wave_model.fetch_grib_datas(0, num_hours_to_forecast, shell_wave_location)
    raw_wave_data = west_coast_wave_model.parse_grib_datas(shell_wave_location, wave_grib_data)
    
    if raw_wave_data:
        data = west_coast_wave_model.to_buoy_data(raw_wave_data)
    else:
        print('Failed to fetch wave forecast data')
        sys.exit(1)

    print('Fetching local weather data')
    shell_wind_location = surfpy.Location(35.1553, -120.6724, altitude=0.0, name='Shell Beach')
    weather_data = surfpy.WeatherApi.fetch_hourly_forecast(shell_wind_location)
    surfpy.merge_wave_weather_data(data, weather_data)

    for dat in data:
        dat.solve_breaking_wave_heights(shell_wave_location)
        dat.change_units(surfpy.units.Units.english)
    json_data = surfpy.serialize(data)
    with open('shell_beach_forecast.json', 'w') as outfile:
        outfile.write(json_data)

    maxs = [x.maximum_breaking_height for x in data]
    mins = [x.minimum_breaking_height for x in data]
    avg_breaking = [(x.maximum_breaking_height + x.minimum_breaking_height) / 2 for x in data]
    summary = [x.wave_summary.wave_height for x in data]
    times = [x.date for x in data]

    # Create a figure with a specific size for better readability
    plt.figure(figsize=(12, 6))
    
    # Plot the data
    plt.plot(times, maxs, c='green', label='Maximum Breaking Height')
    plt.plot(times, mins, c='blue', label='Minimum Breaking Height')
    plt.plot(times, avg_breaking, c='red', label='Average Breaking Height')
    plt.plot(times, summary, c='gray', linestyle='--', alpha=0.5, label='Raw Wave Height')
    
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
    plt.title('GFS Wave West Coast - Shell Beach: ' + west_coast_wave_model.latest_model_time().strftime('%d/%m/%Y %Hz'))
    
    # Add a legend
    plt.legend(loc='best')
    
    # Save the plot to a file instead of displaying it
    plt.savefig('shell_beach_wave_heights.png')
    print(f"Plot saved to shell_beach_wave_heights.png")
    plt.close()
