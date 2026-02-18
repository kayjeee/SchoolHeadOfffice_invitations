// lib/services/parent.service.ts
import { z } from 'zod';
import { ParentProfile, Learner } from '../api/parent-api';

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app';

// Ensure we have a clean base URL without trailing slashes and with exactly one /api/v1
const API_BASE_URL = (() => {
  const cleanBase = RAW_API_BASE_URL.replace(/\/$/, '');
  return cleanBase.endsWith('/api/v1') ? cleanBase : `${cleanBase}/api/v1`;
})();

// ========================
// SERVER-SIDE API CLIENT
// ========================

async function fetchFromInternalApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Internal API request failed: ${response.statusText}`);
  }

  return response.json();
}

// ========================
// SERVICE CLASS
// ========================

export class ParentService {
  static async getProfile(userId: string): Promise<ParentProfile | null> {
    try {
      const data = await fetchFromInternalApi(`/parents/${encodeURIComponent(userId)}/profile`);
      return data as ParentProfile;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      return null;
    }
  }

  static async getLearners(userId: string): Promise<Learner[]> {
    try {
      const data = await fetchFromInternalApi(`/parents/${encodeURIComponent(userId)}/learners`);
      return data as Learner[];
    } catch (error) {
      console.error(`Error fetching learners for user ${userId}:`, error);
      return [];
    }
  }

  static async linkInvitation(userId: string, invitationId: string): Promise<{ success: boolean }> {
    try {
      await fetchFromInternalApi(`/parents/${encodeURIComponent(userId)}/link-invitation`, {
        method: 'POST',
        body: JSON.stringify({ invitationId }),
      });
      return { success: true };
    } catch (error) {
      console.error(`Error linking invitation ${invitationId} to user ${userId}:`, error);
      return { success: false };
    }
  }
}
