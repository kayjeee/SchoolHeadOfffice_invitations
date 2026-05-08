import { apiClient, APIError } from './api-client';
import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParticipantSnippet {
  id: string;
  name: string;
  full_name: string;        // mirrors what the backend now sends
  avatar: string | null;
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
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_size?: number;
  reactions?: MessageReaction[];
  reply_to_id?: string;
  reply_to_preview?: {
    content: string;
    sender_name: string;
    attachment_type?: string;
  };
}

export interface MessageReaction {
  emoji: string;
  count: number;
  current_user_reacted?: boolean;
  user_ids?: string[];
}

// Structured error thrown by createConversation so the UI can branch on it.
export class ConversationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'SELF_MESSAGE'         // only participant is the current user
      | 'PARTICIPANT_NOT_FOUND'// one or more IDs don't exist in the DB
      | 'MISSING_SCHOOL'       // school_id was not provided
      | 'VALIDATION_FAILED'    // Mongoid validation errors
      | 'UNKNOWN',             // catch-all
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'ConversationError';
  }
}

// ─── API class ───────────────────────────────────────────────────────────────

export class MessagingAPI {

  /** Fetch all conversations for the current user, newest first. */
  static async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/api/v1/conversations', z.any()) as any;
    const raw = response?.data ?? response?.conversations ?? response;
    const list: any[] = Array.isArray(raw) ? raw : [];
    return list.map(normalizeConversation);
  }

  /**
   * Create or retrieve a conversation.
   *
   * Error handling:
   *   - Throws ConversationError with a typed `code` so callers can show
   *     specific UI messages instead of generic "Something went wrong".
   *   - Never hangs: every backend error path is mapped and re-thrown.
   *
   * Self-messaging:
   *   - Allowed. If participantIds contains only the current user's ID
   *     (or is empty), the backend will create/return a "Note to self"
   *     conversation.  The frontend should not block this.
   */
  static async createConversation(
    participantIds: string[],
    schoolId?: string
  ): Promise<Conversation> {
    if (!schoolId) {
      throw new ConversationError(
        'school_id is required to create a conversation',
        'MISSING_SCHOOL'
      );
    }

    const payload = {
      participant_ids: participantIds,
      conversation:   { school_id: schoolId },
    };

    let response: any;

    try {
      response = await apiClient.post('/api/v1/conversations', payload, z.any());
    } catch (err) {
      // apiClient throws APIError for non-2xx responses.
      // Map each backend error shape to a typed ConversationError.
      if (err instanceof APIError) {
        throw mapApiError(err);
      }
      // Network failure, timeout, etc.
      throw new ConversationError(
        'Network error — please check your connection and try again',
        'UNKNOWN'
      );
    }

    // Backend returns { success: true, data: { ... } }
    // or { success: false, error: "..." } with a 2xx status (shouldn't happen, but guard it)
    const body = response as any;

    if (body?.success === false) {
      throw new ConversationError(
        body.error || 'Failed to create conversation',
        classifyErrorMessage(body.error),
        body.errors
      );
    }

    const raw = body?.data ?? body?.conversation ?? body;
    return normalizeConversation(raw);
  }

  /** Fetch messages for a conversation, oldest first. */
  static async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get(
      `/api/v1/conversations/${conversationId}/messages`,
      z.any()
    ) as any;
    const raw = response?.data ?? response?.messages ?? response;
    const list: any[] = Array.isArray(raw) ? raw : [];
    return list.map(normalizeMessage);
  }

  /** Send a message and return the server-confirmed copy. */
  static async sendMessage(
    conversationId: string,
    content: string,
    attachment?: { url: string; type: string; name: string; size?: number },
    replyToId?: string
  ): Promise<Message> {
    const messagePayload: any = { content };
    if (attachment) {
      messagePayload.attachment_url = attachment.url;
      messagePayload.attachment_type = attachment.type;
      messagePayload.attachment_name = attachment.name;
      messagePayload.attachment_size = attachment.size;
    }
    if (replyToId) {
      messagePayload.reply_to_id = replyToId;
    }

    const response = await apiClient.post(
      `/api/v1/conversations/${conversationId}/messages`,
      { message: messagePayload },
      z.any()
    ) as any;
    const raw = response?.data ?? response?.message ?? response;
    return normalizeMessage(raw);
  }

  /** React to a message and return the backend-confirmed payload. */
  static async reactToMessage(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<any> {
    const response = await apiClient.post(
      `/api/v1/conversations/${conversationId}/messages/${messageId}/react`,
      { emoji },
      z.any()
    ) as any;

    return response?.data ?? response?.message ?? response;
  }

  /** Search messages in a conversation. */
  static async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    if (!query.trim()) return [];
    const response = await apiClient.get(
      `/api/v1/conversations/${conversationId}/messages/search?q=${encodeURIComponent(query)}`,
      z.any()
    ) as any;
    const raw = response?.data ?? response?.messages ?? response;
    const list: any[] = Array.isArray(raw) ? raw : [];
    return list.map(normalizeMessage);
  }

  /** Mark all messages in a conversation as read. Never throws. */
  static async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.put(
        `/api/v1/conversations/${conversationId}/read`,
        {},
        z.object({ success: z.boolean() }).passthrough()
      );
    } catch {
      return { success: false };
    }
  }

  /** Fire-and-forget typing notification. Never throws. */
  static async setTyping(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      await apiClient.post(
        `/api/v1/conversations/${conversationId}/typing`,
        { is_typing: isTyping },
        z.any()
      );
    } catch { /* endpoint may not exist yet — intentionally swallowed */ }
  }
}

// ─── Error mapping ────────────────────────────────────────────────────────────

/**
 * Maps an APIError (HTTP-level) to a ConversationError (semantic-level).
 * Called when the backend returns a non-2xx status from POST /conversations.
 */
function mapApiError(err: APIError): ConversationError {
  const msg: string = err.message || '';

  // 400 Bad Request
  if (err.status === 400) {
    return new ConversationError(msg, 'MISSING_SCHOOL');
  }

  // 422 Unprocessable Entity — backend sends different messages for each case
  if (err.status === 422) {
    const code = classifyErrorMessage(msg);
    const details = (err.details as any)?.errors;
    return new ConversationError(msg, code, Array.isArray(details) ? details : undefined);
  }

  // 404 — one or more participant IDs don't exist
  if (err.status === 404) {
    return new ConversationError(msg, 'PARTICIPANT_NOT_FOUND');
  }

  return new ConversationError(msg || 'An unexpected error occurred', 'UNKNOWN');
}

/**
 * Reads the backend error message string and returns the closest semantic code.
 * Keeps the classification in one place so it's easy to extend.
 */
function classifyErrorMessage(msg?: string): ConversationError['code'] {
  if (!msg) return 'UNKNOWN';
  const lower = msg.toLowerCase();
  if (lower.includes('yourself') || lower.includes('self'))   return 'SELF_MESSAGE';
  if (lower.includes('not found') || lower.includes('missing participant')) return 'PARTICIPANT_NOT_FOUND';
  if (lower.includes('school'))                               return 'MISSING_SCHOOL';
  if (lower.includes('validation') || lower.includes('invalid')) return 'VALIDATION_FAILED';
  return 'UNKNOWN';
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

/**
 * Converts a raw backend conversation object (any shape) into a typed Conversation.
 * Handles all known field aliases from the Rails serializer.
 */
export function normalizeConversation(c: any): Conversation {
  if (!c || typeof c !== 'object') {
    throw new ConversationError(
      'Received an invalid conversation object from the server',
      'UNKNOWN'
    );
  }

  const participants: ParticipantSnippet[] = (c.participants || []).map(
    normalizeParticipant
  );

  return {
    id:              String(c.id || c._id?.$oid || c._id || ''),
    // title is now built server-side — fall back to client-side only if missing
    title:           c.title || buildTitle(participants) || null,
    participant_ids: (c.participant_ids || []).map(String),
    participants,
    school_id:       c.school_id ? String(c.school_id) : null,
    last_message:    c.last_message ? normalizeLastMessage(c.last_message) : null,
    unread_count:    Number(c.unread_count ?? 0),
    updated_at:      c.updated_at || c.last_message_at || c.created_at || new Date().toISOString(),
    created_at:      c.created_at || new Date().toISOString(),
  };
}

/**
 * Normalizes a participant object.
 * Priority for name: name → full_name → first+last → 'Unknown'
 * This matches the `serialize_participant` method in the Rails controller.
 */
function normalizeParticipant(p: any): ParticipantSnippet {
  const resolvedName =
    p.name?.trim() ||
    p.full_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(' ').trim() ||
    'Unknown';

  return {
    id:            String(p.id || p._id?.$oid || p._id || ''),
    name:          resolvedName,
    full_name:     resolvedName,
    avatar:        p.avatar || p.profile_image || null,
    role:          p.role || 'staff',
    online_status: p.online_status === 'online' ? 'online' : 'offline',
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
    attachment_url:  m.attachment_url,
    attachment_type: m.attachment_type,
    attachment_name: m.attachment_name,
    attachment_size: m.attachment_size,
    reactions:       normalizeReactions(m.reactions || m.reaction_counts || []),
    reply_to_id:      m.reply_to_id ? String(m.reply_to_id) : undefined,
    reply_to_preview: m.reply_to_preview ? {
      content: String(m.reply_to_preview.content || ''),
      sender_name: String(m.reply_to_preview.sender_name || 'Contact'),
      attachment_type: m.reply_to_preview.attachment_type ? String(m.reply_to_preview.attachment_type) : undefined,
    } : undefined,
  };
}

export function normalizeReactions(raw: any): MessageReaction[] {
  if (!raw) return [];

  if (typeof raw === 'object' && raw.emoji) {
    return [{
      emoji: String(raw.emoji),
      count: Number(raw.count ?? raw.total ?? 1),
      current_user_reacted: Boolean(
        raw.current_user_reacted ?? raw.reacted_by_current_user ?? raw.mine
      ),
      user_ids: Array.isArray(raw.user_ids)
        ? raw.user_ids.map(String)
        : undefined,
    }].filter(reaction => reaction.emoji && reaction.count > 0);
  }

  if (Array.isArray(raw)) {
    return raw
      .map((reaction: any) => ({
        emoji: String(reaction.emoji || reaction.name || ''),
        count: Number(reaction.count ?? reaction.total ?? 0),
        current_user_reacted: Boolean(
          reaction.current_user_reacted ?? reaction.reacted_by_current_user ?? reaction.mine
        ),
        user_ids: Array.isArray(reaction.user_ids)
          ? reaction.user_ids.map(String)
          : undefined,
      }))
      .filter(reaction => reaction.emoji && reaction.count > 0);
  }

  if (typeof raw === 'object') {
    return Object.entries(raw)
      .map(([emoji, value]: [string, any]) => {
        if (typeof value === 'number') {
          return { emoji, count: value };
        }

        return {
          emoji,
          count: Number(value?.count ?? value?.total ?? 0),
          current_user_reacted: Boolean(
            value?.current_user_reacted ?? value?.reacted_by_current_user ?? value?.mine
          ),
          user_ids: Array.isArray(value?.user_ids)
            ? value.user_ids.map(String)
            : undefined,
        };
      })
      .filter(reaction => reaction.emoji && reaction.count > 0);
  }

  return [];
}

/**
 * Client-side title builder.
 * Used only as a fallback when the backend omits the `title` field.
 */
function buildTitle(participants: ParticipantSnippet[]): string {
  if (participants.length === 0) return 'Conversation';
  if (participants.length === 1) return participants[0].name;
  if (participants.length === 2)
    return participants.map(p => p.name.split(' ')[0]).join(' & ');
  return `${participants[0].name.split(' ')[0]} & ${participants.length - 1} others`;
}
