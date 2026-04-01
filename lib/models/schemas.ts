import { z } from 'zod';

export const InviteSchema = z.object({
  schoolId: z.string(),
  email: z.string().email(),
  role: z.enum(['teacher']).default('teacher'),
  expiresAt: z.date(),
  status: z.enum(['pending', 'accepted', 'expired']).default('pending'),
  tokenHash: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export type Invite = z.infer<typeof InviteSchema>;

export const AuditLogSchema = z.object({
  schoolId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string(),
  metadata: z.any(),
  timestamp: z.date().default(() => new Date()),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const SchoolSchema = z.object({
  name: z.string(),
  slug: z.string(),
  settings: z.any().optional(),
});

export type School = z.infer<typeof SchoolSchema>;

export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['teacher', 'parent', 'principal', 'staff']),
  avatar: z.string().optional(),
});

export const MessageSchema = z.object({
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  status: z.enum(['sent', 'delivered', 'read']).default('sent'),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.any()).optional(),
});

export const ConversationSchema = z.object({
  schoolId: z.string(),
  type: z.enum(['direct', 'group']),
  participants: z.array(ParticipantSchema),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
