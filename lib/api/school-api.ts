import { z } from 'zod';
import { apiClient } from './api-client';
import { Participant } from '../types/messaging';

// --- Schemas ---
export const ClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number().default(40),
  current_learners: z.number().default(0),
  utilization: z.string().optional(),
  utilization_percentage: z.number().optional(),
  class_teacher_id: z.string().nullable().optional(),
  class_teacher_name: z.string().optional(),
  subject_teachers: z.union([
    z.array(z.object({ name: z.string(), subject: z.string() })),
    z.record(z.string())
  ]).optional(),
  grade_id: z.string().optional(),
}).passthrough();

export const GradeSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().default(0),
  description: z.string().optional(),
  order: z.number().default(0),
  total_classes: z.number().optional(),
  total_learners: z.number().optional(),
  classes: z.array(ClassSchema).optional(),
  school_id: z.string(),
}).passthrough();

export const GradeResponseSchema = z.object({
  success: z.boolean(),
  grade: GradeSchema
});

export const GradesResponseSchema = z.object({
  success: z.boolean(),
  grades: z.array(GradeSchema)
});

export const LearnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  admission_number: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  parents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })).optional(),
  status: z.enum(['Linked', 'Pending', 'Unlinked']).default('Unlinked'),
  invitation_id: z.string().optional(),
}).passthrough();

export const TeacherSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  avatar: z.string().optional(),
  grades: z.array(z.string()).optional(),
  auth0_id: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
}).passthrough();

// --- Types ---
export type Grade = z.infer<typeof GradeSchema>;
export type Class = z.infer<typeof ClassSchema>;
export type Teacher = z.infer<typeof TeacherSchema>;
export type Learner = z.infer<typeof LearnerSchema>;

export interface GradeAssignment {
  id: string;
  grade_name: string;
  learner_count: number;
  connection_rate?: number;
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

export class SchoolAPI {
  // School Lookup
  static async getSchoolBySlug(slug: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/schools?search=${encodeURIComponent(slug)}`, z.any());
    const schools = response.schools || [];
    return schools.find((s: any) => s.slug === slug) || schools[0];
  }

  // Grade CRUD
  static async getGrades(schoolId: string): Promise<Grade[]> {
    console.log(`📚 [SchoolAPI.getGrades] Fetching grades for school: ${schoolId}`);
    const response = await apiClient.get(`/api/v1/schools/${schoolId}/grades`, GradesResponseSchema);
    return response.grades || [];
  }

  static async getGrade(gradeId: string): Promise<Grade> {
    const response = await apiClient.get(`/api/v1/grades/${gradeId}`, GradeResponseSchema);
    return response.grade;
  }

  static async createGrade(schoolId: string, data: Partial<Grade>): Promise<Grade> {
    const response = await apiClient.post(`/api/v1/schools/${schoolId}/grades`, { grade: data }, z.any());
    const responseData = (response as any).data || response;
    const grade = responseData.grade || responseData;
    return GradeSchema.parse(grade);
  }

  static async updateGrade(gradeId: string, data: Partial<Grade>): Promise<Grade> {
    const response = await apiClient.patch(`/api/v1/grades/${gradeId}`, { grade: data }, z.any());
    const responseData = (response as any).data || response;
    const grade = responseData.grade || responseData;
    return GradeSchema.parse(grade);
  }

  static async deleteGrade(gradeId: string): Promise<void> {
    await apiClient.delete(`/api/v1/grades/${gradeId}`, z.any());
  }

  // Class CRUD
  static async getClasses(schoolId: string, gradeId: string): Promise<Class[]> {
    const response = await apiClient.get(`/api/v1/grades/${gradeId}/classes`, z.any());
    const data = (response as any).data || response;
    const classes = data.classes || data;
    return Array.isArray(classes) ? z.array(ClassSchema).parse(classes) : [];
  }

  static async createClass(schoolId: string, gradeId: string, data: Partial<Class>): Promise<Class> {
    const payload = { ...data, grade_id: gradeId };
    const response = await apiClient.post(`/api/v1/grades/${gradeId}/classes`, { class: payload }, z.any());
    const responseData = (response as any).data || response;
    const cls = responseData.class || responseData;
    return ClassSchema.parse({ grade_id: gradeId, ...cls });
  }

  static async updateClass(schoolId: string, gradeId: string, classId: string, data: Partial<Class>): Promise<Class> {
    const payload = { ...data, grade_id: gradeId };
    const response = await apiClient.patch(`/api/v1/classes/${classId}`, { class: payload }, z.any());
    const responseData = (response as any).data || response;
    const cls = responseData.class || responseData;
    return ClassSchema.parse({ grade_id: gradeId, ...cls });
  }

  static async deleteClass(schoolId: string, gradeId: string, classId: string): Promise<void> {
    await apiClient.delete(`/api/v1/classes/${classId}`, z.any());
  }

  // Teacher Assignment
  static async assignTeacher(classId: string, data: { teacher_id: string; role: string; subject_ids?: string[] }): Promise<void> {
    await apiClient.post(`/api/v1/classes/${classId}/assign_teacher`, {
      teacher_id: data.teacher_id,
      role: data.role,
      subject_id: data.subject_ids?.[0],
      subject_ids: data.subject_ids
    }, z.any());
  }

  static async getTeachers(schoolId: string): Promise<Teacher[]> {
    const response = await apiClient.get(`/api/v1/schools/${schoolId}/teachers`, z.any());
    const data = (response as any).data || response;
    const teachers = data.teachers || data;
    return Array.isArray(teachers) ? z.array(TeacherSchema).parse(teachers) : [];
  }

  // Learner Movement
  static async moveLearner(learnerId: string, data: { target_class_id: string; school_id?: string }): Promise<void> {
    await apiClient.post(`/api/v1/learners/${learnerId}/move`, {
      learner_id: learnerId,
      ...data
    }, z.any());
  }

  // Grade Learners
  static async getGradeLearners(gradeId: string): Promise<Learner[]> {
    const response = await apiClient.get(`/api/v1/grades/${gradeId}/learners`, z.any());
    const data = (response as any).data || response;
    const learners = data.learners || data;
    return Array.isArray(learners) ? z.array(LearnerSchema).parse(learners) : [];
  }

  // Global Search
  static async globalSearch(schoolId: string, query: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/schools/${schoolId}/global_search?q=${encodeURIComponent(query)}`, z.any());
    const data = (response as any).data || response;
    return data.results || [];
  }

  // Legacy/Directory Support
  static async getDirectory(schoolId: string): Promise<{ admins: Participant[]; teachers: Participant[]; parents: Participant[] }> {
    const response = await apiClient.get(`/schools/${schoolId}/directory`, z.any());
    const data = (response as any).data || response;
    return {
      admins: data.admins || [],
      teachers: data.teachers || [],
      parents: data.parents || [],
    };
  }

  static async getTeacherProfile(teacherId: string): Promise<{ teacher: Teacher; stats: TeacherStats }> {
    const response = await apiClient.get(`/users/${teacherId}`, z.any());
    const data = (response as any).data || response;
    return {
      teacher: TeacherSchema.parse(data.teacher || data),
      stats: data.stats || { total_learners: 0, active_grades: 0, pending_invites: 0, parent_connection_rate: 0 }
    };
  }
}
