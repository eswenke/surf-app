import { useState, useEffect } from 'react';
import api, { Review } from '../services/api';

interface UseSpotReviewsProps {
  spotId?: number;
  limit?: number;
  autoLoad?: boolean;
}

interface UseSpotReviewsResult {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refreshReviews: () => Promise<void>;
}

/**
 * Custom hook to fetch reviews for a specific spot
 */
export function useSpotReviews({
  spotId,
  limit,
  autoLoad = true
}: UseSpotReviewsProps): UseSpotReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!spotId) {
      setReviews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.reviews.getAll(spotId);
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      const fetchedReviews = response.data || [];
      
      // If a limit is specified, only return that many reviews
      const limitedReviews = limit ? fetchedReviews.slice(0, limit) : fetchedReviews;
      
      setReviews(limitedReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && spotId) {
      fetchReviews();
    }
  }, [spotId]);

  return {
    reviews,
    loading,
    error,
    refreshReviews: fetchReviews
  };
}
