import { useState, useEffect, useRef, useCallback } from 'react';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { Message, Conversation } from '@/lib/types/messaging';

/**
 * Hook for managing conversations list
 */
export function useConversations(pollingInterval = 5000) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await MessagingAPI.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchConversations, pollingInterval]);

  return { conversations, loading, error, refresh: fetchConversations };
}

/**
 * Hook for managing messages in a specific conversation
 */
export function useMessages(conversationId: string | null, pollingInterval = 3000) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);

  const lastFetchedId = useRef<string | null>(null);

  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!conversationId) return;

    if (isInitial) setLoading(true);

    try {
      // In a real API, we would pass since_id=lastFetchedId.current to the API
      // For now, we fetch all and merge locally, which is what we can do with current API
      const data = await MessagingAPI.getMessages(conversationId);

      // Filter out messages we already have locally
      setMessages(prev => {
        // Find messages that don't exist in the current state
        const existingIds = new Set(prev.map(m => m.id));

        // Filter out optimistic messages if we have the real ones now
        // This is a simple way to deduplicate: if a real message has the same content
        // and is near the timestamp of an optimistic one, we could replace it.
        // But the current sendMessage already handles replacement by ID.

        const newMessages = data.filter(m => !existingIds.has(m.id));

        if (newMessages.length === 0) return prev;

        // Merge and sort
        const merged = [...prev, ...newMessages].sort((a, b) =>
           new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return merged;
      });

      if (data.length > 0) {
        lastFetchedId.current = data[data.length - 1].id;
      }

      setError(null);
    } catch (err) {
      console.error('Polling error:', err);
      setError(err as Error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setMessages([]);
    fetchMessages(true);

    const interval = setInterval(() => fetchMessages(), pollingInterval);
    return () => clearInterval(interval);
  }, [conversationId, fetchMessages, pollingInterval]);

  const sendMessage = async (content: string, senderId: string) => {
    if (!conversationId || !content.trim()) return;

    // Optimistic Update
    const optimisticMessage: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      is_optimistic: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      const realMessage = await MessagingAPI.sendMessage(conversationId, content);

      // Replace optimistic message with real message
      setMessages(prev =>
        prev.map(m => m.id === optimisticMessage.id ? realMessage : m)
      );

      return realMessage;
    } catch (err) {
      // Mark as failed or remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return { messages, loading, error, isSending, sendMessage };
}

/**
 * Hook for typing indicators
 */
export function useTyping(conversationId: string | null) {
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Send typing status to backend
  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    if (!isLocalTyping) {
      setIsLocalTyping(true);
      MessagingAPI.setTyping(conversationId, true).catch(() => {});
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsLocalTyping(false);
      MessagingAPI.setTyping(conversationId, false).catch(() => {});
    }, 2000);
  }, [conversationId, isLocalTyping]);

  // Simulate receiving typing status from others
  // In a real app, this would be fetched via polling or WebSockets
  useEffect(() => {
    if (!conversationId) {
      setIsOtherTyping(false);
      return;
    }

    // Mock other user typing sometimes when we are active
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        setIsOtherTyping(true);
        setTimeout(() => setIsOtherTyping(false), 3000);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      setIsOtherTyping(false);
    };
  }, [conversationId]);

  return { isOtherTyping, handleTyping };
}
