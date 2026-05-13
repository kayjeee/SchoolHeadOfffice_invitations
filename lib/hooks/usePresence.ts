// lib/hooks/usePresence.ts
//
// Sends a heartbeat to the Rails backend every 30 seconds so
// NotificationService can determine whether a user is online.
//
// IMPORTANT: POST /api/v1/users/:auth0_id/heartbeat returns
// head :ok — an HTTP 200 with NO response body. Never call
// response.json() on it; use a raw fetch and check status only.

import { useCallback, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

export function usePresence() {
  const { user } = useUser();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = useCallback(async () => {
    const auth0Id = user?.sub;
    if (!auth0Id) return;

    try {
      // Get a fresh access token for the Rails API
      const tokenRes = await fetch('/api/auth/token');
      const { accessToken } = await tokenRes.json();

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const res = await fetch(
        `${apiBase}/api/v1/users/${encodeURIComponent(auth0Id)}/heartbeat`,
        {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // head :ok returns 200 with an empty body — do NOT call res.json().
      // Just check the status code.
      if (!res.ok) {
        console.warn(`[Presence] Heartbeat returned ${res.status}`);
      }
    } catch (err) {
      // Fire-and-forget: never let heartbeat errors surface to the user
      console.error('❌ [Presence] Heartbeat failed:', err);
    }
  }, [user?.sub]);

  useEffect(() => {
    if (!user?.sub) return;

    // Send immediately on mount / user change
    sendHeartbeat();

    // Then repeat on the interval
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Also send when the tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.sub, sendHeartbeat]);
}