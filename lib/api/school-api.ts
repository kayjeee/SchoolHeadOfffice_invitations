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
  auth0_id?: string;
  bio?: string;
  email?: string;
}

export interface GradeAssignment {
  id: string;
  grade_name: string;
  learner_count: number;
  connection_rate?: number;
}

export interface Grade {
  id: string;
  name: string;
  school_id: string;
}

export interface Learner {
  id: string;
  name: string;
  parent_name?: string;
  parent_phone?: string;
  status: 'Linked' | 'Pending' | 'Unlinked';
  invitation_id?: string;
}

export interface TeacherStats {
  total_learners: number;
  active_grades: number;
  pending_invites: number;
  parent_connection_rate: number;
}

export interface LearnerInvitation {
  id: string;
  parent_name: string;
  parent_phone: string;
  learner_name: string;
  status: 'Sent' | 'Delivered' | 'Accepted';
  created_at: string;
}

export interface LearnerInvitationDetail extends LearnerInvitation {
  learner_id: string;
  last_action?: string;
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
        auth0_id: t.auth0_id || t.auth0Id || null,
        bio: t.bio || '',
        email: t.email || '',
      }));
    } catch (error) {
      console.error(`❌ [SchoolAPI.getTeachers] Failed to fetch teachers for school ${schoolId}:`, error);
      return [];
    }
  }

  static async getTeacherGradeAssignments(teacherId: string): Promise<GradeAssignment[]> {
    console.log(`📚 [SchoolAPI.getTeacherGradeAssignments] Fetching assignments for teacherId: ${teacherId}`);

    const responseSchema = z.object({
      assignments: z.array(z.any()),
    });

    const endpoint = `/teacher_grade_assignments?teacher_id=${teacherId}`;
    try {
      const response = await apiClient.get(endpoint, responseSchema);
      const assignments = response.assignments || (Array.isArray(response) ? response : []);

      return assignments.map((a: any) => ({
        id: a.id || a._id?.$oid || a._id || '',
        grade_name: a.grade_name || a.gradeName || 'Unknown Grade',
        learner_count: a.learner_count || a.learnerCount || 0,
        connection_rate: a.connection_rate || a.connectionRate || 0,
      }));
    } catch (error) {
      console.error(`❌ [SchoolAPI.getTeacherGradeAssignments] Failed to fetch assignments for teacher ${teacherId}:`, error);
      return [];
    }
  }

  static async getTeacherProfile(teacherId: string): Promise<{ teacher: Teacher; stats: TeacherStats }> {
    console.log(`👤 [SchoolAPI.getTeacherProfile] Fetching profile for: ${teacherId}`);

    const responseSchema = z.object({
      teacher: z.any(),
      stats: z.object({
        total_learners: z.number(),
        active_grades: z.number(),
        pending_invites: z.number(),
        parent_connection_rate: z.number(),
      }),
    });

    const response = await apiClient.get(`/users/${teacherId}`, responseSchema);

    const t = response.teacher;
    const teacher: Teacher = {
      id: t.id || t._id?.$oid || t._id || '',
      name: t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unknown Teacher',
      slug: t.slug || t.id || '',
      avatar: t.avatar || t.profile_image || null,
      grades: t.grades || t.grade_names || [],
      auth0_id: t.auth0_id || t.auth0Id || null,
      bio: t.bio || '',
      email: t.email || '',
    };

    return {
      teacher,
      stats: response.stats,
    };
  }

  static async getPendingInvitations(teacherId: string): Promise<LearnerInvitation[]> {
    console.log(`📨 [SchoolAPI.getPendingInvitations] Fetching for teacherId: ${teacherId}`);

    const responseSchema = z.object({
      invitations: z.array(z.any()),
    });

    const endpoint = `/learner_invitations/pending?teacher_id=${teacherId}`;
    try {
      const response = await apiClient.get(endpoint, responseSchema);
      const invitations = response.invitations || (Array.isArray(response) ? response : []);

      return invitations.map((inv: any) => ({
        id: inv.id || inv._id?.$oid || inv._id || '',
        parent_name: inv.parent_name || 'Unknown Parent',
        parent_phone: inv.parent_phone || inv.recipient_phone_number || '',
        learner_name: inv.learner_name || '',
        status: inv.status || 'Sent',
        created_at: inv.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error(`❌ [SchoolAPI.getPendingInvitations] Failed to fetch invitations:`, error);
      return [];
    }
  }

  static async inviteParent(gradeId: string, data: { parent_name: string; parent_phone: string; learner_name: string }): Promise<{ success: boolean; invitation?: LearnerInvitation }> {
    console.log(`➕ [SchoolAPI.inviteParent] Sending invite for grade ${gradeId}`);

    const responseSchema = z.object({
      success: z.boolean(),
      invitation: z.any().optional(),
    });

    return await apiClient.post(`/grades/${gradeId}/invite_learner`, data, responseSchema);
  }

  static async getGrade(gradeId: string): Promise<Grade> {
    console.log(`📚 [SchoolAPI.getGrade] Fetching grade: ${gradeId}`);
    const responseSchema = z.object({
      grade: z.any(),
    });
    const response = await apiClient.get(`/grades/${gradeId}`, responseSchema);
    return {
      id: response.grade.id,
      name: response.grade.name || response.grade.grade_name,
      school_id: response.grade.school_id,
    };
  }

  static async getGradeLearners(gradeId: string): Promise<Learner[]> {
    console.log(`👨‍🎓 [SchoolAPI.getGradeLearners] Fetching learners for grade: ${gradeId}`);
    const responseSchema = z.object({
      learners: z.array(z.any()),
    });
    const response = await apiClient.get(`/grades/${gradeId}/learners`, responseSchema);
    return response.learners.map((l: any) => ({
      id: l.id,
      name: l.name,
      parent_name: l.parent_name,
      parent_phone: l.parent_phone,
      status: l.status || 'Unlinked',
      invitation_id: l.invitation_id,
    }));
  }

  static async getGradeInvitations(gradeId: string): Promise<LearnerInvitationDetail[]> {
    console.log(`📨 [SchoolAPI.getGradeInvitations] Fetching invitations for grade: ${gradeId}`);
    const responseSchema = z.object({
      invitations: z.array(z.any()),
    });
    const response = await apiClient.get(`/learner_invitations/by_grade/${gradeId}`, responseSchema);
    return response.invitations.map((inv: any) => ({
      id: inv.id,
      parent_name: inv.parent_name,
      parent_phone: inv.parent_phone,
      learner_name: inv.learner_name,
      learner_id: inv.learner_id,
      status: inv.status,
      created_at: inv.created_at,
      last_action: inv.last_action,
    }));
  }

  static async bulkCreateInvitations(learnerIds: string[]): Promise<{ success: boolean; batch_status?: any }> {
    console.log(`📨 [SchoolAPI.bulkCreateInvitations] Bulk creating for ${learnerIds.length} learners`);
    const responseSchema = z.object({
      success: z.boolean(),
      batch_status: z.any().optional(),
    });
    return await apiClient.post('/invitations/bulk_create', { learner_ids: learnerIds }, responseSchema);
  }

  static async resendInvitation(invitationId: string): Promise<{ success: boolean }> {
    console.log(`🔄 [SchoolAPI.resendInvitation] Resending invitation: ${invitationId}`);
    const responseSchema = z.object({
      success: z.boolean(),
    });
    return await apiClient.post(`/learner_invitations/${invitationId}/resend`, {}, responseSchema);
  }
}
