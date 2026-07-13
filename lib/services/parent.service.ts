// lib/services/parent.service.ts
import { z } from 'zod';
import { ParentProfile, Learner } from '../api/parent-api';
import { apiClient } from '../api/api-client';

const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "dev-q3l2f3kyx1zmv3iq.us.auth0.com";

// ========================
// SERVICE CLASS
// ========================

const GenericResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  user: z.any().optional(),
  learners: z.array(z.any()).optional(),
}).passthrough();

export class ParentService {
  static async getAuth0ManagementToken(): Promise<string | null> {
    const url = `https://${AUTH0_DOMAIN}/oauth/token`;
    const body = {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error('❌ [ParentService] Failed to fetch Auth0 management token:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.access_token || null;
    } catch (error) {
      console.error('❌ [ParentService] Error fetching Auth0 management token:', error);
      return null;
    }
  }

  static async assignAuth0ParentRole(userId: string): Promise<void> {
    try {
      const token = await this.getAuth0ManagementToken();
      if (!token) {
        console.warn('⚠️ [ParentService] Skipping Auth0 role assignment because token is null');
        return;
      }

      // 1. Fetch all roles to find the ID of the 'Parent' role
      const rolesRes = await fetch(`https://${AUTH0_DOMAIN}/api/v2/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!rolesRes.ok) {
        console.error('❌ [ParentService] Failed to fetch Auth0 roles:', await rolesRes.text());
        return;
      }

      const roles = await rolesRes.json();
      const parentRole = roles.find((r: any) => r.name === 'Parent' || r.name === 'parent');

      if (!parentRole) {
        console.warn('⚠️ [ParentService] "Parent" role not found in Auth0 configuration');
        return;
      }

      // 2. Assign the 'Parent' role to the user
      const assignRes = await fetch(
        `https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roles: [parentRole.id] }),
        }
      );

      if (!assignRes.ok) {
        console.error('❌ [ParentService] Failed to assign Auth0 Parent role:', await assignRes.text());
      } else {
        console.log('✅ [ParentService] Successfully assigned "Parent" role in Auth0');
      }
    } catch (error) {
      console.error('❌ [ParentService] Error in assignAuth0ParentRole:', error);
    }
  }

  static async syncParentRole(userId: string, email?: string | null, name?: string | null): Promise<void> {
    console.log(`🔄 [ParentService.syncParentRole] Starting sync for user: ${userId}`);
    try {
      const encodedId = encodeURIComponent(userId);
      let userRecord: any = null;
      let userExists = false;

      // 1. Try to fetch the user record
      try {
        const checkRes = await apiClient.get(`/users/${encodedId}`, z.any());
        userRecord = checkRes?.data?.user || checkRes?.user || checkRes?.data || checkRes;
        userExists = !!userRecord;
        console.log(`✅ [ParentService.syncParentRole] User found in database. Existing roles:`, userRecord?.roles);
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`ℹ️ [ParentService.syncParentRole] User not found. Creating a new user record.`);

          // 2. Create the user if they don't exist
          // We provide both flat and nested 'user' payloads for maximum compatibility
          const userPayload = {
            auth0_id: userId,
            name: name || email || userId,
            email: email || "",
            roles: ["parent"],
            user: {
              auth0_id: userId,
              name: name || email || userId,
              email: email || "",
              roles: ["parent"],
            }
          };

          try {
            const createRes = await apiClient.post(`/users`, userPayload, z.any());
            userRecord = createRes?.data?.user || createRes?.user || createRes?.data || createRes;
            userExists = !!userRecord;
            console.log(`✅ [ParentService.syncParentRole] Created new user with parent role.`);

            // Assign "Parent" role in Auth0 because the user is newly created
            await this.assignAuth0ParentRole(userId);
            return; // Created with 'parent' role, so we are done!
          } catch (createErr) {
            console.error(`❌ [ParentService.syncParentRole] Failed to create user in database:`, createErr);
          }
        } else {
          console.error(`❌ [ParentService.syncParentRole] Error checking user existence:`, error);
        }
      }

      // 3. If user exists, check and update roles
      if (userExists && userRecord) {
        const currentRoles: string[] = userRecord.roles || [];
        const hasParentRole = currentRoles.some(
          (role) => typeof role === 'string' && role.toLowerCase() === 'parent'
        );

        if (!hasParentRole) {
          // Normalize existing roles: filter out 'default_role' and ensure unique lowercase roles
          const filteredRoles = currentRoles.filter(
            (r) => typeof r === 'string' && r.toLowerCase() !== 'default_role'
          );

          const updatedRoles = Array.from(new Set([...filteredRoles, 'parent']));
          console.log(`⚠️ [ParentService.syncParentRole] Adding 'parent' role. New roles:`, updatedRoles);

          // Update backend database roles
          try {
            await apiClient.patch(`/users/${encodedId}/update_roles`, { roles: updatedRoles }, z.any());
            console.log(`✅ [ParentService.syncParentRole] Successfully updated roles via /update_roles.`);
          } catch (patchErr) {
            console.error(`❌ [ParentService.syncParentRole] PATCH to update_roles failed, trying direct user update:`, patchErr);
            try {
              await apiClient.put(`/users/${encodedId}`, { user: { roles: updatedRoles } }, z.any());
              console.log(`✅ [ParentService.syncParentRole] Successfully updated roles via PUT /users/:id.`);
            } catch (putErr) {
              console.error(`❌ [ParentService.syncParentRole] PUT /users/:id failed:`, putErr);
            }
          }

          // Securely assign "Parent" role in Auth0 too (gated inside !hasParentRole block)
          await this.assignAuth0ParentRole(userId);
        } else {
          console.log(`✅ [ParentService.syncParentRole] User already has parent role. Roles:`, currentRoles);
        }
      }

    } catch (error) {
      console.error(`❌ [ParentService.syncParentRole] Unexpected error in syncParentRole:`, error);
    }
  }

  static async getProfile(userId: string): Promise<ParentProfile | null> {
    console.log(`👤 [ParentService.getProfile] Fetching for: ${userId}`);
    try {
      const result = await apiClient.get(
        `/users/show?auth0_id=${encodeURIComponent(userId)}`,
        GenericResponseSchema
      );

      // Handle the data structure returned by /users/show
      const profile = result.data?.user || result.user || result.data || result;

      if (profile && !profile.name && (profile.first_name || profile.last_name)) {
        profile.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      console.log(`👤 [ParentService.getProfile] Success: ${profile?.name || 'Unknown'}`);
      return profile as ParentProfile;
    } catch (error) {
      console.error(`❌ [ParentService.getProfile] Error for ${userId}:`, error);
      return null;
    }
  }

  static async getLearners(userId: string): Promise<Learner[]> {
    console.log(`🎓 [ParentService.getLearners] Fetching for: ${userId}`);
    try {
      const result = await apiClient.get(
        `/parents/my_learners?auth0_id=${encodeURIComponent(userId)}`,
        GenericResponseSchema
      );

      // The backend returns { success: true, learners: [...] }
      const learners = result.learners || [];

      console.log(`🎓 [ParentService.getLearners] Found ${learners.length} learners for ${userId}`);
      return learners as Learner[];
    } catch (error) {
      console.error(`❌ [ParentService.getLearners] Error for ${userId}:`, error);
      return [];
    }
  }

  static async linkInvitation(userId: string, invitationId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/parents/${userId}/link-invitation`, { invitationId }, GenericResponseSchema);
      return { success: true };
    } catch (error) {
      console.error(`Error linking invitation ${invitationId} to user ${userId}:`, error);
      return { success: false };
    }
  }
}
