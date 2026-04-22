import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { apiClient } from '@/lib/api/api-client';

/**
 * Custom hook to handle API authentication and provide access to the apiClient.
 * It automatically fetches the Auth0 access token from our internal endpoint
 * and synchronizes it with the apiClient singleton.
 */
export function useApi() {
  const { user, isLoading: isUserLoading } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToken = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/token');

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;
        setAccessToken(token);
        apiClient.setAccessToken(token);
        if (user?.email) {
          apiClient.setUserEmail(user.email);
        }
      } else if (response.status === 401) {
        // Not authenticated with Auth0
        setAccessToken(null);
        apiClient.setAccessToken(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch access token');
      }
    } catch (err: any) {
      console.error('Error fetching access token:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isUserLoading) {
      fetchToken();
    }
  }, [user, isUserLoading, fetchToken]);

  return {
    user,
    accessToken,
    isLoading: isLoading || isUserLoading,
    error,
    apiClient,
    refreshUser: fetchToken
  };
}
