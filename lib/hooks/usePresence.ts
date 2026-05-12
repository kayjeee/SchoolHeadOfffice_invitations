import { useEffect, useRef, useCallback } from 'react';
import { UsersAPI } from '@/lib/api/users-api';

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

// Singleton to track last heartbeat across hook instances/remounts
let globalLastHeartbeat = 0;

export function usePresence(auth0Id: string | undefined) {
  const sendHeartbeat = useCallback(async () => {
    if (!auth0Id) return;

    // Guard: Only trigger if the document is visible
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }

    const now = Date.now();
    // Throttle: Ensure the heartbeat isn't fired more than once every 30 seconds
    if (now - globalLastHeartbeat < HEARTBEAT_INTERVAL_MS) {
      return;
    }

    try {
      // Update global timestamp BEFORE the call to prevent race conditions from visibility events
      globalLastHeartbeat = now;
      await UsersAPI.heartbeat(auth0Id);
      console.log('💓 [Presence] Heartbeat sent');
    } catch (error) {
      // Reset if it failed so we can retry sooner?
      // Actually, let's keep the throttle to avoid spamming a failing endpoint
      console.error('❌ [Presence] Heartbeat failed:', error);
    }
  }, [auth0Id]);

  useEffect(() => {
    if (!auth0Id) return;

    // Initial heartbeat on mount (subject to throttle)
    sendHeartbeat();

    // Setup periodic interval
    const interval = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth0Id, sendHeartbeat]);

  return { sendHeartbeat };
}
