'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

/**
 * Hook to retrieve currently authenticated user details.
 */
export function useAuth() {
  const { user, isLoading, error } = useUser();

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !isLoading,
  };
}
