import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface UseUserProfileResult {
  username: string | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook to access the current user's profile information
 */
export function useUserProfile(): UseUserProfileResult {
  const { user, getUserProfile } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setUsername(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { username: fetchedUsername, error: profileError } = await getUserProfile();
      
      if (profileError) {
        setError(profileError.message);
      } else {
        setUsername(fetchedUsername);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    username,
    loading,
    error,
    refreshProfile: fetchProfile
  };
}
