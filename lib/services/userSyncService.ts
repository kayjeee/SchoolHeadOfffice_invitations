// lib/services/userSyncService.ts
import { UserProfile } from '@auth0/nextjs-auth0/client';

const RAILS_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface RailsUser {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  roles?: string[];
}

export async function syncUserWithRails(
  auth0User: UserProfile,
  invitationToken?: string | null
): Promise<RailsUser> {
  console.log('[UserSync] Starting user sync');

  if (!auth0User || !auth0User.sub) {
    console.error('[UserSync] Missing Auth0 user or sub', auth0User);
    throw new Error('Auth0 user with a subject ID is required for synchronization.');
  }

  const url = `${RAILS_API_URL}/api/v1/users`;

  const payload = {
    user: {
      auth0_id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name,
      invitation_token: invitationToken,
      roles: ['parent'],
    },
  };

  console.log('[UserSync] Rails API URL:', url);
  console.log('[UserSync] Payload being sent:', payload);

  try {
    console.log('[UserSync] Sending POST request to Rails API...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[UserSync] Fetch completed');
    console.log('[UserSync] Response status:', response.status);
    console.log('[UserSync] Response ok:', response.ok);

    const responseBody = await response
      .clone()
      .json()
      .catch(() => null);

    console.log('[UserSync] Response body:', responseBody);

    if (!response.ok) {
      console.error('[UserSync] Rails API returned an error', {
        status: response.status,
        statusText: response.statusText,
        responseBody,
      });

      throw new Error(
        responseBody?.message || 'User synchronization with the backend failed.'
      );
    }

    console.log('[UserSync] User successfully synced with Rails');

    return responseBody as RailsUser;
  } catch (error) {
    console.error('[UserSync] Unexpected error during sync:', error);
    throw error;
  }
}

export const UserSyncService = {
  syncUserWithRails,
};
