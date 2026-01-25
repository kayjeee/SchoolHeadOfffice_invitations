// lib/services/userSyncService.ts
import { UserProfile } from '@auth0/nextjs-auth0/client';

const RAILS_API_URL = 'http://localhost:4000/';

export interface RailsUser {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  roles?: string[];
  // Add any other fields that your Rails API returns for a user
}

interface RailsError {
  message?: string;
  error?: string;
  errors?: Record<string, string[]> | string[];
  [key: string]: any; // Allow other properties
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
  console.log('🚀 [UserSyncService] Starting user synchronization process');
  console.log('📝 [UserSyncService] Auth0 user received:', {
    hasSub: !!auth0User?.sub,
    sub: auth0User?.sub?.substring(0, 10) + '...',
    email: auth0User?.email,
    name: auth0User?.name,
    fullUserObject: auth0User
  });

  if (!auth0User || !auth0User.sub) {
    console.error('❌ [UserSyncService] Invalid Auth0 user - missing sub:', auth0User);
    throw new Error('Auth0 user with a subject ID is required for synchronization.');
  }

  // Extract Auth0 ID without the "auth0|" prefix if present
  const rawAuth0Id = auth0User.sub;
  const cleanAuth0Id = rawAuth0Id.includes('|') ? rawAuth0Id.split('|')[1] : rawAuth0Id;
  
  const payload = {
    user: {
      auth0_id: cleanAuth0Id,
      email: auth0User.email,
      name: auth0User.name,
      invitation_token: invitationToken,
      roles: ['parent'],
    },
  };

  console.log('📦 [UserSyncService] Payload to send:', {
    auth0_id: cleanAuth0Id,
    auth0_id_full: cleanAuth0Id.length > 20 ? cleanAuth0Id.substring(0, 20) + '...' : cleanAuth0Id,
    email: payload.user.email,
    name: payload.user.name,
    hasInvitationToken: !!invitationToken,
    invitationTokenLength: invitationToken?.length || 0,
    roles: payload.user.roles
  });

  const url = `http://localhost:4000/api/v1/users`;
  console.log('🌐 [UserSyncService] Calling Rails API:', {
    url,
    method: 'POST',
    fullUrl: url
  });

  try {
    console.log('⏳ [UserSyncService] Sending request to Rails backend...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const endTime = Date.now();
    console.log('⏱️ [UserSyncService] Request completed in', endTime - startTime, 'ms');
    console.log('📊 [UserSyncService] Response status:', response.status, response.statusText);

    // Log response headers for debugging
    console.log('📋 [UserSyncService] Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
    });

    const responseText = await response.text();
    console.log('📄 [UserSyncService] Raw response text:', {
      length: responseText.length,
      first500Chars: responseText.substring(0, 500),
      isJson: response.headers.get('content-type')?.includes('application/json')
    });

    let errorData: RailsError = {};
    let railsUser = null;

    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        errorData = JSON.parse(responseText) as RailsError;
        console.log('🔍 [UserSyncService] Parsed error data:', errorData);
      } catch (parseError) {
        console.warn('⚠️ [UserSyncService] Failed to parse error response as JSON:', parseError);
      }
    }

    if (!response.ok) {
      console.error('❌ [UserSyncService] Rails API returned error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        rawResponse: responseText,
        url,
        payload
      });
      
      // Safely extract error message from various possible formats
      const errorMessage = 
        (errorData as any)?.message || 
        (errorData as any)?.error || 
        (typeof errorData === 'string' ? errorData : 
        (errorData.errors && typeof errorData.errors === 'object' ? 
          Object.values(errorData.errors).flat().join(', ') : 
          `User synchronization failed with status ${response.status}`));
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    try {
      railsUser = JSON.parse(responseText);
      console.log('✅ [UserSyncService] Successfully parsed Rails user response:', {
        userId: railsUser.id,
        auth0Id: railsUser.auth0_id,
        email: railsUser.email,
        name: railsUser.name,
        roles: railsUser.roles,
        fullResponse: railsUser
      });
    } catch (parseError) {
      console.error('❌ [UserSyncService] Failed to parse successful response:', parseError);
      throw new Error('Invalid JSON response from Rails API');
    }

    console.log('🎉 [UserSyncService] User synchronization completed successfully');
    return railsUser as RailsUser;

  } catch (error) {
    console.error('💥 [UserSyncService] Unexpected error during synchronization:', {
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userEmail: auth0User.email,
      auth0Id: auth0User.sub
    });
    
    // Re-throw with additional context
    if (error instanceof Error) {
      throw error; // Keep the original error
    } else {
      throw new Error(`An unexpected error occurred during user synchronization: ${String(error)}`);
    }
  }
}

export const UserSyncService = {
  syncUserWithRails,
};

// Utility function to log sync status (optional)
export function logSyncStatus(status: 'started' | 'success' | 'failed', details?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    status,
    details
  };
  
  console.log(`📊 [UserSyncService:${status.toUpperCase()}]`, logEntry);
}