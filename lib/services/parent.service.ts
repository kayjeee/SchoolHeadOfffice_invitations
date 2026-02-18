// lib/services/parent.service.ts
import { z } from 'zod';
import { ParentProfile, Learner } from '../api/parent-api';

const internalApiUrl = 'https://shobackendv2-production.up.railway.app/api/v1';

// ========================
// SERVER-SIDE API CLIENT
// ========================

async function fetchFromInternalApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${internalApiUrl}${endpoint}`, {
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
  static async getProfile(auth0Id: string): Promise<ParentProfile | null> {
    try {
      const data = await fetchFromInternalApi(`/users/show?auth0_id=${encodeURIComponent(auth0Id)}`);
      // Consistent with ParentAPI.getProfile logic
      const profile = data.data?.user || data.user || data.data || data;

      if (profile && !profile.name && (profile.first_name || profile.last_name)) {
        profile.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      return profile as ParentProfile;
    } catch (error) {
      console.error(`Error fetching profile for user ${auth0Id}:`, error);
      return null;
    }
  }

  static async getLearners(auth0Id: string): Promise<Learner[]> {
    try {
      const data = await fetchFromInternalApi(`/parents/${auth0Id}/learners`);
      // Extract learners array from { success: true, learners: [...] }
      return (data.learners || []) as Learner[];
    } catch (error) {
      console.error(`Error fetching learners for user ${auth0Id}:`, error);
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
