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
    const response = await apiClient.get('/conversations', ConversationListResponseSchema);
    return response.conversations || response.data || [];
  }

  /**
   * Create a new conversation with a set of participants
   */
  static async createConversation(participantIds: string[], schoolId?: string): Promise<Conversation> {
    const payload = {
      participant_ids: participantIds,
      conversation: schoolId ? { school_id: schoolId } : {}
    };

    const responseSchema = z.object({
      success: z.boolean(),
      data: ConversationSchema
    });

    const response = await apiClient.post('/conversations', payload, responseSchema);
    return response.data;
  }

  /**
   * Fetch messages for a specific conversation
   */
  static async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`, MessageListResponseSchema);
    return response.messages || response.data || [];
  }

  /**
   * Send a new message in a conversation
   */
  static async sendMessage(conversationId: string, content: string): Promise<Message> {
    return apiClient.post(`/conversations/${conversationId}/messages`, { content }, MessageSchema);
  }

  /**
   * Mark messages in a conversation as read
   */
  static async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    return apiClient.put(`/conversations/${conversationId}/read`, {}, z.object({ success: z.boolean() }));
  }

  /**
   * Notify the backend that the user is typing
   */
  static async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    // This might be a no-op if only using local state for now,
    // but good to have if the backend supports it.
    try {
      await apiClient.post(`/conversations/${conversationId}/typing`, { is_typing: isTyping }, z.any());
    } catch (e) {
      // Ignore if endpoint doesn't exist yet
    }
  }
}
