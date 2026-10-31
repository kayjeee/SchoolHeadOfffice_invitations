// lib/services/student.service.ts
import { z } from 'zod';
import { apiClient } from '../api/api-client';

const GenericResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  user: z.any().optional(),
  learners: z.array(z.any()).optional(),
}).passthrough();

export interface StudentProfile {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  auth0_id?: string;
  roles?: string[];
  phone?: string;
  primary_school_name?: string;
  primarySchoolName?: string;
  school_name?: string;
  schoolName?: string;
  onboarding_completed?: boolean;
  onboarding_status?: any;
  [key: string]: any;
}

export class StudentService {
  /**
   * Synchronizes user in database and adds 'student' role if missing,
   * strictly preserving all pre-existing roles (e.g. parent, teacher, admin).
   */
  static async syncStudentRole(userId: string, email?: string | null, name?: string | null): Promise<void> {
    console.log(`🔄 [StudentService.syncStudentRole] Starting sync for user: ${userId}`);
    try {
      const encodedId = encodeURIComponent(userId);
      let userRecord: any = null;
      let userExists = false;

      // 1. Try to fetch the existing user record
      try {
        const checkRes = await apiClient.get(`/users/${encodedId}`, z.any());
        userRecord = checkRes?.data?.user || checkRes?.user || checkRes?.data || checkRes;
        userExists = !!userRecord;
        console.log(`✅ [StudentService.syncStudentRole] User found in database. Existing roles:`, userRecord?.roles);
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`ℹ️ [StudentService.syncStudentRole] User not found. Creating a new user record with student role.`);

          const userPayload = {
            auth0_id: userId,
            name: name || email || userId,
            email: email || "",
            roles: ["student"],
            user: {
              auth0_id: userId,
              name: name || email || userId,
              email: email || "",
              roles: ["student"],
            }
          };

          try {
            const createRes = await apiClient.post(`/users`, userPayload, z.any());
            userRecord = createRes?.data?.user || createRes?.user || createRes?.data || createRes;
            userExists = !!userRecord;
            console.log(`✅ [StudentService.syncStudentRole] Created new user with student role.`);
            return;
          } catch (createErr) {
            console.error(`❌ [StudentService.syncStudentRole] Failed to create user in database:`, createErr);
          }
        } else {
          console.error(`❌ [StudentService.syncStudentRole] Error checking user existence:`, error);
        }
      }

      // 2. If user exists, verify and add 'student' role without overwriting existing roles
      if (userExists && userRecord) {
        const currentRoles: string[] = userRecord.roles || [];
        const hasStudentRole = currentRoles.some(
          (role) => typeof role === 'string' && role.toLowerCase() === 'student'
        );

        if (!hasStudentRole) {
          const filteredRoles = currentRoles.filter(
            (r) => typeof r === 'string' && r.toLowerCase() !== 'default_role'
          );

          const updatedRoles = Array.from(new Set([...filteredRoles, 'student']));
          console.log(`⚠️ [StudentService.syncStudentRole] Adding 'student' role. New combined roles:`, updatedRoles);

          try {
            await apiClient.patch(`/users/${encodedId}/update_roles`, { roles: updatedRoles }, z.any());
            console.log(`✅ [StudentService.syncStudentRole] Successfully updated roles via /update_roles.`);
          } catch (patchErr) {
            console.error(`❌ [StudentService.syncStudentRole] PATCH update_roles failed, attempting add_role fallback:`, patchErr);
            try {
              await apiClient.post(`/users/${encodedId}/add_role`, { role: 'student' }, z.any());
              console.log(`✅ [StudentService.syncStudentRole] Successfully added 'student' role via add_role.`);
            } catch (addRoleErr) {
              console.error(`❌ [StudentService.syncStudentRole] add_role failed:`, addRoleErr);
            }
          }
        } else {
          console.log(`✅ [StudentService.syncStudentRole] User already has student role. Roles:`, currentRoles);
        }
      }
    } catch (error) {
      console.error(`❌ [StudentService.syncStudentRole] Unexpected error in syncStudentRole:`, error);
    }
  }

  /**
   * Retrieves student user profile by auth0_id
   */
  static async getProfile(userId: string): Promise<StudentProfile | null> {
    console.log(`👤 [StudentService.getProfile] Fetching for: ${userId}`);
    try {
      const result = await apiClient.get(
        `/users/show?auth0_id=${encodeURIComponent(userId)}`,
        GenericResponseSchema
      );

      const profile = result.data?.user || result.user || result.data || result;

      if (profile && !profile.name && (profile.first_name || profile.last_name)) {
        profile.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      console.log(`👤 [StudentService.getProfile] Success: ${profile?.name || 'Unknown'}`);
      return profile as StudentProfile;
    } catch (error) {
      console.error(`❌ [StudentService.getProfile] Error for ${userId}:`, error);
      return null;
    }
  }
}
