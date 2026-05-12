import { useEffect, useRef, useCallback } from 'react';
import { UsersAPI } from '@/lib/api/users-api';

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

export function usePresence(auth0Id: string | undefined) {
  const lastHeartbeatRef = useRef<number>(0);

  const sendHeartbeat = useCallback(async () => {
    if (!auth0Id) return;

    // Guard: Only trigger if the document is visible
    if (document.visibilityState !== 'visible') {
      return;
    }

    const now = Date.now();
    // Throttle: Ensure the heartbeat isn't fired more than once every 30 seconds
    if (now - lastHeartbeatRef.current < HEARTBEAT_INTERVAL_MS) {
      return;
    }

    try {
      lastHeartbeatRef.current = now;
      await UsersAPI.heartbeat(auth0Id);
      console.log('💓 [Presence] Heartbeat sent');
    } catch (error) {
      console.error('❌ [Presence] Heartbeat failed:', error);
    }
  }, [auth0Id]);

  useEffect(() => {
    if (!auth0Id) return;

    // Initial heartbeat on mount
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
