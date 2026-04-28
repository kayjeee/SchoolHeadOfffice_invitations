import { useState, useRef, useCallback, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { MessagingAPI, normalizeMessage } from '@/lib/api/messaging-api';
import { Message, Conversation } from '@/lib/types/messaging';
import { useApi } from './useApi';
import { getCable } from '@/lib/cable';

/**
 * Hook for managing conversations list
 */
export function useConversations() {
  const { accessToken, user, isLoading: isAuthLoading } = useApi();

  const { data: conversations = [], error, isLoading } = useSWR(
    accessToken ? '/conversations' : null,
    () => MessagingAPI.getConversations(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  // Real-time updates for the conversation list
  useEffect(() => {
    if (!conversations.length || !user?.email || !accessToken) return;

    const cable = getCable(user.email);
    if (!cable) return;

    // Subscribe to each conversation to update the list (unread counts, last message)
    // when any conversation receives a message.
    const subs = conversations.map(conv => {
      return cable.subscriptions.create(
        { channel: 'ConversationChannel', id: conv.id },
        {
          received: () => {
            mutate('/conversations');
          }
        }
      );
    });

    return () => {
      subs.forEach(s => s.unsubscribe());
    };
  }, [conversations.map(c => c.id).join(','), user?.email, accessToken]);

  return {
    conversations,
    loading: isLoading || isAuthLoading,
    error,
    refresh: () => mutate('/conversations'),
  };
}

/**
 * Hook for managing messages in a specific conversation
 */
export function useMessages(conversationId: string | null) {
  const { accessToken, user, isLoading: isAuthLoading } = useApi();
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  const swrKey = accessToken && conversationId
    ? `/conversations/${conversationId}/messages`
    : null;

  const { data: remoteMessages = [], error, isLoading, mutate: mutateMessages } = useSWR(
    swrKey,
    () => MessagingAPI.getMessages(conversationId!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 1500,
    }
  );

  // Subscribe to real-time updates via Action Cable
  useEffect(() => {
    if (!conversationId || !user?.email || !accessToken) return;

    const cable = getCable(user.email);
    if (!cable) return;

    const subscription = cable.subscriptions.create(
      { channel: 'ConversationChannel', id: conversationId },
      {
        received: (data: any) => {
          const newMessage = normalizeMessage(data);

          // Update the specific conversation's messages
          mutateMessages((current: Message[] = []) => {
            if (current.some(m => m.id === newMessage.id)) return current;
            return [...current, newMessage];
          }, { revalidate: false });

          // Refresh the conversation list to update last message and unread count
          mutate('/conversations');
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user?.email, accessToken, mutateMessages]);

  // Remove optimistic messages already confirmed by the server
  const filteredOptimistic = optimisticMessages.filter(opt => {
    const isAlreadyInRemote = remoteMessages.some(
      rem =>
        rem.sender_id === opt.sender_id &&
        rem.content === opt.content &&
        Math.abs(
          new Date(rem.timestamp).getTime() - new Date(opt.timestamp).getTime()
        ) < 60_000
    );
    return !isAlreadyInRemote;
  });

  const messages = [...remoteMessages, ...filteredOptimistic].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const sendMessage = async (content: string, senderId: string) => {
    if (!conversationId || !content.trim()) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      is_optimistic: true,
    } as any;

    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      const realMessage = await MessagingAPI.sendMessage(conversationId, content);

      // Update cache and clear optimistic
      mutate(swrKey, [...remoteMessages, realMessage], false);
      setOptimisticMessages(prev =>
        prev.filter(m => m.id !== optimisticMessage.id)
      );

      return realMessage;
    } catch (err) {
      setOptimisticMessages(prev =>
        prev.filter(m => m.id !== optimisticMessage.id)
      );
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
    sendMessage,
  };
}

/**
 * Hook for typing indicators
 * NOTE: exports `isOtherTyping` (not `isTyping`) — used in MessagingSection
 */
export function useTyping(conversationId: string | null) {
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Typing status can also be moved to ActionCable in the future,
  // but for now we keep it simple as it wasn't explicitly requested
  // and would require backend changes for broadcasting.

  return {
    isOtherTyping,  // ← correct export name consumed by MessagingSection
    handleTyping,
  };
}