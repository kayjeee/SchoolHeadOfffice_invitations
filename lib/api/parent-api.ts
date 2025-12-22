// lib/api/parent-api.ts
import { z } from 'zod';
import { apiClient, APIError } from './api-client';

// ========================
// ZOD SCHEMAS
// ========================

const LearnerSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  accession_number: z.string(),
  school_name: z.string(),
  grade_name: z.string(),
  status: z.string(),
});

const GetLearnersResponseSchema = z.object({
  learners: z.array(LearnerSchema),
  learner_count: z.number(),
});

const ParentProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  avatar_url: z.string().url().optional(),
});

const ParentProfileUpdateSchema = ParentProfileSchema.omit({ id: true, user_id: true }).partial().extend({
  invitation_token: z.string().optional(),
});

export type Learner = z.infer<typeof LearnerSchema>;
export type GetLearnersResponse = z.infer<typeof GetLearnersResponseSchema>;
export type ParentProfile = z.infer<typeof ParentProfileSchema>;
export type ParentProfileUpdate = z.infer<typeof ParentProfileUpdateSchema>;

// ========================
// API SERVICE
// ========================

export class ParentAPI {
  static async getProfile(userId: string): Promise<ParentProfile> {
    try {
      return await apiClient.get(`/parents/${userId}/profile`, ParentProfileSchema);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        // Handle case where profile doesn't exist yet
        return null as any;
      }
      throw error;
    }
  }

  static async updateProfile(userId: string, data: ParentProfileUpdate): Promise<ParentProfile> {
    return await apiClient.put(`/parents/${userId}/profile`, data, ParentProfileSchema);
  }

  static async getMyLearners(userId: string): Promise<GetLearnersResponse> {
    return await apiClient.get(`/parents/${userId}/my_learners`, GetLearnersResponseSchema);
  }

  static async linkLearner(learner_number: string): Promise<{ success: boolean }> {
    const responseSchema = z.object({ success: z.boolean() });
    return await apiClient.post(`/learners/link`, { learner_number }, responseSchema);
  }

  static async removeLearner(userId: string, learnerId: string): Promise<{ success: boolean }> {
    const responseSchema = z.object({ success: z.boolean() });
    return await apiClient.delete(`/parents/${userId}/my_learners/${learnerId}`, responseSchema);
  }
}
