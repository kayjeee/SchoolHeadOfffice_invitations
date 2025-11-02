// lib/api/invitation-api.ts
import { z } from 'zod';
import { apiClient } from './api-client';

// ========================
// ZOD SCHEMAS
// ========================

const InvitationDataSchema = z.object({
  id: z.string(),
  school_id: z.string(),
  school_name: z.string(),
  phone_number: z.string(),
  learner_ids: z.array(z.string()),
  expires_at: z.string().datetime(),
});

export type InvitationData = z.infer<typeof InvitationDataSchema>;

// ========================
// API SERVICE
// ========================

export class InvitationAPI {
  static async verifyToken(token: string): Promise<InvitationData> {
    const responseSchema = z.object({
      invitation: InvitationDataSchema,
    });

    const response = await apiClient.post('/invitations/verify', { token }, responseSchema);
    return response.invitation;
  }
}
