# Messaging System Fixes: Action Cable Integration

This document summarizes the changes made to stabilize the real-time messaging system using Action Cable.

## 1. WebSocket URL Correction (`lib/cable.ts`)
- **Issue**: Connections were failing because they targeted the root URL (`ws://localhost:4000/`) instead of the Rails WebSocket endpoint (`/cable`).
- **Fix**: Updated the `getCableConsumer` utility to robustly construct the URL.
  - Automatically switches protocol from `http`/`https` to `ws`/`wss`.
  - Replaces `/api/v1` suffixes with `/cable` or appends `/cable` to the base domain.
  - Ensures no double-slashes in the final URL.

## 2. Identity-Aware Singleton Consumer
- **Issue**: The Action Cable consumer was a static singleton, which could lead to "Subscription Rejected" errors if a different user logged in without a page refresh.
- **Fix**: The `getCableConsumer` now tracks the `currentEmail`. If the `email` passed to the function differs from the existing consumer's identity, the old consumer is disconnected and a new one is initialized.

## 3. Handshake Authentication
- **Change**: Added `?user_email=${email}` as a query parameter to the WebSocket connection string. This allows the Rails `Connection#connect` method to identify and authorize the user during the initial handshake.

## 4. Subscription Management & Cleanup (`lib/hooks/useMessaging.ts`)
- **Fix**: Explicitly call `subscription.unsubscribe()` in the `useEffect` cleanup function. This prevents "stale" subscriptions and resource leaks when switching conversations or unmounting the chat component.
- **Debugging**: Added detailed logs for `connected()`, `disconnected()`, and `rejected()` callbacks. The `rejected()` log now includes a troubleshooting hint to check if the `user_email` is correctly passed and authorized by the backend.

## 5. Verification
- A production build (`npm run build`) was successfully executed to ensure no syntax or import regressions.
- The WebSocket URL construction was verified to handle both local development (`localhost:4000`) and production-like environments.
