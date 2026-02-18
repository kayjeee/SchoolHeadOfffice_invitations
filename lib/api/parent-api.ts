import { z } from 'zod';
import { apiClient } from './api-client';

export interface ParentProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  avatar_url?: string;
  name?: string;
  needsOnboarding?: boolean;
  subscription?: "standard" | "premium";
}

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  school_id: string;
  school_name: string;
  school_slug?: string;
  learner_number: string;
  status: 'active' | 'inactive';
  full_name?: string;
  accession_number?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export class ParentAPI {
  static async getProfile(auth0Id: string): Promise<ParentProfile> {
    const responseSchema = z.object({
      success: z.boolean(),
      data: z.any()
    });

    const response = await apiClient.get(`/users/show?auth0_id=${encodeURIComponent(auth0Id)}`, responseSchema);
    const profile = response.data.user || response.data;

    // Add name for compatibility if it doesn't exist
    if (profile && !profile.name && (profile.first_name || profile.last_name)) {
      profile.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }

    return profile;
  }

  static async updateProfile(auth0Id: string, data: UpdateProfileData): Promise<ParentProfile> {
    const responseSchema = z.object({
      success: z.boolean(),
      data: z.any()
    });

    const response = await apiClient.put(`/users/${encodeURIComponent(auth0Id)}`, data, responseSchema);
    return response.data.user || response.data;
  }

  static async getMyLearners(auth0Id: string): Promise<{ learners: Learner[] }> {
    const responseSchema = z.object({
      success: z.boolean(),
      learners: z.array(z.any()),
    });

    // Try query parameter pattern which is more common in this backend
    const response = await apiClient.get(`/parents/learners?auth0_id=${encodeURIComponent(auth0Id)}`, responseSchema);
    return { learners: response.learners };
  }

  static async linkLearner(auth0Id: string, learnerNumber: string): Promise<any> {
    const responseSchema = z.object({
      success: z.boolean(),
    });

    return apiClient.post(`/parents/link_learner?auth0_id=${encodeURIComponent(auth0Id)}`, { learner_number: learnerNumber }, responseSchema);
  }
}
