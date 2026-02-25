// lib/api/api-client.ts
import { z } from 'zod';

// ========================
// API CLIENT CONFIGURATION
// ========================
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!envUrl) return 'https://shobackendv2-production.up.railway.app/api/v1';

  // If the URL already contains /api/v1, use it as is (stripping trailing slash)
  if (envUrl.includes('/api/v1')) {
    return envUrl.replace(/\/$/, '');
  }

  // Otherwise, append /api/v1
  return `${envUrl.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ========================
// CUSTOM ERROR CLASS
// ========================
export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public details?: Record<string, any>
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

// ========================
// CORE HTTP CLIENT
// ========================
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit,
    schema: z.ZodType<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    const requestId = Math.random().toString(36).substring(7);

    // Parse body for logging if it exists
    let parsedBody;
    try {
      parsedBody = options.body ? JSON.parse(options.body as string) : undefined;
    } catch (e) {
      parsedBody = options.body;
    }

    console.log(`🚀 [API Request ${requestId}] ${method} ${url}`, {
      headers: options.headers,
      body: parsedBody
    });

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const start = Date.now();
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        const duration = Date.now() - start;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ [API Response ${requestId}] FAILED (${response.status}) ${duration}ms`, errorData);
          throw new APIError(response.status, response.statusText, errorData);
        }

        const data = await response.json();
        
        // Log the raw data stringified to see everything before Zod processes it
        console.log(`✅ [API Response ${requestId}] RAW (${response.status}) ${duration}ms:`, JSON.stringify(data, null, 2));

        // Use safeParse so validation failures don't crash the request
        const parseResult = schema.safeParse(data);
        
        if (!parseResult.success) {
          console.warn(
            `⚠️ [API Response ${requestId}] Zod validation failed. Returning raw data to avoid stripping fields:`, 
            parseResult.error.flatten()
          );
          return data as T;
        }

        // Merge: Take the original raw data and overlay the Zod-parsed data.
        // This ensures .passthrough() works at all levels and we don't lose fields 
        // like school_logo even if they were missing from the schema definition.
        const validatedData = typeof data === 'object' && data !== null
          ? { ...data, ...parseResult.data }
          : parseResult.data;

        return validatedData as T;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ [API Request ${requestId}] Attempt ${i + 1} failed:`, (error as Error).message);
        
        if (i < MAX_RETRIES - 1) {
          // Exponential backoff
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

  delete<T>(endpoint: string, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'DELETE' }, schema);
  }
}

export const apiClient = new ApiClient();