import { z } from 'zod';
import { apiClient } from './api-client';
import { Participant } from '../types/messaging';
import { slugify } from '@/utils/slugify';

// --- Schemas ---
export const ClassSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().optional(),
  capacity: z.number().optional().default(40),
  current_learners: z.number().optional().default(0),
  learnerCount: z.number().optional(),
  utilization: z.string().optional(),
  utilization_percentage: z.number().optional(),
  class_teacher_id: z.string().nullable().optional(),
  class_teacher_name: z.string().optional(),
  classTeacher: z.string().optional(),
  subject_teachers: z.any().optional(),
  subjectTeachers: z.any().optional(),
  grade_id: z.string().optional(),
  gradeId: z.string().optional(),
}).passthrough().transform(data => ({
  ...data,
  id: data.id || data._id || '',
  name: data.name || 'Unnamed Class',
  current_learners: data.current_learners || data.learnerCount || 0,
  class_teacher_name: data.class_teacher_name || data.classTeacher || '',
  grade_id: data.grade_id || data.gradeId || ''
}));

export const GradeSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().optional(),
  level: z.any().optional(),
  grade_level: z.any().optional(),
  description: z.string().optional(),
  order: z.number().optional().default(0),
  total_classes: z.number().optional(),
  totalClasses: z.number().optional(),
  total_learners: z.number().optional(),
  totalLearners: z.number().optional(),
  stats: z.object({
    classes_count: z.number().optional(),
    learners_count: z.number().optional(),
    classesCount: z.number().optional(),
    learnersCount: z.number().optional(),
  }).optional(),
  classes: z.array(ClassSchema).optional(),
  school_id: z.string().optional(),
  schoolId: z.string().optional(),
}).passthrough().transform(data => {
  const resolvedLevel = typeof data.level === 'number' ? data.level :
    parseInt((data.level || data.grade_level || '').toString().match(/\d+/)?.[0] || '0');

  const levelFromName = parseInt(data.name?.match(/\d+/)?.[0] || '0');

  return {
    ...data,
    id: data.id || data._id || '',
    name: data.name || 'Unnamed Grade',
    level: resolvedLevel || levelFromName,
    total_classes: data.total_classes || data.totalClasses || data.stats?.classes_count || data.stats?.classesCount || data.classes?.length || 0,
    total_learners: data.total_learners || data.totalLearners || data.stats?.learners_count || data.stats?.learnersCount || 0,
    school_id: data.school_id || data.schoolId || ''
  };
});

export const GradeResponseSchema = z.object({
  success: z.boolean(),
  grade: GradeSchema
});

export const GradesResponseSchema = z.union([
  z.object({
    success: z.boolean(),
    grades: z.array(GradeSchema)
  }),
  z.object({
    success: z.boolean(),
    data: z.object({
      grades: z.array(GradeSchema)
    })
  })
]).passthrough();

export const LearnersResponseSchema = z.union([
  z.object({
    success: z.boolean(),
    learners: z.array(LearnerSchema)
  }),
  z.object({
    success: z.boolean(),
    data: z.object({
      learners: z.array(LearnerSchema)
    })
  })
]).passthrough();

export const ParentSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
}).passthrough().transform(data => ({
  ...data,
  id: data.id || data._id || '',
  name: data.name || data.full_name || 'Unnamed Parent'
}));

export const LearnerSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  full_name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  admission_number: z.string().optional(),
  admissionNumber: z.string().optional(),
  accession_number: z.string().optional(),
  accessionNumber: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  parents: z.array(ParentSchema).optional(),
  gender: z.string().optional(),
  gender_text: z.string().optional(),
  status: z.string().optional(),
  status_text: z.string().optional(),
  invitation_id: z.string().optional(),
  class_id: z.string().optional(),
  classId: z.string().optional(),
  class_name: z.string().optional(),
  className: z.string().optional(),
  grade_id: z.string().optional(),
  gradeId: z.string().optional(),
}).passthrough().transform(data => {
  const fName = data.firstName || data.first_name || '';
  const lName = data.lastName || data.last_name || '';
  const fullName = data.name || data.full_name || data.fullName || `${fName} ${lName}`.trim() || 'Unnamed Learner';

  return {
    ...data,
    id: data.id || data._id || '',
    name: fullName,
    admission_number: data.admission_number || data.admissionNumber || data.accession_number || data.accessionNumber || '',
    class_id: data.class_id || data.classId || '',
    class_name: data.class_name || data.className || '',
    grade_id: data.grade_id || data.gradeId || ''
  };
});

export const TeacherSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  user_id: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  slug: z.string().optional(),
  avatar: z.string().optional(),
  grades: z.array(z.string()).optional(),
  auth0_id: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
}).passthrough().transform(data => {
  const fName = data.firstName || '';
  const lName = data.lastName || '';
  const fullName = data.name || `${fName} ${lName}`.trim() || 'Unnamed Teacher';

  return {
    ...data,
    id: data.id || data._id || '',
    name: fullName
  };
});

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
    console.log(`🔍 [SchoolAPI.getSchoolBySlug] Resolving slug: ${slug}`);
    const response = await apiClient.get(`/api/v1/schools?search=${encodeURIComponent(slug)}`, z.any());
    const schools = (response.schools || response.data?.schools || []) as any[];

    // 1. First, try to find a school where the server-provided slug matches exactly.
    let school = schools.find((s: any) => s.slug === slug);

    // 2. If no direct slug match, try slugifying the schoolName and matching that.
    if (!school) {
      school = schools.find((s: any) => slugify(s.schoolName || s.name || '') === slug);
    }

    // 3. If multiple matches might exist, we can't easily filter by current user here
    // without passing it in, but we'll return the best match we found.

    if (!school && schools.length > 0) {
      console.warn(`⚠️ [SchoolAPI.getSchoolBySlug] No exact slug match for "${slug}", but found ${schools.length} results. Returning first result as fallback.`);
      school = schools[0];
    }

    if (!school) {
      console.error(`❌ [SchoolAPI.getSchoolBySlug] Failed to resolve school for slug: ${slug}`);
    } else {
      console.log(`✅ [SchoolAPI.getSchoolBySlug] Resolved to: ${school.schoolName} (${school.id || school._id})`);
    }

    return school || null;
  }

  // Grade CRUD
  static async getGrades(schoolId: string): Promise<Grade[]> {
    console.log(`📚 [SchoolAPI.getGrades] Fetching grades for school: ${schoolId}`);
    const response = await apiClient.get(`/api/v1/schools/${schoolId}/grades`, z.any());
    const gradesData = response.grades || response.data?.grades || response.data || (Array.isArray(response) ? response : []);

    if (Array.isArray(gradesData)) {
      return gradesData.map(g => GradeSchema.parse(g));
    }
    return [];
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
    const response = await apiClient.get(`/api/v1/grades/${gradeId}/classes?school_id=${schoolId}`, z.any());
    // Backend returns { success: true, classes: [...] }
    const classes = response.classes || response.data?.classes || [];
    return Array.isArray(classes) ? z.array(ClassSchema).parse(classes) : [];
  }

  static async createClass(schoolId: string, gradeId: string, data: Partial<Class>): Promise<Class> {
    const payload = { ...data, grade_id: gradeId, school_id: schoolId };
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
    const teachers = response.teachers || response.data?.teachers || response.data || response;
    return Array.isArray(teachers) ? z.array(TeacherSchema).parse(teachers) : [];
  }

  // Learner Movement
  static async moveLearner(learnerId: string, data: { target_class_id: string; school_id: string; grade_id: string }): Promise<void> {
    const endpoint = `/api/v1/schools/${data.school_id}/grades/${data.grade_id}/classes/${data.target_class_id}/move_learner`;
    await apiClient.post(endpoint, {
      learner_id: learnerId
    }, z.any());
  }

  // School Learners
  static async getSchoolLearners(schoolId: string): Promise<Learner[]> {
    const response = await apiClient.get(`/api/v1/schools/${schoolId}/learners`, LearnersResponseSchema);
    if ('learners' in response) return response.learners || [];
    if ('data' in response) return response.data?.learners || [];
    return [];
  }

  // Bulk Upload
  static async bulkUploadLearners(schoolId: string, learners: any[]): Promise<any> {
    return await apiClient.post(`/api/v1/learners/bulk_upload`, {
      school_id: schoolId,
      learners
    }, z.any());
  }

  // Grade Learners
  static async getGradeLearners(schoolId: string, gradeId: string): Promise<Learner[]> {
    console.log(`📖 [SchoolAPI.getGradeLearners] Fetching learners for grade: ${gradeId}`);
    const response = await apiClient.get(`/api/v1/grades/${gradeId}/learners?school_id=${schoolId}`, z.any());

    // Normalize response shape: { learners: [...] } or { data: { learners: [...] } } or [...]
    const learnersData = response.learners || response.data?.learners || response.data || (Array.isArray(response) ? response : []);

    if (Array.isArray(learnersData)) {
      console.log(`✅ [SchoolAPI.getGradeLearners] Found ${learnersData.length} learners for grade ${gradeId}`);
      return learnersData.map(l => LearnerSchema.parse(l));
    }

    console.warn(`⚠️ [SchoolAPI.getGradeLearners] No learners found in response for grade ${gradeId}`, response);
    return [];
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
