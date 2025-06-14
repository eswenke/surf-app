import { useState, useEffect } from 'react';
import api, { Spot } from '../services/api';

interface UseSavedSpotsOptions {
  userId: string | undefined;
  autoLoad?: boolean;
}

interface UseSavedSpotsReturn {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  saveSpot: (spotId: number) => Promise<void>;
  unsaveSpot: (spotId: number) => Promise<void>;
  refreshSpots: () => Promise<void>;
  isSaved: (spotId: number) => boolean;
}

export const useSavedSpots = ({ userId, autoLoad = false }: UseSavedSpotsOptions): UseSavedSpotsReturn => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSavedSpots = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user's saved spots with their details and forecasts
      const response = await api.spots.getSavedSpots(userId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setSpots(response.data || []);
    } catch (err) {
      console.error('Error fetching saved spots:', err);
      setError(err instanceof Error ? err.message : 'Failed to load saved spots');
    } finally {
      setLoading(false);
    }
  };
  
  const saveSpot = async (spotId: number) => {
    if (!userId) return;
    
    try {
      const response = await api.spots.saveSpot(userId, spotId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refresh the list
      await fetchSavedSpots();
    } catch (err) {
      console.error('Error saving spot:', err);
      setError(err instanceof Error ? err.message : 'Failed to save spot');
    }
  };
  
  const unsaveSpot = async (spotId: number) => {
    if (!userId) return;
    
    try {
      const response = await api.spots.unsaveSpot(userId, spotId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update local state
      setSpots(spots.filter(spot => spot.id !== spotId));
    } catch (err) {
      console.error('Error unsaving spot:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsave spot');
    }
  };
  
  const isSaved = (spotId: number) => {
    return spots.some(spot => spot.id === spotId);
  };
  
  useEffect(() => {
    if (userId && autoLoad) {
      fetchSavedSpots();
    }
  }, [userId]);
  
  return {
    spots,
    loading,
    error,
    saveSpot,
    unsaveSpot,
    refreshSpots: fetchSavedSpots,
    isSaved
  };
};
