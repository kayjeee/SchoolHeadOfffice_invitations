import { z } from 'zod';

export const ParticipantSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  user_name: z.string().optional(),
  messageable: z.boolean().optional().default(true),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.enum(['teacher', 'parent', 'principal', 'admin', 'staff']),
  online_status: z.enum(['online', 'offline']).optional().default('offline'),
});

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  timestamp: z.string(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']).default('sent'),
  is_optimistic: z.boolean().optional(),
  attachment_url: z.string().optional(),
  attachment_type: z.string().optional(),
  attachment_name: z.string().optional(),
  attachment_size: z.number().optional(),
  reactions: z.array(z.object({
    emoji: z.string(),
    count: z.number(),
    current_user_reacted: z.boolean().optional(),
    user_ids: z.array(z.string()).optional(),
  })).optional(),
  is_pinned: z.boolean().optional().default(false),
  starred_by: z.array(z.string()).optional().default([]),
  reply_to_id: z.string().optional(),
  reply_to_preview: z.object({
    content: z.string(),
    sender_name: z.string(),
    attachment_type: z.string().optional(),
  }).optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  participants: z.array(ParticipantSchema).optional().default([]),
  participant_ids: z.array(z.string()).optional().default([]),
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
