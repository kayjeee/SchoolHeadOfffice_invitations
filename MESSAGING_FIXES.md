# Messaging System Fixes: Action Cable Integration

This document summarizes the changes made to stabilize the real-time messaging system using Action Cable and optimize API costs.

## 1. WebSocket URL Correction (`lib/cable.ts`)
- **Issue**: Connections were failing because they targeted the root URL instead of the Rails WebSocket endpoint (`/cable`).
- **Fix**: Implemented a "bulletproof" URL construction.
  - Automatically switches protocol from `http`/`https` to `ws`/`wss`.
  - Strips `/api/v1` suffixes and appends `/cable`.
  - Appends `?user_email=${email}` for backend handshake authorization.

## 2. Identity-Aware Singleton Consumer
- **Fix**: The `getCableConsumer` now tracks the `currentEmail`. If the `email` differs from the existing consumer's identity, the old consumer is disconnected and re-initialized.

## 3. Cost Optimization: Disabling SWR Polling (`lib/hooks/useMessaging.ts`)
- **Fix**: Configured SWR hooks to disable background polling and focus revalidation.
  - `revalidateOnFocus: false`
  - `refreshInterval: 0`
- **Result**: Drastically reduces REST API calls, relying on WebSockets for real-time updates.
- **Typing Poll**: Removed the 10s polling for typing status to further reduce costs.

## 4. Race Condition & Stale Closure Fixes
- **sendMessage Fix**: Switched `mutate` to use a functional update (updater function) in `useMessages`. This prevents race conditions where a concurrent WebSocket message could be overwritten by a stale REST response.
- **Deduplication**: Both the `sendMessage` response and the WebSocket `received` callback perform ID-based deduplication before updating the cache.
- **Hook Stability**: Restored hook counts in `useTyping` to prevent "Rendered fewer hooks than expected" errors during React reconciliation.

## 5. Real-time Subscription Enhancements
- **Channel**: Switched to `MessagesChannel`.
- **Cleanup**: Enforced explicit `unsubscribe()` on unmount/conversation switch.

## 6. Verification
- Successfully executed `npm run build`.
- Architecture follows: "Fetch once (SWR), Push always (WebSocket)".
