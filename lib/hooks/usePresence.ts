import { useEffect, useRef, useCallback } from 'react';
import { UsersAPI } from '@/lib/api/users-api';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

/**
 * usePresence hook
 *
 * Sends a heartbeat to the backend every 30 seconds to track user presence.
 * Only fires when the document is visible to optimize resources.
 *
 * @param auth0Id The Auth0 ID of the current user
 */
export function usePresence(auth0Id?: string) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = useCallback(async () => {
    if (!auth0Id) return;

    try {
      await UsersAPI.heartbeat(auth0Id);
    } catch (error) {
      // Fire-and-forget: we don't want to interrupt the user experience if heartbeat fails
      console.warn('📡 [Presence] Heartbeat failed:', error);
    }
  }, [auth0Id]);

  useEffect(() => {
    if (!auth0Id) return;

    const startHeartbeat = () => {
      // Send immediately when starting/becoming visible
      sendHeartbeat();

      // Set up the interval
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    const stopHeartbeat = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    // Initial check
    if (document.visibilityState === 'visible') {
      startHeartbeat();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopHeartbeat();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth0Id, sendHeartbeat]);
}
