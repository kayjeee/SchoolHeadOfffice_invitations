import { useEffect, useRef, useCallback } from 'react';
import { UsersAPI } from '@/lib/api/users-api';

const HEARTBEAT_THROTTLE_MS = 30000; // 30 seconds

export function usePresence() {
  const lastHeartbeatRef = useRef<number>(0);

  const sendHeartbeat = useCallback(async () => {
    const now = Date.now();
    if (now - lastHeartbeatRef.current < HEARTBEAT_THROTTLE_MS) {
      return;
    }

    try {
      lastHeartbeatRef.current = now;
      await UsersAPI.heartbeat();
      console.log('💓 [Presence] Heartbeat sent');
    } catch (error) {
      console.error('❌ [Presence] Heartbeat failed:', error);
    }
  }, []);

  useEffect(() => {
    // Initial heartbeat on mount
    sendHeartbeat();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendHeartbeat]);

  return { sendHeartbeat };
}
