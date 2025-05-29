import { useState, useEffect, useCallback } from 'react';
import api, { Review, ReviewCreate, ReviewUpdate } from '../services/api';

interface UseReviewsOptions {
  spotId?: number;
  userId?: string;
  autoLoad?: boolean;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { spotId, userId, autoLoad = true } = options;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await api.reviews.getAll(spotId, userId);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setReviews(response.data);
    }
    
    setLoading(false);
  }, [spotId, userId]);
  
  // Create a new review
  const createReview = async (review: ReviewCreate) => {
    setLoading(true);
    setError(null);
    
    const response = await api.reviews.create(review);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    } else if (response.data) {
      // Add the new review to the list
      setReviews(prev => [...prev, response.data as Review]);
      setLoading(false);
      return response.data;
    }
    
    setLoading(false);
    return null;
  };
  
  // Update an existing review
  const updateReview = async (reviewId: number, updates: ReviewUpdate) => {
    setLoading(true);
    setError(null);
    
    const response = await api.reviews.update(reviewId, updates);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    } else if (response.data) {
      // Update the review in the list
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...response.data } : review
        )
      );
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };
  
  // Delete a review
  const deleteReview = async (reviewId: number) => {
    setLoading(true);
    setError(null);
    
    const response = await api.reviews.delete(reviewId);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    } else {
      // Remove the review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setLoading(false);
      return true;
    }
  };
  
  // Load reviews on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchReviews();
    }
  }, [fetchReviews, autoLoad]);
  
  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview
  };
}
