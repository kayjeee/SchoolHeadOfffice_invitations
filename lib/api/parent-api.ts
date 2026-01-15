// lib/api/parent-api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'shobackendv2-production.up.railway.app/api/v1';

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  grade_name?: string;
  learner_number: string;
  school_id?: string;
  school_name: string;
  grade: string;
  status: 'active' | 'inactive';
}

export interface ParentProfile {
  id: string;
  auth0_id: string;
  name: string;
  email: string;
  phone_number?: string;
  roles: string[];
  school_ids: string[];
  needsOnboarding?: boolean;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  phone: string;
}

/**
 * 🔐 Parent API (API-only, no non-versioned routes)
 */
export class ParentAPI {
  /**
   * Get user profile by auth0_id
   */
  static async getProfile(auth0Id: string): Promise<ParentProfile | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${encodeURIComponent(auth0Id)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.success ? data.data.user : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * 🔁 Normalizes frontend → backend contract
   */
  static async updateProfile(
    auth0Id: string,
    profileData: UpdateProfileData
  ): Promise<{ success: boolean; user?: ParentProfile; error?: string }> {
    try {
      const payload = {
        user: {
          name: `${profileData.first_name} ${profileData.last_name}`.trim(),
          phone_number: profileData.phone,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/users/${encodeURIComponent(auth0Id)}/update_profile`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.errors?.join(', ') || 'Failed to update profile',
        };
      }

      return {
        success: true,
        user: data.data.user,
      };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message || 'Unexpected error',
      };
    }
  }

  /**
   * Get learners linked to parent
   */
static async getMyLearners(auth0Id: string): Promise<{
  success: boolean;
  learners: Learner[];
  learner_count?: number;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/parents/${encodeURIComponent(auth0Id)}/my_learners`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch learners');
      return { success: false, learners: [] };
    }

    const data = await response.json();

    // ✅ API returns root-level learners
    return {
      success: true,
      learners: Array.isArray(data.learners) ? data.learners : [],
      learner_count: data.learner_count,
    };
  } catch (error) {
    console.error('Error fetching learners:', error);
    return { success: false, learners: [] };
  }
}


  /**
   * Link learner using invitation token
   * (intentionally proxied via Next.js API route)
   */
  static async linkLearner(
    invitationToken: string,
    phoneNumber: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch('/api/parent/link-learners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_token: invitationToken,
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return { success: true, message: data.message };
    } catch (error: any) {
      console.error('Error linking learner:', error);
      return { success: false, error: error.message };
    }
  }
}