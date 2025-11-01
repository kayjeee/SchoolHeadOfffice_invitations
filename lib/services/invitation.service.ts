// lib/services/invitation.service.ts
import { z } from 'zod';

// Define the schema for the expected API response
const InvitationDataSchema = z.object({
  id: z.string(),
  school_id: z.string(),
  school_name: z.string(),
  phone_number: z.string(),
  learner_ids: z.array(z.string()),
  expires_at: z.string(),
});

type InvitationData = z.infer<typeof InvitationDataSchema>;

export class InvitationService {
  static async verifyToken(token: string): Promise<InvitationData> {
    const internalApiUrl = process.env.INTERNAL_API_URL;
    if (!internalApiUrl) {
      throw new Error('INTERNAL_API_URL is not defined');
    }

    const response = await fetch(`${internalApiUrl}/invitations/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers for the internal API
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Failed to verify invitation token: ${response.statusText} - ${errorBody.message}`);
    }

    const data = await response.json();

    // Validate the response data against the schema
    const validationResult = InvitationDataSchema.safeParse(data);
    if (!validationResult.success) {
        console.error("Invalid invitation data received from API:", validationResult.error);
        throw new Error("Invalid invitation data format");
    }

    return validationResult.data;
  }
}
