// lib/services/parent.service.ts
import { z } from 'zod';
import { ParentProfile, Learner } from '../api/parent-api';

const internalApiUrl = 'https://shobackendv2-production.up.railway.app/api/v1';

// ========================
// SERVER-SIDE API CLIENT
// ========================

async function fetchFromInternalApi(endpoint: string, options: RequestInit = {}) {
  // Ensure the URL is correctly constructed with a leading slash for the endpoint if needed
  const baseUrl = internalApiUrl.endsWith('/') ? internalApiUrl.slice(0, -1) : internalApiUrl;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseUrl}${path}`, {
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
      // Use the same endpoint as ParentAPI to ensure consistency
      const data = await fetchFromInternalApi(`/users/show?auth0_id=${encodeURIComponent(userId)}`);

      // Handle the standardized backend response format
      const profile = data.data?.user || data.data || data;

      // Add name for compatibility if it doesn't exist
      if (profile && !profile.name && (profile.first_name || profile.last_name)) {
        profile.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      return profile as ParentProfile;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      return null;
    }
  }

  static async getLearners(userId: string): Promise<Learner[]> {
    try {
      const data = await fetchFromInternalApi(`/parents/${userId}/learners`);
      // The API returns { success: true, learners: [...] }
      return (data.learners || []) as Learner[];
    } catch (error) {
      console.error(`Error fetching learners for user ${userId}:`, error);
      return [];
    }
  }

  static async linkInvitation(userId: string, invitationId: string): Promise<{ success: boolean }> {
    try {
      await fetchFromInternalApi(`/parents/${userId}/link-invitation`, {
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
