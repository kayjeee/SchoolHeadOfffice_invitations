import { z } from 'zod';

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Default to relative path for Next.js Proxy/Rewrites compatibility
  if (!envUrl) return '/api/v1';

  if (envUrl.includes('/api/v1')) {
    return envUrl.replace(/\/$/, '');
  }

  return `${envUrl.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public details?: Record<string, any>
  ) {
    const detailMessage = details?.message || details?.error || (Array.isArray(details?.errors) ? details.errors[0] : null);
    const message = detailMessage ? `${detailMessage}` : `API Error: ${status} ${statusText}`;
    super(message);
    this.name = 'APIError';
  }
}

class ApiClient {
  public defaults: {
    headers: {
      common: Record<string, string>;
    };
  } = {
    headers: {
      common: {},
    },
  };

  private userEmail: string | null = null;

  public setAccessToken(token: string | null) {
    if (token) {
      this.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaults.headers.common['Authorization'];
    }
  }

  public setUserEmail(email: string | null) {
    this.userEmail = email;
  }

  public clearAuth() {
    this.defaults.headers.common = {};
    this.userEmail = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    schema: z.ZodType<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    // ✅ FIX: Do not prepend API_BASE_URL if endpoint is already a full URL
    // Also handle /api/v1 prefixing correctly to avoid doubling
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      if (cleanEndpoint.startsWith('/api/v1')) {
        // Strip the duplicate prefix if API_BASE_URL already has it
        const base = API_BASE_URL.endsWith('/api/v1')
          ? API_BASE_URL.replace(/\/api\/v1$/, '')
          : API_BASE_URL;
        url = `${base}${cleanEndpoint}`;
      } else {
        url = `${API_BASE_URL}${cleanEndpoint}`;
      }
    }

    const method = options.method || 'GET';
    const requestId = Math.random().toString(36).substring(7);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const start = Date.now();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...this.defaults.headers.common,
          ...((options.headers as Record<string, string>) || {}),
        };

        if (this.userEmail && !headers['X-User-Email']) {
          headers['X-User-Email'] = this.userEmail;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorData: any = {};
          const text = await response.text();

          if (contentType && contentType.includes('application/json')) {
            try {
              errorData = text ? JSON.parse(text) : {};
            } catch (e) {
              errorData = { message: text };
            }
          } else {
            console.error(`🔥 True Server HTML Error Output [${requestId}]:`, text);
            errorData = { message: `Server returned ${response.status}. See console for HTML dump.` };
          }

          console.error(`❌ [API Response ${requestId}] FAILED (${response.status}) ${duration}ms`, errorData);

          if (response.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/api/auth/login';
          }

          throw new APIError(response.status, response.statusText, errorData);
        }

        const contentType = response.headers.get('content-type');
        const responseText = await response.text();

        if (!contentType || !contentType.includes('application/json')) {
          return (responseText || {}) as T;
        }

        const data = responseText ? JSON.parse(responseText) : {};

        // Defensive check for common validation error keys in the response
        if (data && (data.fieldErrors || data.formErrors)) {
          console.warn(`⚠️ [API Response ${requestId}] Data contains validation errors:`, data);
          return data as T;
        }

        const parseResult = schema.safeParse(data);
        
        if (!parseResult.success) {
          console.warn(`⚠️ [API Response ${requestId}] Zod Validation failed. Returning raw data.`, parseResult.error.flatten());
          return data as T;
        }

        // Return parsed data. If it's an object, merge with raw data to preserve extra fields.
        // If it's an array or primitive, return as is.
        if (Array.isArray(data)) {
          return parseResult.data;
        }

        return (typeof data === 'object' && data !== null 
          ? { ...data, ...parseResult.data } 
          : parseResult.data) as T;

      } catch (error) {
        lastError = error as Error;
        if (i < MAX_RETRIES - 1) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) break;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  }

  get<T>(endpoint: string, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' }, schema);
  }

  post<T>(endpoint: string, body: unknown, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }, schema);
  }

  put<T>(endpoint: string, body: unknown, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }, schema);
  }

  patch<T>(endpoint: string, body: unknown, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }, schema);
  }

  delete<T>(endpoint: string, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'DELETE' }, schema);
  }
}

export const apiClient = new ApiClient();

export const syncApiClientToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
