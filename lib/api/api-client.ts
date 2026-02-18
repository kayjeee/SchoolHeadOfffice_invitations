// lib/api/api-client.ts
import { z } from 'zod';

// ========================
// API CLIENT CONFIGURATION
// ========================
const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app';

// Ensure we have a clean base URL without trailing slashes and with exactly one /api/v1
const API_BASE_URL = (() => {
  const cleanBase = RAW_API_BASE_URL.replace(/\/$/, '');
  return cleanBase.endsWith('/api/v1') ? cleanBase : `${cleanBase}/api/v1`;
})();

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

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(response.status, response.statusText, errorData);
        }

        const data = await response.json();
        const validatedData = schema.parse(data);
        return validatedData;

      } catch (error) {
        lastError = error as Error;
        if (i < MAX_RETRIES - 1) {
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
