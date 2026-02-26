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
  static async getProfile(userId: string): Promise<ParentProfile | null> {
    console.log(`👤 [ParentService.getProfile] Fetching for: ${userId}`);
    try {
      const result = await fetchFromInternalApi(`/users/show?auth0_id=${encodeURIComponent(userId)}`);

      // Handle the data structure returned by /users/show
      const profile = result.data?.user || result.data || result;

      if (profile && !profile.name && (profile.first_name || profile.last_name)) {
        profile.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      console.log(`👤 [ParentService.getProfile] Success: ${profile?.name || 'Unknown'}`);
      return profile as ParentProfile;
    } catch (error) {
      console.error(`❌ [ParentService.getProfile] Error for ${userId}:`, error);
      return null;
    }
  }

  static async getLearners(userId: string): Promise<Learner[]> {
    console.log(`🎓 [ParentService.getLearners] Fetching for: ${userId}`);
    try {
      const result = await fetchFromInternalApi(`/parents/my_learners?auth0_id=${encodeURIComponent(userId)}`);

      // The backend returns { success: true, learners: [...] }
      const learners = result.learners || [];

      console.log(`🎓 [ParentService.getLearners] Found ${learners.length} learners for ${userId}`);
      return learners as Learner[];
    } catch (error) {
      console.error(`❌ [ParentService.getLearners] Error for ${userId}:`, error);
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
