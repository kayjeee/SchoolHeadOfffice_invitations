import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useSWRConfig } from 'swr';
import { apiClient, syncApiClientToken } from '@/lib/api/api-client';

/**
 * Custom hook to handle API authentication and provide access to the apiClient.
 * It automatically fetches the Auth0 access token from our internal endpoint
 * and synchronizes it with the apiClient singleton.
 */
export function useApi() {
  const { user, isLoading: isUserLoading } = useUser();
  const { cache, mutate } = useSWRConfig();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const prevUserSub = useRef<string | null>(null);

  const fetchToken = useCallback(async () => {
    if (!user) {
      apiClient.clearAuth();
      syncApiClientToken(null);
      setAccessToken(null);
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
        syncApiClientToken(token);
        if (user?.email) {
          apiClient.setUserEmail(user.email);
        }
      } else if (response.status === 401) {
        // Not authenticated with Auth0
        setAccessToken(null);
        syncApiClientToken(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [useApi] Token endpoint error:', errorData);
        setAccessToken(null);
        syncApiClientToken(null);
      }
    } catch (err: any) {
      console.error('❌ [useApi] Error fetching access token:', err);
      setAccessToken(null);
      syncApiClientToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isUserLoading) {
      // 🕵️ Detect user profile change/logout to purge local caches
      if (prevUserSub.current && prevUserSub.current !== user?.sub) {
        console.log('🔄 [useApi] User profile changed. Purging SWR cache...');

        // Clear global SWR cache to prevent context leak (69c3a1d...)
        if (cache && typeof (cache as any).clear === 'function') {
          (cache as any).clear();
        } else {
          // Fallback: trigger global revalidation or targeted key clears
          mutate(() => true, undefined, { revalidate: false });
        }

        apiClient.clearAuth();
        syncApiClientToken(null);
      }

      prevUserSub.current = user?.sub || null;
      fetchToken();
    }
  }, [user, isUserLoading, fetchToken, cache, mutate]);

  return {
    user,
    accessToken,
    isLoading: isLoading || isUserLoading,
    error,
    apiClient,
    refreshUser: fetchToken
  };
}
