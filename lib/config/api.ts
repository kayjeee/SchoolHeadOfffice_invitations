/**
 * Centralized API configuration for the application.
 * Handles environment-specific URLs and provides fallbacks.
 */

const DEFAULT_PRODUCTION_URL = 'https://shobackendv2-production.up.railway.app';

/**
 * Returns the base URL for the API based on the environment.
 * Prioritizes environment variables and falls back to production URL.
 */
export const getBaseUrl = (): string => {
  let url = '';

  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ variable
    url = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_PRODUCTION_URL;
  } else {
    // Server-side: use RAILS_API_BASE_URL if available, else fallback
    url = process.env.RAILS_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_PRODUCTION_URL;
  }

  // Ensure URL starts with http:// or https://
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slash if present
  return url.replace(/\/$/, '');
};

export const API_BASE_URL = getBaseUrl();

/**
 * The standard API v1 endpoint prefix.
 */
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

export default {
  API_BASE_URL,
  API_V1_URL,
  getBaseUrl,
};
