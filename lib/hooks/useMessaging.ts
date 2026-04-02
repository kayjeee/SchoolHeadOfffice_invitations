import { useState, useRef, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { Message, Conversation } from '@/lib/types/messaging';

/**
 * Hook for managing conversations list
 */
export function useConversations() {
  const { data: conversations = [], error, isLoading } = useSWR(
    '/conversations',
    () => MessagingAPI.getConversations(),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  return {
    conversations,
    loading: isLoading,
    error,
    refresh: () => mutate('/conversations')
  };
}

/**
 * Hook for managing messages in a specific conversation
 */
export function useMessages(conversationId: string | null) {
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  // Fetch messages using SWR
  const { data: remoteMessages = [], error, isLoading } = useSWR(
    conversationId ? `/conversations/${conversationId}/messages` : null,
    () => MessagingAPI.getMessages(conversationId!),
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  // Combine remote and optimistic messages, deduplicating by content for local feel
  // We filter out optimistic messages that match the content of a remote message
  // from the same sender within the last minute, to prevent duplication during polling.
  const filteredOptimistic = optimisticMessages.filter(opt => {
    const isAlreadyInRemote = remoteMessages.some(rem =>
      rem.sender_id === opt.sender_id &&
      rem.content === opt.content &&
      Math.abs(new Date(rem.timestamp).getTime() - new Date(opt.timestamp).getTime()) < 60000
    );
    return !isAlreadyInRemote;
  });

  const messages = [...remoteMessages, ...filteredOptimistic].sort((a, b) =>
     new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

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

    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      const realMessage = await MessagingAPI.sendMessage(conversationId, content);

      // Update SWR cache and remove optimistic
      mutate(`/conversations/${conversationId}/messages`, [...remoteMessages, realMessage], false);
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));

      return realMessage;
    } catch (err) {
      // Remove optimistic message on failure
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    loading: isLoading,
    error,
    isSending,
    sendMessage
  };
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
  useSWR(
    conversationId ? `/conversations/${conversationId}/typing` : null,
    async () => {
      // Logic to check if others are typing
      // Mocking 20% chance of other user typing
      if (Math.random() > 0.8) {
        setIsOtherTyping(true);
        setTimeout(() => setIsOtherTyping(false), 3000);
      }
      return null;
    },
    { refreshInterval: 10000 }
  );

  return { isOtherTyping, handleTyping };
}
