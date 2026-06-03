import { z } from 'zod';
import { apiClient } from './api-client';
import { Participant } from '../types/messaging';

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
  user_id?: string;
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
  learnersCount?: number;
  classes?: Class[];
}

export interface Class {
  id: string;
  name: string;
  grade_id: string;
  learnerCount: number;
  capacity: number;
  classTeacher?: string;
  subjectTeachers?: { name: string; subject: string }[];
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

    // The backend wraps responses in a "data" object.
    const responseSchema = z.object({
      status: z.string().optional(),
      message: z.string().nullable().optional(),
      data: z.object({
        schools: z.array(z.any()),
        totalCount: z.number().optional(),
        total_count: z.number().optional(),
        page: z.number().optional(),
      }).optional()
    });

    const endpoint = `/schools?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
    const response = await apiClient.get(endpoint, responseSchema);
    const responseData = response.data || response;

    // Map the response to our interface
    // Note: Backend might use _id, or id, and different casing for totalCount
    const schools = (responseData.schools || []).map((s: any) => ({
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
      totalCount: responseData.totalCount || responseData.total_count || schools.length,
      page: responseData.page || page,
    };
  }

  static async getTeachers(schoolId: string): Promise<Teacher[]> {
    console.log(`👨‍🏫 [SchoolAPI.getTeachers] Fetching teachers for schoolId: ${schoolId}`);

    const responseSchema = z.object({
      status: z.string().optional(),
      message: z.string().nullable().optional(),
      data: z.union([
        z.array(z.any()),
        z.object({
          teachers: z.array(z.any()).optional()
        })
      ]).optional(),
      teachers: z.array(z.any()).optional(),
    }).passthrough();

    const endpoint = `/schools/${schoolId}/teachers`;
    try {
      const response = await apiClient.get(endpoint, responseSchema);
      const data = (response as any).data;
      const teachersList = Array.isArray(data) ? data : (data?.teachers || response.teachers || []);

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
      status: z.string().optional(),
      message: z.string().nullable().optional(),
      data: z.union([
        z.array(z.any()),
        z.object({
          assignments: z.array(z.any()).optional()
        })
      ]).optional(),
      assignments: z.array(z.any()).optional(),
    }).passthrough();

    const endpoint = `/teacher_grade_assignments?teacher_id=${teacherId}`;
    try {
      const response = await apiClient.get(endpoint, responseSchema);
      const data = (response as any).data;
      const assignments = Array.isArray(data) ? data : (data?.assignments || response.assignments || []);

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
      data: z.object({
        teacher: z.any(),
        stats: z.any(),
      }).optional(),
      teacher: z.any().optional(),
      stats: z.object({
        total_learners: z.number(),
        active_grades: z.number(),
        pending_invites: z.number(),
        parent_connection_rate: z.number(),
      }).optional(),
    });

    let responseData = null;
    try {
      const response = await apiClient.get(`/users/${teacherId}`, responseSchema);
      responseData = (response as any).data || response;
    } catch (err: any) {
      if (err.status === 404) {
        console.log(`ℹ️ [SchoolAPI.getTeacherProfile] User endpoint failed for ${teacherId}, trying /teachers/${teacherId}/profile...`);
        try {
           const altResponse = await apiClient.get(`/teachers/${teacherId}/profile`, responseSchema);
           responseData = (altResponse as any).data || altResponse;
        } catch (altErr: any) {
           console.warn(`⚠️ [SchoolAPI.getTeacherProfile] Profile endpoint failed: ${altErr.message}`);
           // If everything fails, return null instead of throwing to allow GSSP to use teacherBrief
           return {
             teacher: { id: teacherId, name: 'Teacher Profile', slug: teacherId, grades: [] },
             stats: { total_learners: 0, active_grades: 0, pending_invites: 0, parent_connection_rate: 0 }
           };
        }
      } else {
        throw err;
      }
    }

    const t = responseData.teacher || responseData;
    const teacher: Teacher = {
      id: t.id || t._id?.$oid || t._id || teacherId,
      name: t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unknown Teacher',
      slug: t.slug || t.id || teacherId,
      avatar: t.avatar || t.profile_image || null,
      grades: t.grades || t.grade_names || [],
      auth0_id: t.auth0_id || t.auth0Id || null,
      bio: t.bio || '',
      email: t.email || '',
    };

    return {
      teacher,
      stats: responseData.stats || {
        total_learners: 0,
        active_grades: 0,
        pending_invites: 0,
        parent_connection_rate: 0
      },
    };
  }

  static async getPendingInvitations(teacherId: string): Promise<LearnerInvitation[]> {
    console.log(`📨 [SchoolAPI.getPendingInvitations] Fetching for teacherId: ${teacherId}`);

    const responseSchema = z.object({
      status: z.string().optional(),
      message: z.string().nullable().optional(),
      data: z.union([
        z.array(z.any()),
        z.object({
          invitations: z.array(z.any()).optional()
        })
      ]).optional(),
      invitations: z.array(z.any()).optional(),
    }).passthrough();

    const endpoint = `/learner_invitations/pending?teacher_id=${teacherId}`;
    try {
      const response = await apiClient.get(endpoint, responseSchema);
      const data = (response as any).data;
      const invitations = Array.isArray(data) ? data : (data?.invitations || response.invitations || []);

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
      data: z.object({ grade: z.any() }).optional(),
      grade: z.any().optional(),
    });
    const response = await apiClient.get(`/grades/${gradeId}`, responseSchema);
    const responseData = (response as any).data || response;
    return {
      id: responseData.grade.id,
      name: responseData.grade.name || responseData.grade.grade_name,
      school_id: responseData.grade.school_id,
    };
  }

  static async getGradeLearners(gradeId: string): Promise<Learner[]> {
    console.log(`👨‍🎓 [SchoolAPI.getGradeLearners] Fetching learners for grade: ${gradeId}`);
    const responseSchema = z.object({
      data: z.object({ learners: z.array(z.any()) }).optional(),
      learners: z.array(z.any()).optional(),
    });
    const response = await apiClient.get(`/grades/${gradeId}/learners`, responseSchema);
    const responseData = (response as any).data || response;
    return (responseData.learners || []).map((l: any) => ({
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
      data: z.object({ invitations: z.array(z.any()) }).optional(),
      invitations: z.array(z.any()).optional(),
    });
    const response = await apiClient.get(`/learner_invitations/by_grade/${gradeId}`, responseSchema);
    const responseData = (response as any).data || response;
    return (responseData.invitations || []).map((inv: any) => ({
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

  static async getGrades(schoolId: string): Promise<Grade[]> {
    console.log(`📚 [SchoolAPI.getGrades] Fetching grades for school: ${schoolId}`);

    const responseSchema = z.object({
      data: z.union([z.array(z.any()), z.object({ grades: z.array(z.any()) })]).optional(),
      grades: z.array(z.any()).optional()
    }).passthrough();

    const response = await apiClient.get(`http://localhost:4000/api/admin/grades?schoolId=${schoolId}`, responseSchema);
    const grades = (response as any).data?.grades || (response as any).data || response.grades || response;

    return Array.isArray(grades) ? grades.map((g: any) => ({
      id: g.id || g._id?.$oid || g._id,
      name: g.name || g.grade_name || g.name,
      school_id: g.school_id || schoolId,
      learnersCount: g.learners_count || g.learnersCount || 0,
      classes: (g.classes || []).map((c: any) => ({
        id: c.id || c._id?.$oid || c._id,
        name: c.name || c.class_name,
        grade_id: g.id || g._id?.$oid || g._id,
        learnerCount: c.learner_count || c.learners_count || 0,
        capacity: c.capacity || 40,
        classTeacher: c.class_teacher || c.teacher_name,
        subjectTeachers: c.subject_teachers || [],
      }))
    })) : [];
  }

  static async createGrade(schoolId: string, data: { name: string }): Promise<Grade> {
    const response = await apiClient.post(`http://localhost:4000/api/admin/grades?schoolId=${schoolId}`, { grade: data }, z.any());
    const responseData = (response as any).data || response;
    return responseData.grade || responseData;
  }

  static async getClasses(gradeId: string): Promise<Class[]> {
    const responseSchema = z.object({
      data: z.union([z.array(z.any()), z.object({ classes: z.array(z.any()) })]).optional(),
      classes: z.array(z.any()).optional()
    }).passthrough();

    const response = await apiClient.get(`http://localhost:4000/api/admin/classes?gradeId=${gradeId}`, responseSchema);
    const classes = (response as any).data?.classes || (response as any).data || response.classes || response;

    if (!Array.isArray(classes)) return [];

    return classes.map((c: any) => ({
      id: c.id || c._id?.$oid || c._id,
      name: c.name || c.class_name,
      grade_id: gradeId,
      learnerCount: c.learner_count || c.learners_count || 0,
      capacity: c.capacity || 40,
      classTeacher: c.class_teacher || c.teacher_name,
      subjectTeachers: c.subject_teachers || [],
    }));
  }

  static async assignTeacher(classId: string, data: { teacher_id: string; role: string; subject_ids?: string[] }): Promise<{ success: boolean }> {
    return await apiClient.post(`http://localhost:4000/api/admin/assign-teacher?classId=${classId}`, {
      teacher_id: data.teacher_id,
      role: data.role,
      subject_ids: data.subject_ids
    }, z.any());
  }

  static async moveLearner(learnerId: string, data: { target_class_id: string }): Promise<{ success: boolean }> {
    return await apiClient.post(`http://localhost:4000/api/admin/transition-learner?learnerId=${learnerId}`, {
      target_class_id: data.target_class_id
    }, z.any());
  }

  static async getDirectory(schoolId: string): Promise<{ admins: Participant[]; teachers: Participant[]; parents: Participant[] }> {
    console.log(`📇 [SchoolAPI.getDirectory] Fetching directory for school: ${schoolId}`);

    const ParticipantSchema = z.object({
      id: z.string(),
      user_id: z.string().optional(),
      user_name: z.string().optional(),
      messageable: z.boolean().optional().default(true),
      name: z.string(),
      avatar: z.string().optional(),
      role: z.enum(['teacher', 'parent', 'principal', 'admin', 'staff']),
      online_status: z.enum(['online', 'offline']).optional().default('offline'),
    });

    const responseSchema = z.object({
      status: z.string().optional(),
      data: z.object({
        admins: z.array(ParticipantSchema).optional(),
        teachers: z.array(ParticipantSchema).optional(),
        parents: z.array(ParticipantSchema).optional(),
      }).optional(),
      admins: z.array(ParticipantSchema).optional(),
      teachers: z.array(ParticipantSchema).optional(),
      parents: z.array(ParticipantSchema).optional(),
    });

    try {
      const response = await apiClient.get(`/schools/${schoolId}/directory`, responseSchema);
      const data = response.data || response;

      return {
        admins: data.admins || [],
        teachers: data.teachers || [],
        parents: data.parents || [],
      };
    } catch (error) {
      console.error(`❌ [SchoolAPI.getDirectory] Failed to fetch directory:`, error);
      return { admins: [], teachers: [], parents: [] };
    }
  }
}
