import { useState, useEffect, useCallback } from 'react';
import api, { Spot, SpotForecast } from '../services/api';

// Define types for our spot data
export interface SpotData {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  lat: number; 
  lon: number;
  waveHeight?: string; // Optional, comes from forecast data if available
}

export const useSpotData = (spotId: number | undefined) => {
  const [spot, setSpot] = useState<SpotData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch spot data and forecast
  const fetchSpotData = useCallback(async () => {
    if (!spotId) {
      setError('No spot ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch spot details
      const spotResponse = await api.spots.getById(spotId);
      
      if (spotResponse.error || !spotResponse.data) {
        throw new Error(spotResponse.error || `Spot with ID ${spotId} not found`);
      }
      
      // Fetch spot forecast
      const forecastResponse = await api.spots.getForecast(spotId);
      
      if (forecastResponse.error) {
        console.warn('Could not fetch forecast:', forecastResponse.error);
      }
      
      // Convert API data to SpotData format
      const spotData: SpotData = {
        id: spotResponse.data.id,
        name: spotResponse.data.name,
        description: spotResponse.data.description || '',
        difficulty: spotResponse.data.difficulty_rating,
        lat: spotResponse.data.latitude,
        lon: spotResponse.data.longitude,
      };
      
      // Add wave height from forecast if available
      if (forecastResponse.data) {
        spotData.waveHeight = forecastResponse.data.wave_height ? 
          forecastResponse.data.wave_height.toString() + 'ft' : 
          undefined;
      }
      
      setSpot(spotData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    fetchSpotData();
  }, [fetchSpotData]);

  return { spot, loading, error };
};
