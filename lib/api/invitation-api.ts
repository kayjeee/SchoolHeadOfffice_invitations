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
  static async acceptInvitation(token: string, auth0Id: string): Promise<{ success: boolean }> {
    console.log(`🤝 [InvitationAPI.acceptInvitation] Claiming token: ${token.substring(0, 10)}... for user: ${auth0Id}`);
    
    const schema = z.object({ 
      data: z.object({ success: z.boolean() }).optional(),
      success: z.boolean().optional()
    }).passthrough();

    try {
      const response = await apiClient.post(
        '/invitations/verify', 
        { token, auth0_id: auth0Id }, 
        schema
      );
      
      const responseData = (response as any).data || response;
      console.log(`✅ [InvitationAPI.acceptInvitation] Success: ${responseData.success}`);
      return responseData;
    } catch (error) {
      console.error(`❌ [InvitationAPI.acceptInvitation] Failed:`, error);
      throw error;
    }
  }
}