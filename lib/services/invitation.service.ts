// lib/services/invitation.service.ts
import { z } from 'zod';

// Define the schema for the expected API response
const InvitationDataSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type InvitationData = z.infer<typeof InvitationDataSchema>;

export class InvitationService {
  static async verifyToken(token: string): Promise<InvitationData> {
    const internalApiUrl = 'http://localhost:4000/api/v1';

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

  static async claim(token: string, userId: string): Promise<{ success: boolean }> {
    const internalApiUrl = 'http://localhost:4000/api/v1';

    const response = await fetch(`${internalApiUrl}/invitations/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, userId }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Failed to claim invitation: ${response.statusText} - ${errorBody.message}`);
    }

    return { success: true };
  }
}
