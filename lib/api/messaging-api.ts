import { apiClient } from './api-client';
import {
  Conversation,
  Message,
  ConversationListResponseSchema,
  MessageListResponseSchema,
  ConversationSchema,
  MessageSchema
} from '@/lib/types/messaging';
import { z } from 'zod';

export class MessagingAPI {
  /**
   * Fetch all conversations for the current user
   */
  static async getConversations(): Promise<Conversation[]> {
    const schema = z.object({
      conversations: z.array(z.any()).optional(),
      data: z.any().optional(),
    }).passthrough();

    const response = await apiClient.get('/conversations', schema) as any;
    const raw = response.data || response;
    const list = Array.isArray(raw)
      ? raw
      : raw.conversations || raw.data || [];

    return list.map((c: any) => normalizeConversation(c));
  }

  /**
   * Create a new conversation with a set of participants
   */
  static async createConversation(participantIds: string[], schoolId?: string): Promise<Conversation> {
    const payload = {
      participant_ids: participantIds,
      ...(schoolId ? { conversation: { school_id: schoolId } } : {}),
    };

    // Backend may return { data: conv }, { conversation: conv }, or the conv directly
    const responseSchema = z.any();
    const response = await apiClient.post('/conversations', payload, responseSchema) as any;

    const raw = response?.data ?? response?.conversation ?? response;
    return normalizeConversation(raw);
  }

  /**
   * Fetch messages for a specific conversation
   */
  static async getMessages(conversationId: string): Promise<Message[]> {
    const schema = z.object({
      messages: z.array(z.any()).optional(),
      data: z.any().optional(),
    }).passthrough();

    const response = await apiClient.get(`/conversations/${conversationId}/messages`, schema) as any;
    const raw = response.data || response;
    const list = Array.isArray(raw)
      ? raw
      : raw.messages || raw.data || [];

    return list.map((m: any) => normalizeMessage(m));
  }

  /**
   * Send a new message in a conversation
   */
  static async sendMessage(conversationId: string, content: string): Promise<Message> {
    const schema = z.any();
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      { content },
      schema
    ) as any;
    const raw = response?.data ?? response?.message ?? response;
    return normalizeMessage(raw);
  }

  /**
   * Mark messages in a conversation as read
   */
  static async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.put(
        `/conversations/${conversationId}/read`,
        {},
        z.object({ success: z.boolean() }).passthrough()
      );
    } catch {
      return { success: false };
    }
  }

  /**
   * Notify the backend that the user is typing
   */
  static async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      await apiClient.post(
        `/conversations/${conversationId}/typing`,
        { is_typing: isTyping },
        z.any()
      );
    } catch {
      // Ignore if endpoint doesn't exist yet
    }
  }
}

// ─── Normalizers ────────────────────────────────────────────────────────────

function normalizeConversation(c: any): Conversation {
  return {
    id: c.id || c._id?.$oid || c._id || '',
    title: c.title || c.name || null,
    participants: c.participants || [],
    participant_ids: c.participant_ids || [],
    last_message: c.last_message || null,
    unread_count: c.unread_count ?? 0,
    updated_at: c.updated_at || c.created_at || new Date().toISOString(),
    created_at: c.created_at || new Date().toISOString(),
    school_id: c.school_id || null,
  } as any;
}

function normalizeMessage(m: any): Message {
  return {
    id: m.id || m._id?.$oid || m._id || `msg-${Date.now()}`,
    conversation_id: m.conversation_id || '',
    sender_id: m.sender_id || m.user_id || m.author_id || '',
    content: m.content || m.body || m.text || '',
    timestamp: m.timestamp || m.created_at || new Date().toISOString(),
    status: m.status || 'sent',
    is_optimistic: false,
  } as any;
}