import { z } from 'zod';

export const ClassroomSchema = z.object({
  schoolId: z.string(),
  teacherId: z.string(),
  name: z.string(),
  grade: z.string(),
  students: z.array(z.object({
    studentId: z.string(),
    avatar: z.string().default('default-avatar.png'),
  })).default([]),
  createdAt: z.date().default(() => new Date()),
});

export const StudentSchema = z.object({
  schoolId: z.string(),
  name: z.string(),
  parentIds: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
});

export const PointSchema = z.object({
  schoolId: z.string(),
  teacherId: z.string(),
  studentId: z.string(), // Can be studentId or groupId
  category: z.enum(['Participation', 'Teamwork', 'Respect', 'Leadership']),
  value: z.number().positive(),
  timestamp: z.date().default(() => new Date()),
});

export const StorySchema = z.object({
  schoolId: z.string(),
  classroomId: z.string(),
  teacherId: z.string(),
  content: z.string(),
  media: z.array(z.object({
    url: z.string(),
    type: z.enum(['image', 'video']),
  })).default([]),
  comments: z.array(z.object({
    userId: z.string(),
    text: z.string(),
    timestamp: z.date(),
  })).default([]),
  createdAt: z.date().default(() => new Date()),
});

export const MessageSchema = z.object({
  schoolId: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  status: z.enum(['sent', 'delivered', 'read']).default('sent'),
  timestamp: z.date().default(() => new Date()),
});

export const PortfolioSchema = z.object({
  schoolId: z.string(),
  studentId: z.string(),
  teacherId: z.string(),
  content: z.string(),
  media: z.array(z.object({
    url: z.string(),
    type: z.enum(['image', 'video', 'document']),
  })).default([]),
  feedback: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});
