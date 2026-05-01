# Messaging System Fixes: Action Cable Integration

This document summarizes the changes made to stabilize the real-time messaging system using Action Cable and optimize API costs.

## 1. WebSocket URL Correction (`lib/cable.ts`)
- **Issue**: Connections were failing because they targeted the root URL (`ws://localhost:4000/`) instead of the Rails WebSocket endpoint (`/cable`).
- **Fix**: Implemented a "bulletproof" URL construction.
  - Automatically switches protocol from `http`/`https` to `ws`/`wss`.
  - Strips `/api/v1` suffixes and appends `/cable`.
  - Appends `?user_email=${email}` for backend handshake authorization.

## 2. Identity-Aware Singleton Consumer
- **Fix**: The `getCableConsumer` now tracks the `currentEmail`. If the `email` differs from the existing consumer's identity, the old consumer is disconnected and re-initialized. This ensures the correct user context for the WebSocket connection.

## 3. Cost Optimization: Disabling SWR Polling (`lib/hooks/useMessaging.ts`)
- **Fix**: Configured SWR hooks (`useConversations`, `useMessages`) to disable background polling and focus revalidation.
  - `revalidateOnFocus: false`
  - `revalidateOnReconnect: false`
  - `refreshInterval: 0`
- **Result**: This significantly reduces the number of REST API calls, relying on WebSockets for real-time updates after the initial load.

## 4. Real-time Subscription Enhancements
- **Channel**: Switched to `MessagesChannel` for conversation updates.
- **Data Handling**: The `received` callback now directly pushes new messages into the SWR cache, providing instant UI updates without additional fetch requests.
- **Cleanup**: Explicitly call `subscription.unsubscribe()` in the hook's cleanup function to prevent memory leaks and "Subscription Rejected" errors.

## 5. Verification
- A production build (`npm run build`) was executed to confirm no syntax regressions.
- The system architecture now follows a "Fetch once (SWR), Push always (WebSocket)" pattern.
