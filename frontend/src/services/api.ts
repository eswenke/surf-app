/**
 * API client for communicating with the backend
 */

// In production, this should be set to the deployed backend URL
// For local development, it defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
  // Spots endpoints
  spots: {
    /**
     * Get all surf spots
     */
    getAll: async () => {
      return fetchApi<Spot[]>('/spots');
    },
    
    /**
     * Get a specific spot by ID
     */
    getById: async (spotId: number) => {
      return fetchApi<Spot>(`/spots/${spotId}`);
    },
    
    /**
     * Get forecast for a specific spot
     */
    getForecast: async (spotId: number) => {
      return fetchApi<SpotForecast>(`/spots/${spotId}/forecast`);
    },
    
    /**
     * Save a spot for the current user
     */
    saveSpot: async (userId: string, spotId: number) => {
      return fetchApi<{ message: string }>('/user-spots', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, spot_id: spotId }),
      });
    },
    
    /**
     * Unsave a spot for the current user
     */
    unsaveSpot: async (userId: string, spotId: number) => {
      return fetchApi<{ message: string }>(`/user-spots`, {
        method: 'DELETE',
        body: JSON.stringify({ user_id: userId, spot_id: spotId }),
      });
    },
    
    /**
     * Get all spots saved by a user
     */
    getSavedSpots: async (userId: string) => {
      return fetchApi<Spot[]>(`/user-spots?user_id=${userId}`);
    },
  },
  
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
export interface Spot {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  difficulty_rating: number;
  created_at: string;
  updated_at: string;
  current_forecast?: SpotForecast;
}

export interface SpotForecast {
  spot_id: number;
  wave_height: number;
  tide?: number;
  wind_speed: number;
  wind_direction: number;
  swell_components: {
    primary?: {
      height: number;
      period: number;
      direction: number;
    };
    secondary?: {
      height: number;
      period: number;
      direction: number;
    };
    tertiary?: {
      height: number;
      period: number;
      direction: number;
    };
  };
  timestamp: string;
}

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
  spot_name?: string; // Name of the associated spot
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
