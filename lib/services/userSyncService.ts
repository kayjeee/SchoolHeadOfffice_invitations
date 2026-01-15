// lib/services/userSyncService.ts
import { UserProfile } from '@auth0/nextjs-auth0/client';

const RAILS_API_URL = 'shobackendv2-production.up.railway.app';

export interface RailsUser {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  roles?: string[];
  // Add any other fields that your Rails API returns for a user
}

/**
 * Synchronizes the Auth0 user with the Rails backend.
 * This function will create a new user or update an existing one.
 *
 * @param auth0User The user object from Auth0.
 * @param invitationToken An optional token from a magic link invitation.
 * @returns The user data from the Rails API.
 */
export async function syncUserWithRails(
  auth0User: UserProfile,
  invitationToken?: string | null
): Promise<RailsUser> {
  if (!auth0User || !auth0User.sub) {
    throw new Error('Auth0 user with a subject ID is required for synchronization.');
  }

  const payload = {
    user: {
      auth0_id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name,
      invitation_token: invitationToken,
      roles: ['parent'],
    },
  };

  try {
    const response = await fetch(`shobackendv2-production.up.railway.app/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to sync user with Rails API:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.message || 'User synchronization with the backend failed.');
    }

    const railsUser: RailsUser = await response.json();
    return railsUser;
  } catch (error) {
    console.error('An unexpected error occurred during user synchronization:', error);
    throw error;
  }
}

export const UserSyncService = {
  syncUserWithRails,
};
