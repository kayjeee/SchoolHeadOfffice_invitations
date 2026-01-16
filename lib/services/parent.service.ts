// lib/services/parent.service.ts
import { z } from 'zod';
import { ParentProfile, Learner } from '../api/parent-api';
import { API_V1_URL } from '../config/api';

// ========================
// SERVER-SIDE API CLIENT
// ========================

async function fetchFromInternalApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_V1_URL}${endpoint}`, {
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
      const data = await fetchFromInternalApi(`/parents/${userId}/profile`);
      return data as ParentProfile;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      return null;
    }
  }

  static async getLearners(userId: string): Promise<Learner[]> {
    try {
      const data = await fetchFromInternalApi(`/parents/${userId}/learners`);
      return data as Learner[];
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
