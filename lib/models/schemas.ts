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
