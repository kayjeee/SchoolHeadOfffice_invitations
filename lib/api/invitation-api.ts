import { z } from 'zod';
import { apiClient } from './api-client';

/**
 * Schema for the Invitation object.
 * .passthrough() is used to ensure we don't lose fields not explicitly defined here.
 */
const InvitationSchema = z.object({
  id: z.string().optional(),
  token: z.string().optional(),
  status: z.string().optional(),
  school_id: z.string().optional(),
  school_name: z.string().optional(),
  school_logo: z.string().nullable().optional(), // Allowed to be null or missing
  grade_name: z.string().optional(),
  recipient_phone_number: z.string().optional(),
  parent_name: z.string().optional(),
  learner_number: z.string().optional(),
  learner_numbers: z.array(z.string()).optional(),
  learner_ids: z.array(z.string()).optional(),
  expired_at: z.string().optional(),
  expires_at: z.string().optional(),
  expired: z.boolean().optional(),
  active: z.boolean().optional(),
  full_magic_link: z.string().optional(),
}).passthrough();

/**
 * Schema for the specific verification endpoint response.
 */
const VerifyWithDetailsSchema = z.object({
  success: z.boolean(),
  invitation: InvitationSchema,
  expires_in: z.number().optional(),
  is_expired: z.boolean().optional(),
}).passthrough();

export type InvitationData = z.infer<typeof InvitationSchema>;

export class InvitationAPI {
  /**
   * Fetches invitation details via token without claiming/accepting it.
   */
  static async verifyToken(token: string): Promise<InvitationData> {
    console.log(`🔍 [InvitationAPI.verifyToken] Triggered for token: ${token.substring(0, 10)}...`);
    
    try {
      const response = await apiClient.get(
        `/invitations/${token}/verify_with_details`,
        VerifyWithDetailsSchema
      );
      const responseData = (response as any).data || response;

      // Log specific fields to verify the backend is sending what we expect
      console.log(`✅ [InvitationAPI.verifyToken] school_name: ${responseData.invitation.school_name}`);
      console.log(`✅ [InvitationAPI.verifyToken] school_logo: ${responseData.invitation.school_logo}`);
      
      return responseData.invitation;
    } catch (error) {
      console.error(`❌ [InvitationAPI.verifyToken] Verification failed:`, error);
      throw error;
    }
  }

  /**
   * Fetches teacher invitation details.
   * Teacher invites might use a different endpoint than parent invites.
   */
  static async verifyTeacherInvite(token: string): Promise<InvitationData> {
    console.log(`🔍 [InvitationAPI.verifyTeacherInvite] Triggered for token: ${token.substring(0, 10)}...`);

    try {
      // First try the teacher-specific endpoint
      const response = await apiClient.get(
        `/teacher_invitations/${token}/verify`,
        VerifyWithDetailsSchema
      ).catch(() => null);

      if (response) {
        const responseData = (response as any).data || response;
        return responseData.invitation;
      }

      // Fallback to generic if teacher-specific fails
      return await this.verifyToken(token);
    } catch (error) {
      console.error(`❌ [InvitationAPI.verifyTeacherInvite] Verification failed:`, error);
      throw error;
    }
  }

  /**
   * Links the invitation to an authenticated Auth0 user.
   */
  static async acceptInvitation(token: string, auth0Id: string): Promise<{ success: boolean }> {
    console.log(`🤝 [InvitationAPI.acceptInvitation] Claiming token: ${token.substring(0, 10)}... for user: ${auth0Id}`);
    
    const schema = z.object({ 
      success: z.boolean() 
    }).passthrough();

    try {
      const response = await apiClient.post(
        '/invitations/verify', 
        { token, auth0_id: auth0Id }, 
        schema
      );
      
      console.log(`✅ [InvitationAPI.acceptInvitation] Success: ${response.success}`);
      return response;
    } catch (error) {
      console.error(`❌ [InvitationAPI.acceptInvitation] Failed:`, error);
      throw error;
    }
  }
}