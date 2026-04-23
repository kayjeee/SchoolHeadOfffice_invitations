import { apiClient } from './api-client';
import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParticipantSnippet {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
  online_status: 'online' | 'offline';
}

export interface LastMessage {
  id: string;
  content: string;
  sender_id: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  title: string | null;
  participant_ids: string[];
  participants: ParticipantSnippet[];
  school_id: string | null;
  last_message: LastMessage | null;
  unread_count: number;
  updated_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  is_optimistic?: boolean;
}

// ─── API class ───────────────────────────────────────────────────────────────

export class MessagingAPI {
  /** Fetch all conversations for the current user */
  static async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/conversations', z.any()) as any;
    const raw = response?.data ?? response?.conversations ?? response;
    const list: any[] = Array.isArray(raw) ? raw : [];
    return list.map(normalizeConversation);
  }

  /** Create or retrieve a conversation */
  static async createConversation(participantIds: string[], schoolId?: string): Promise<Conversation> {
    const payload = {
      participant_ids: participantIds,
      ...(schoolId ? { conversation: { school_id: schoolId } } : {}),
    };
    const response = await apiClient.post('/conversations', payload, z.any()) as any;
    const raw = response?.data ?? response?.conversation ?? response;
    return normalizeConversation(raw);
  }

  /** Fetch messages for a conversation */
  static async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get(
      `/conversations/${conversationId}/messages`,
      z.any()
    ) as any;
    const raw = response?.data ?? response?.messages ?? response;
    const list: any[] = Array.isArray(raw) ? raw : [];
    return list.map(normalizeMessage);
  }

  /** Send a message */
  static async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      { content },
      z.any()
    ) as any;
    const raw = response?.data ?? response?.message ?? response;
    return normalizeMessage(raw);
  }

  /** Mark all messages as read */
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

  /** Fire-and-forget typing notification */
  static async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      await apiClient.post(
        `/conversations/${conversationId}/typing`,
        { is_typing: isTyping },
        z.any()
      );
    } catch { /* endpoint may not exist yet */ }
  }
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeConversation(c: any): Conversation {
  const participants: ParticipantSnippet[] = (c.participants || []).map((p: any) => ({
    id:            String(p.id || p._id?.$oid || p._id || ''),
    name:          p.name || [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
    avatar:        p.avatar || p.profile_image || null,
    role:          p.role || 'staff',
    online_status: p.online_status || 'offline',
  }));

  const lastMsg = c.last_message ? normalizeLastMessage(c.last_message) : null;

  return {
    id:              String(c.id || c._id?.$oid || c._id || ''),
    title:           c.title || buildTitle(participants) || null,
    participant_ids: (c.participant_ids || []).map(String),
    participants,
    school_id:       c.school_id ? String(c.school_id) : null,
    last_message:    lastMsg,
    unread_count:    c.unread_count ?? 0,
    updated_at:      c.updated_at || c.last_message_at || c.created_at || new Date().toISOString(),
    created_at:      c.created_at || new Date().toISOString(),
  };
}

function normalizeLastMessage(m: any): LastMessage {
  return {
    id:        String(m.id || m._id?.$oid || m._id || ''),
    content:   m.content || m.body || m.text || '',
    sender_id: String(m.sender_id || m.user_id || ''),
    timestamp: m.timestamp || m.created_at || new Date().toISOString(),
    read:      m.read ?? false,
  };
}

export function normalizeMessage(m: any): Message {
  return {
    id:              String(m.id || m._id?.$oid || m._id || `msg-${Date.now()}`),
    conversation_id: String(m.conversation_id || ''),
    sender_id:       String(m.sender_id || m.user_id || m.author_id || ''),
    content:         m.content || m.body || m.text || '',
    timestamp:       m.timestamp || m.created_at || new Date().toISOString(),
    status:          m.status || 'sent',
    is_optimistic:   false,
  };
}

/** Client-side title builder — only used as a fallback if the backend omits title */
function buildTitle(participants: ParticipantSnippet[]): string {
  if (participants.length === 0) return 'Conversation';
  if (participants.length === 1) return participants[0].name;
  if (participants.length === 2)
    return participants.map(p => p.name.split(' ')[0]).join(' & ');
  return `${participants[0].name.split(' ')[0]} & ${participants.length - 1} others`;
}