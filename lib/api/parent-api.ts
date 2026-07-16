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
  primary_school_name?: string;
  primary_school_slug?: string;
  onboarding_status?: {
    parent_onboarding_completed: boolean;
  };
}

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  school_id: string;
  school_name: string;
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
    console.log(`👤 [ParentAPI.getProfile] Fetching for: ${auth0Id}`);
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

    console.log(`👤 [ParentAPI.getProfile] Loaded: ${profile?.name || 'Unknown'}`);
    return profile;
  }

  static async updateProfile(auth0Id: string, data: UpdateProfileData): Promise<ParentProfile> {
    const responseSchema = z.object({
      success: z.boolean(),
      data: z.any()
    });

    const response = await apiClient.patch(
      `/users/update_profile?auth0_id=${encodeURIComponent(auth0Id)}`,
      data,
      responseSchema
    );
    return response.data.user || response.data;
  }

  static async getMyLearners(auth0Id: string): Promise<{ learners: Learner[] }> {
    console.log(`🎓 [ParentAPI.getMyLearners] Fetching for: ${auth0Id}`);
    const responseSchema = z.object({
      success: z.boolean(),
      learners: z.array(z.any()),
    });

    // Updated route to match backend implementation
    const response = await apiClient.get(`/parents/my_learners?auth0_id=${encodeURIComponent(auth0Id)}`, responseSchema);
    console.log(`🎓 [ParentAPI.getMyLearners] Found ${response.learners?.length || 0} learners`);
    return { learners: response.learners };
  }

  static async linkLearner(auth0Id: string, learnerNumber: string): Promise<any> {
    const responseSchema = z.object({
      success: z.boolean(),
    });

    return apiClient.post(`/parents/${auth0Id}/link_learner`, { learner_number: learnerNumber }, responseSchema);
  }
}
