/**
 * API client for communicating with the backend
 */

// In production, this should be set to the deployed backend URL
// For local development, it defaults to localhost
// Get the base URL from environment or default to localhost
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Add /api prefix only if it's not already included in the URL
const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: data.detail || `Error: ${response.status} ${response.statusText}` 
      };
    }
    
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export default {
  // Reviews endpoints
  reviews: {
    /**
     * Get all reviews, optionally filtered by spot_id or user_id
     */
    getAll: async (spotId?: number, userId?: string) => {
      let endpoint = '/reviews';
      const params = new URLSearchParams();
      
      if (spotId) params.append('spot_id', spotId.toString());
      if (userId) params.append('user_id', userId);
      
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      
      return fetchApi<Review[]>(endpoint);
    },
    
    /**
     * Get a specific review by ID
     */
    getById: async (reviewId: number) => {
      return fetchApi<Review>(`/reviews/${reviewId}`);
    },
    
    /**
     * Create a new review
     */
    create: async (review: ReviewCreate) => {
      return fetchApi<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(review),
      });
    },
    
    /**
     * Update an existing review
     */
    update: async (reviewId: number, updates: ReviewUpdate) => {
      return fetchApi<Review>(`/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    
    /**
     * Delete a review
     */
    delete: async (reviewId: number) => {
      return fetchApi<{ message: string }>(`/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    },
  },
};

// Types that match the backend models
export interface Review {
  id: number;
  spot_id: number;
  user_id: string; // This will store the username
  rating: number;
  comment: string;
  wave_height?: number;
  wind_condition?: string;
  weather_condition?: string;
  crowd_level?: number;
  created_at: string;
  updated_at?: string;
}

export interface ReviewCreate {
  spot_id: number;
  user_id: string; // This will store the username
  rating: number;
  comment: string;
  wave_height?: number;
  wind_condition?: string;
  weather_condition?: string;
  crowd_level?: number;
}

export interface ReviewUpdate {
  rating?: number;
  comment?: string;
  wave_height?: number;
  wind_condition?: string;
  weather_condition?: string;
  crowd_level?: number;
}
