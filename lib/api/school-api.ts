import { z } from 'zod';
import { apiClient } from './api-client';

export interface School {
  id: string;
  schoolName: string;
  city: string;
  province: string;
  country: string;
  logo: string | null;
  status: string;
  teacherCount?: number;
  learnerCount?: number;
  gradeCount?: number;
}

export interface Teacher {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  grades: string[];
}

export interface GetSchoolsResponse {
  schools: School[];
  totalCount: number;
  page: number;
}

export class SchoolAPI {
  static async getSchools(params: { search?: string; page?: number; limit?: number } = {}): Promise<GetSchoolsResponse> {
    const { search = '', page = 1, limit = 20 } = params;

    console.log(`🏫 [SchoolAPI.getSchools] Fetching: search="${search}", page=${page}, limit=${limit}`);

    // Since I don't know the exact response structure of the backend yet,
    // I'll use a schema that captures the expected fields but is flexible.
    const responseSchema = z.object({
      success: z.boolean().optional(),
      schools: z.array(z.any()),
      totalCount: z.number().optional(),
      total_count: z.number().optional(),
      page: z.number().optional(),
    });

    const endpoint = `/schools?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
    const response = await apiClient.get(endpoint, responseSchema);

    // Map the response to our interface
    // Note: Backend might use _id, or id, and different casing for totalCount
    const schools = (response.schools || []).map((s: any) => ({
      id: s.id || s._id?.$oid || s._id || '',
      schoolName: s.schoolName || s.name || 'Unknown School',
      city: s.city || '',
      province: s.province || '',
      country: s.country || '',
      logo: s.logo || s.school_logo || null,
      status: s.status || 'active',
      teacherCount: s.teacher_count || s.teacherCount || 0,
      learnerCount: s.learner_count || s.learnerCount || 0,
      gradeCount: s.grade_count || s.gradeCount || 0,
    }));

    return {
      schools,
      totalCount: response.totalCount || response.total_count || schools.length,
      page: response.page || page,
    };
  }

  static async getTeachers(schoolId: string): Promise<Teacher[]> {
    console.log(`👨‍🏫 [SchoolAPI.getTeachers] Fetching teachers for schoolId: ${schoolId}`);

    const responseSchema = z.object({
      teachers: z.array(z.any()),
    });

    const endpoint = `/schools/${schoolId}/teachers`;
    try {
      const response = await apiClient.get(endpoint, responseSchema);
      const teachersList = response.teachers || (Array.isArray(response) ? response : []);

      return teachersList.map((t: any) => ({
        id: t.id || t._id?.$oid || t._id || '',
        name: t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unknown Teacher',
        slug: t.slug || t.id || '',
        avatar: t.avatar || t.profile_image || null,
        grades: t.grades || t.grade_names || [],
      }));
    } catch (error) {
      console.error(`❌ [SchoolAPI.getTeachers] Failed to fetch teachers for school ${schoolId}:`, error);
      return [];
    }
  }
}
