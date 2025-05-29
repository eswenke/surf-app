#!/usr/bin/env python
"""
Debug script for SurfPy wave data fetching
"""
import sys
import traceback
import logging
from datetime import datetime

import surfpy

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_atlantic_model():
    """Test the Atlantic GFS wave model"""
    try:
        logger.info("Testing Atlantic GFS wave model...")
        ri_wave_location = surfpy.Location(41.35, -71.4, altitude=30.0, name='Rhode Island Coast')
        ri_wave_location.depth = 30.0
        ri_wave_location.angle = 145.0
        ri_wave_location.slope = 0.02
        
        # Print available models
        logger.info("Available wave models in SurfPy:")
        for attr in dir(surfpy.wavemodel):
            if attr.endswith('_wave_model'):
                logger.info(f"  - {attr}")
        
        # Try Atlantic model
        atlantic_wave_model = surfpy.wavemodel.atlantic_gfs_wave_model()
        logger.info(f"Model created: {atlantic_wave_model}")
        
        # Inspect model attributes
        logger.info("Atlantic model attributes:")
        for attr in ['name', 'subset', 'description', 'bottom_left', 'top_right', 'location_resolution', 'time_resolution', 'max_index']:
            if hasattr(atlantic_wave_model, attr):
                logger.info(f"  - {attr}: {getattr(atlantic_wave_model, attr)}")
        
        # Fetch data with detailed logging
        logger.info("Fetching GFS Wave Data (small window)...")
        num_hours_to_forecast = 6  # Start with a small forecast window
        
        logger.info("Fetching GRIB data...")
        wave_grib_data = atlantic_wave_model.fetch_grib_datas(0, num_hours_to_forecast)
        logger.info(f"GRIB data fetched: {len(wave_grib_data) if wave_grib_data else 'None'}")
        
        if not wave_grib_data:
            logger.error("Failed to fetch GRIB data")
            return False
            
        logger.info("Parsing GRIB data...")
        raw_wave_data = atlantic_wave_model.parse_grib_datas(ri_wave_location, wave_grib_data)
        logger.info(f"Raw wave data parsed: {len(raw_wave_data) if raw_wave_data else 'None'}")
        
        if not raw_wave_data:
            logger.error("Failed to parse GRIB data")
            return False
            
        logger.info("Converting to buoy data...")
        data = atlantic_wave_model.to_buoy_data(raw_wave_data)
        logger.info(f"Buoy data created: {len(data) if data else 'None'}")
        
        if not data:
            logger.error("Failed to convert to buoy data")
            return False
            
        logger.info("Atlantic model test successful!")
        return True
        
    except Exception as e:
        logger.error(f"Error in Atlantic model test: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def test_global_model():
    """Test the Global GFS wave model as an alternative"""
    try:
        logger.info("Testing Global GFS wave model...")
        wave_location = surfpy.Location(41.35, -71.4, altitude=30.0, name='Rhode Island Coast')
        wave_location.depth = 30.0
        wave_location.angle = 145.0
        wave_location.slope = 0.02
        
        # Try Global model
        global_wave_model = surfpy.wavemodel.global_gfs_wave_model_25km()
        logger.info(f"Model created: {global_wave_model}")
        
        # Inspect model attributes
        logger.info("Global model attributes:")
        for attr in ['name', 'subset', 'description', 'bottom_left', 'top_right', 'location_resolution', 'time_resolution', 'max_index']:
            if hasattr(global_wave_model, attr):
                logger.info(f"  - {attr}: {getattr(global_wave_model, attr)}")
        
        # Fetch data with detailed logging
        logger.info("Fetching Global GFS Wave Data...")
        num_hours_to_forecast = 6  # Start with a small forecast window
        
        logger.info("Fetching GRIB data...")
        wave_grib_data = global_wave_model.fetch_grib_datas(0, num_hours_to_forecast, wave_location)
        logger.info(f"GRIB data fetched: {len(wave_grib_data) if wave_grib_data else 'None'}")
        
        if not wave_grib_data:
            logger.error("Failed to fetch GRIB data")
            return False
            
        logger.info("Parsing GRIB data...")
        raw_wave_data = global_wave_model.parse_grib_datas(wave_location, wave_grib_data)
        logger.info(f"Raw wave data parsed: {len(raw_wave_data) if raw_wave_data else 'None'}")
        
        if not raw_wave_data:
            logger.error("Failed to parse GRIB data")
            return False
            
        logger.info("Converting to buoy data...")
        data = global_wave_model.to_buoy_data(raw_wave_data)
        logger.info(f"Buoy data created: {len(data) if data else 'None'}")
        
        if not data:
            logger.error("Failed to convert to buoy data")
            return False
            
        logger.info("Global model test successful!")
        return True
        
    except Exception as e:
        logger.error(f"Error in Global model test: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def test_surfpy_version():
    """Check the SurfPy version and available functionality"""
    try:
        logger.info(f"SurfPy version: {surfpy.__version__ if hasattr(surfpy, '__version__') else 'Unknown'}")
        
        # Check if surfpy has a version attribute directly
        if not hasattr(surfpy, '__version__'):
            # Try to get version from setup.py or other means
            logger.info("Attempting to determine SurfPy version from package structure...")
            try:
                import pkg_resources
                version = pkg_resources.get_distribution("surfpy").version
                logger.info(f"SurfPy version from pkg_resources: {version}")
            except:
                logger.info("Could not determine version from pkg_resources")
        
        logger.info("SurfPy available modules:")
        for module in dir(surfpy):
            if not module.startswith('__'):
                logger.info(f"  - {module}")
        return True
    except Exception as e:
        logger.error(f"Error checking SurfPy version: {str(e)}")
        return False

if __name__ == '__main__':
    logger.info("Starting SurfPy debugging tests...")
    
    # Check SurfPy version
    test_surfpy_version()
    
    # Test Atlantic model (original approach)
    atlantic_result = test_atlantic_model()
    
    # If Atlantic model fails, try Global model
    if not atlantic_result:
        logger.info("Atlantic model failed, trying Global model...")
        global_result = test_global_model()
        
        if global_result:
            logger.info("RECOMMENDATION: Update your code to use the Global model instead of Atlantic")
        else:
            logger.error("Both models failed. Check network connectivity and SurfPy installation")
    
    logger.info("Debugging complete")
