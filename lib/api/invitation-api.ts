import { z } from 'zod';
import { apiClient } from './api-client';

/**
 * Schema for the Invitation object.
 * .passthrough() is used to ensure we don't lose fields not explicitly defined here.
 */
const InvitationSchema = z.object({
  id: z.string().nullable().optional(),
  token: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  school_id: z.string().nullable().optional(),
  school_name: z.string().nullable().optional(),
  school_logo: z.string().nullable().optional(),
  grade_name: z.string().nullable().optional(),
  recipient_phone_number: z.string().nullable().optional(),
  parent_name: z.string().nullable().optional(),
  learner_number: z.string().nullable().optional(),
  learner_numbers: z.array(z.string()).nullable().optional(),
  learner_ids: z.array(z.string()).nullable().optional(),
  expired_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  expired: z.boolean().nullable().optional(),
  active: z.boolean().nullable().optional(),
  full_magic_link: z.string().nullable().optional(),
  teacher_name: z.string().nullable().optional(),
  school_slug: z.string().nullable().optional(),
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
   * Tries multiple endpoints to ensure compatibility with different backend structures.
   */
  static async verifyToken(token: string): Promise<InvitationData> {
    console.log(`🔍 [InvitationAPI.verifyToken] Triggered for token: ${token.substring(0, 10)}...`);
    
    const endpoints = [
      `/invitations/${token}/verify_with_details`,
      `/invitations/verify?token=${token}`,
      `/invitations/${token}`,
      `/teacher_invitations/${token}`,
      `/teacher_invitations/verify?token=${token}`,
      `/invitations/verify_teacher?token=${token}`,
      `/learner_invitations/verify?token=${token}`,
      `/invitations/${token}/verify`
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 [InvitationAPI.verifyToken] Trying endpoint: ${endpoint}`);
        const response = await apiClient.get(endpoint, VerifyWithDetailsSchema);
        const responseData = (response as any).data || response;

        if (responseData && responseData.invitation) {
          console.log(`✅ [InvitationAPI.verifyToken] Success at ${endpoint}`);
          return responseData.invitation;
        }
      } catch (error: any) {
        lastError = error;
        // Log all errors for debugging, but proceed if it's a 404 or specific routing error
        console.log(`ℹ️ [InvitationAPI.verifyToken] Endpoint ${endpoint} failed (${error.status || 'ERR'}): ${error.message}`);

        // If we get something other than a 404/Routing error, it might be an actual validation failure
        // from the correct endpoint, so we could theoretically stop, but for now we'll keep trying all.
      }
    }

    throw new Error('All verification endpoints failed');
  }

  /**
   * Fetches teacher invitation details.
   */
  static async verifyTeacherInvite(token: string): Promise<InvitationData> {
    // For now, we use the same multi-endpoint verification logic
    return this.verifyToken(token);
  }

  /**
   * Links the invitation to an authenticated Auth0 user.
   */
  static async acceptInvitation(token: string, auth0Id: string): Promise<{ success: boolean, invitation?: InvitationData }> {
    console.log(`🤝 [InvitationAPI.acceptInvitation] Claiming token: ${token.substring(0, 10)}... for user: ${auth0Id}`);
    
    const schema = z.object({ 
      status: z.string().nullable().optional(),
      message: z.string().nullable().optional(),
      data: z.object({
        success: z.boolean().nullable().optional(),
        invitation: InvitationSchema.nullable().optional()
      }).passthrough().nullable().optional(),
      success: z.boolean().nullable().optional()
    }).passthrough();

    try {
      const response = await apiClient.post(
        '/invitations/verify', 
        { token, auth0_id: auth0Id }, 
        schema
      );
      
      const responseData = (response as any).data || response;
      const isSuccess = responseData.status === 'success' || responseData.success === true || responseData.data?.success === true;

      console.log(`✅ [InvitationAPI.acceptInvitation] Success: ${isSuccess}`);

      return {
        success: isSuccess,
        invitation: responseData.data?.invitation || responseData.invitation
      };
    } catch (error) {
      console.error(`❌ [InvitationAPI.acceptInvitation] Failed:`, error);
      throw error;
    }
  }
}