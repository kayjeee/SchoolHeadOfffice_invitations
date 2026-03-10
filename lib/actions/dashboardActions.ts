'use server';

import clientPromise from '@/lib/mongodb';
import { ClassroomSchema, StudentSchema, PointSchema } from '@/lib/models/dashboard-schemas';
import { createAuditLog } from '@/lib/utils/auditLogger';
import { ObjectId } from 'mongodb';

// --- Classroom Actions ---

export async function createClassroom(data: { schoolId: string, teacherId: string, name: string, grade: string }) {
  const client = await clientPromise;
  const db = client.db();

  const validated = ClassroomSchema.parse({
    ...data,
    students: [],
    createdAt: new Date(),
  });

  const result = await db.collection('classrooms').insertOne(validated);

  await createAuditLog({
    schoolId: data.schoolId,
    userId: data.teacherId,
    action: 'CLASSROOM_CREATE',
    metadata: { classroomId: result.insertedId, name: data.name },
  });

  console.log('[CLASSROOM_CREATE]', { schoolId: data.schoolId, teacherId: data.teacherId, name: data.name });

  return { success: true, id: result.insertedId };
}

export async function addStudentToClass(schoolId: string, classroomId: string, studentName: string) {
  const client = await clientPromise;
  const db = client.db();

  // 1. Create Student
  const studentData = StudentSchema.parse({
    schoolId,
    name: studentName,
    parentIds: [],
    createdAt: new Date(),
  });

  const studentResult = await db.collection('students').insertOne(studentData);
  const studentId = studentResult.insertedId.toString();

  // 2. Add to Classroom (Isolated by schoolId)
  await db.collection('classrooms').updateOne(
    { _id: new ObjectId(classroomId), schoolId },
    { $push: { students: { studentId, avatar: 'default-avatar.png' } } } as any
  );

  console.log('[STUDENT_ADD]', { schoolId, classroomId, studentName, studentId });

  return { success: true, studentId };
}

// --- Points System ---

export async function awardPoint(data: { schoolId: string, teacherId: string, studentId: string, category: 'Participation' | 'Teamwork' | 'Respect' | 'Leadership' }) {
  const client = await clientPromise;
  const db = client.db();

  const validated = PointSchema.parse({
    ...data,
    value: 1,
    timestamp: new Date(),
  });

  await db.collection('points').insertOne(validated);

  console.log('[POINT_AWARD]', { ...data, timestamp: validated.timestamp });

  return { success: true };
}

export async function getStudentPoints(schoolId: string, studentId: string) {
  const client = await clientPromise;
  const db = client.db();

  const points = await db.collection('points').find({ studentId, schoolId }).toArray();
  return JSON.parse(JSON.stringify(points));
}
