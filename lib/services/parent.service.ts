// lib/services/parent.service.ts
import { z } from 'zod';
import { ParentProfile, Learner } from '../api/parent-api';
import { apiClient } from '../api/api-client';

// ========================
// SERVICE CLASS
// ========================

const GenericResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  user: z.any().optional(),
  learners: z.array(z.any()).optional(),
}).passthrough();

export class ParentService {
  static async getProfile(userId: string): Promise<ParentProfile | null> {
    console.log(`👤 [ParentService.getProfile] Fetching for: ${userId}`);
    try {
      const result = await apiClient.get(
        `/users/show?auth0_id=${encodeURIComponent(userId)}`,
        GenericResponseSchema
      );

      // Handle the data structure returned by /users/show
      const profile = result.data?.user || result.user || result.data || result;

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
      const result = await apiClient.get(
        `/parents/my_learners?auth0_id=${encodeURIComponent(userId)}`,
        GenericResponseSchema
      );

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
      await apiClient.post(`/parents/${userId}/link-invitation`, { invitationId }, GenericResponseSchema);
      return { success: true };
    } catch (error) {
      console.error(`Error linking invitation ${invitationId} to user ${userId}:`, error);
      return { success: false };
    }
  }
}
