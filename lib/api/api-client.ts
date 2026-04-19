import { z } from 'zod';

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!envUrl) return 'https://shobackendv2-production.up.railway.app/api/v1';

  if (envUrl.includes('/api/v1')) {
    return envUrl.replace(/\/$/, '');
  }

  return `${envUrl.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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
  private accessToken: string | null = null;

  public setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    schema: z.ZodType<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    // ✅ FIX: Do not prepend API_BASE_URL if endpoint is already a full URL
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;

    const method = options.method || 'GET';
    const requestId = Math.random().toString(36).substring(7);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const start = Date.now();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...((options.headers as Record<string, string>) || {}),
        };

        if (this.accessToken) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(url, { ...options, headers });
        const duration = Date.now() - start;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ [API Response ${requestId}] FAILED (${response.status}) ${duration}ms`, errorData);

          if (response.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/api/auth/login';
          }

          throw new APIError(response.status, response.statusText, errorData);
        }

        const data = await response.json();
        const parseResult = schema.safeParse(data);
        
        if (!parseResult.success) {
          console.warn(`⚠️ [API Response ${requestId}] Validation failed. Returning raw data.`, parseResult.error.flatten());
          return data as T;
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
}

export const apiClient = new ApiClient();