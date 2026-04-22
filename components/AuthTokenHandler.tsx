import { useApi } from '../lib/hooks/useApi';

/**
 * A simple component that initializes the API authentication.
 * It's placed in the _app.tsx to ensure the apiClient is authenticated globally.
 */
export function AuthTokenHandler() {
  useApi();
  return null;
}
