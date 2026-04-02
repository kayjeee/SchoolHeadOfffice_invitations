import { z } from 'zod';

export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.enum(['teacher', 'parent', 'principal', 'admin']),
  online_status: z.enum(['online', 'offline']).optional().default('offline'),
});

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  timestamp: z.string(),
  status: z.enum(['sent', 'delivered', 'read']).default('sent'),
  is_optimistic: z.boolean().optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  participants: z.array(ParticipantSchema),
  last_message: MessageSchema.optional(),
  unread_count: z.number().default(0),
  updated_at: z.string(),
  title: z.string().optional(),
});

export type Participant = z.infer<typeof ParticipantSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;

export const ConversationListResponseSchema = z.object({
  status: z.string().optional(),
  data: z.array(ConversationSchema).optional(),
  conversations: z.array(ConversationSchema).optional(),
});

export const MessageListResponseSchema = z.object({
  status: z.string().optional(),
  data: z.array(MessageSchema).optional(),
  messages: z.array(MessageSchema).optional(),
});
