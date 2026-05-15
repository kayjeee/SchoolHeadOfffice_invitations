import { useEffect, useRef, useCallback } from 'react';
import { UsersAPI } from '@/lib/api/users-api';

const HEARTBEAT_INTERVAL_MS = 25_000; // 25 seconds

/**
 * usePresence hook
 *
 * Sends a heartbeat to the backend every 25 seconds to track user presence.
 * Only fires when the document is visible to optimize resources.
 *
 * @param userId The unique ID of the current user (Auth0 ID or Database ID)
 */
export function usePresence(userId?: string) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = useCallback(async () => {
    if (!userId) return;

    try {
      // Robustly handle ID as string
      // The backend now handles both Auth0 ID and internal database ID.
      // Priority: Auth0 sub (userId) passed from layout.
      const id = userId.toString();
      console.log("Presence Active for:", id);
      await UsersAPI.heartbeat(id);
    } catch (error) {
      // Fire-and-forget: we don't want to interrupt the user experience if heartbeat fails
      console.warn('📡 [Presence] Heartbeat failed:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

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
  }, [userId, sendHeartbeat]);
}
