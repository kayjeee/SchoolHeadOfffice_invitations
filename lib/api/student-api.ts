// lib/api/student-api.ts
import { z } from 'zod';
import { apiClient } from './api-client';

const GenericResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.any().optional(),
  user: z.any().optional(),
  message: z.string().optional(),
}).passthrough();

export interface StudentProfileData {
  id?: string;
  auth0_id?: string;
  email?: string;
  name?: string;
  first_name?: string;
  surname?: string;
  phone?: string;
  title?: string;
  school_name?: string;
  primary_school_name?: string;
  onboarding_completed?: boolean;
  onboarding_status?: any;
  [key: string]: any;
}

export interface UpdateStudentProfilePayload {
  title?: string;
  first_name?: string;
  surname?: string;
  name?: string;
  phone?: string;
  email?: string;
  school_name?: string;
}

export class StudentAPI {
  /**
   * Fetches the current student's profile from Rails backend
   */
  static async getProfile(auth0Id: string): Promise<StudentProfileData | null> {
    try {
      const response = await apiClient.get(
        `/users/show?auth0_id=${encodeURIComponent(auth0Id)}`,
        GenericResponseSchema
      );
      return response.data?.user || response.user || response.data || response;
    } catch (error) {
      console.error('❌ [StudentAPI.getProfile] Failed to fetch student profile:', error);
      return null;
    }
  }

  /**
   * Updates student profile details
   */
  static async updateProfile(auth0Id: string, payload: UpdateStudentProfilePayload): Promise<StudentProfileData> {
    try {
      const response = await apiClient.patch(
        `/users/${encodeURIComponent(auth0Id)}/update_profile`,
        payload,
        GenericResponseSchema
      );
      return response.data?.user || response.user || response.data || response;
    } catch (error) {
      console.error('❌ [StudentAPI.updateProfile] Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Complete student onboarding step
   */
  static async completeStep(auth0Id: string, stepName: string, metadata: any = {}): Promise<boolean> {
    try {
      const response = await apiClient.post(
        `/users/${encodeURIComponent(auth0Id)}/onboarding_status/complete_step`,
        { step_name: stepName, metadata },
        GenericResponseSchema
      );
      return response.success !== false;
    } catch (error) {
      console.error(`❌ [StudentAPI.completeStep] Failed to mark step ${stepName} as completed:`, error);
      return false;
    }
  }
}
