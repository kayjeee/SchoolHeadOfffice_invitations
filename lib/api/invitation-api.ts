import { z } from 'zod';
import { apiClient } from './api-client';

const InvitationSchema = z.object({
  id: z.string(),
  token: z.string(),
  status: z.string(),
  school_id: z.string().optional(),
  school_name: z.string(),
  recipient_phone_number: z.string().optional(),
  parent_name: z.string().optional(),
  learner_number: z.string().optional(),
  learner_numbers: z.array(z.string()).optional(),
  learner_ids: z.array(z.string()).optional(),
  expires_at: z.string().optional(),
  expired: z.boolean().optional(),
  full_magic_link: z.string().optional(),
});

const VerifyWithDetailsSchema = z.object({
  success: z.boolean(),
  invitation: InvitationSchema,
  expires_in: z.number().optional(),
  is_expired: z.boolean().optional(),
});

export type InvitationData = z.infer<typeof InvitationSchema>;

export class InvitationAPI {
  // Read-only check — does NOT accept the invitation
  static async verifyToken(token: string): Promise<InvitationData> {
    const response = await apiClient.get(
      `/invitations/${token}/verify_with_details`,
      VerifyWithDetailsSchema
    );
    return response.invitation;
  }

  // Call this AFTER auth, to actually accept the invitation
  static async acceptInvitation(token: string, auth0Id: string): Promise<{ success: boolean }> {
    const schema = z.object({ success: z.boolean() });
    return apiClient.post('/invitations/verify', { token, auth0_id: auth0Id }, schema);
  }
}
