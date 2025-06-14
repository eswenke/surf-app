import { useState, useEffect, useCallback } from 'react';
import { SpotData } from './useSpotData';
import api, { Spot } from '../services/api';


export const useSpotSearch = (searchTerm: string = '') => {
  const [results, setResults] = useState<SpotData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allSpots, setAllSpots] = useState<Spot[]>([]);

  // Fetch all spots once when the hook is initialized
  useEffect(() => {
    const fetchAllSpots = async () => {
      setLoading(true);
      try {
        const response = await api.spots.getAll();
        if (response.error) {
          console.warn('API error:', response.error);
          // Don't throw, continue with empty spots
        }
        if (response.data && response.data.length > 0) {
          setAllSpots(response.data);
        } else {
          console.warn('No spots returned from API or API error occurred');
          // Set empty array to avoid undefined errors
          setAllSpots([]);
        }
      } catch (err) {
        console.error('Error fetching spots:', err);
        // Don't set error state, just log it
        // Set empty array to avoid undefined errors
        setAllSpots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSpots();
  }, []);

  // Filter spots based on search term whenever it changes
  useEffect(() => {
    const searchSpots = () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!searchTerm.trim()) {
          setResults([]);
          setLoading(false);
          return;
        }
        
        const term = searchTerm.toLowerCase();
        const filteredSpots = allSpots.filter(spot => 
          spot.name.toLowerCase().includes(term) || 
          (spot.description && spot.description.toLowerCase().includes(term))
        );
        
        // Convert Spot to SpotData format
        const formattedResults: SpotData[] = filteredSpots.map(spot => ({
          id: spot.id,
          name: spot.name,
          description: spot.description || '',
          difficulty: spot.difficulty_rating,
          lat: spot.latitude,
          lon: spot.longitude
        }));
        
        setResults(formattedResults);
      } catch (err) {
        setError('An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };

    searchSpots();
  }, [searchTerm, allSpots]);

  return { results, loading, error };
};

// Helper function to get all spots from the API
export const getAllSpots = async (): Promise<SpotData[]> => {
  try {
    const response = await api.spots.getAll();
    if (response.error || !response.data) {
      console.error('Error fetching spots:', response.error);
      return [];
    }
    
    // Convert Spot to SpotData format
    return response.data.map(spot => ({
      id: spot.id,
      name: spot.name,
      description: spot.description || '',
      difficulty: spot.difficulty_rating,
      lat: spot.latitude,
      lon: spot.longitude
    }));
  } catch (error) {
    console.error('Error fetching all spots:', error);
    return [];
  }
};
