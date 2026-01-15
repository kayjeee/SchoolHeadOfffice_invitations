// lib/config/api.ts
export const API_CONFIG = {
  // For browser-side API calls (client components)
  get CLIENT_API_BASE() {
    if (typeof window !== 'undefined') {
      // Client-side: use environment variable or default
      return process.env.NEXT_PUBLIC_API_BASE_URL ||
             'https://shobackendv2-production.up.railway.app';
    }
    return 'https://shobackendv2-production.up.railway.app';
  },

  // For server-side API calls (server components, API routes)
  get SERVER_API_BASE() {
    return process.env.RAILS_API_BASE_URL ||
           'https://shobackendv2-production.up.railway.app';
  },

  get API_VERSION() {
    return '/api/v1';
  },

  get FULL_CLIENT_API_URL() {
    return `${this.CLIENT_API_BASE}${this.API_VERSION}`;
  },

  get FULL_SERVER_API_URL() {
    return `${this.SERVER_API_BASE}${this.API_VERSION}`;
  }
};
