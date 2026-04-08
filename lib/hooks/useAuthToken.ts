import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { apiClient } from '@/lib/api/api-client';

export function useAuthToken() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        try {
          // In a real application, you'd probably fetch the token from your own API
          // which has access to the user session and can call getAccessToken() from @auth0/nextjs-auth0/server
          // For this environment, we'll try to hit an internal endpoint if it exists or use a dummy for now
          // unless the user provided a specific way to get it.
          const response = await fetch('/api/auth/token');
          if (response.ok) {
            const { accessToken } = await response.json();
            apiClient.setAccessToken(accessToken);
          }
        } catch (error) {
          console.error('Error fetching auth token:', error);
        }
      } else if (!isLoading) {
        apiClient.setAccessToken(null);
      }
    };

    fetchToken();
  }, [user, isLoading]);
}
