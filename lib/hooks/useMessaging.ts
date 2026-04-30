import { useState, useRef, useCallback, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { Message, Conversation } from '@/lib/types/messaging';
import { useApi } from './useApi';
import { getCableConsumer } from '@/lib/cable';

/**
 * Hook for managing conversations list
 */
export function useConversations() {
  const { accessToken, isLoading: isAuthLoading } = useApi();

  const swrKey = accessToken ? '/api/v1/conversations' : null;
  if (swrKey) {
    console.log(`🔑 [useConversations] SWR Key generated: ${swrKey}`);
  }

  const { data: conversations = [], error, isLoading } = useSWR(
    swrKey,
    () => MessagingAPI.getConversations(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    conversations,
    loading: isLoading || isAuthLoading,
    error,
    refresh: () => mutate(swrKey),
  };
}

/**
 * Hook for managing real-time conversation updates via Action Cable
 */
export function useConversationSubscription(conversationId: string | null) {
  const { user, accessToken } = useApi();

  useEffect(() => {
    if (!conversationId || !user?.email || !accessToken) return;

    const consumer = getCableConsumer(user.email);
    if (!consumer) return;

    console.log(`📡 [ActionCable] Subscribing to ConversationChannel:${conversationId}`);

    const subscription = consumer.subscriptions.create(
      { channel: 'ConversationChannel', conversation_id: conversationId },
      {
        received(data: { message: Message }) {
          console.log('📨 [ActionCable] New message received:', data.message);
          const swrKey = `/api/v1/conversations/${conversationId}/messages`;

          mutate(swrKey, (currentData: Message[] | undefined) => {
            const messages = currentData || [];
            // Avoid duplicates
            if (messages.some(m => m.id === data.message.id)) {
              return messages;
            }
            return [...messages, data.message];
          }, false);
        },
        connected() {
          console.log(`✅ [ActionCable] Connected to conversation:${conversationId}`);
        },
        disconnected() {
          console.log(`❌ [ActionCable] Disconnected from conversation:${conversationId}`);
        },
        rejected() {
          console.error(`🚫 [ActionCable] Subscription rejected for conversation:${conversationId}`);
        }
      }
    );

    return () => {
      console.log(`🔌 [ActionCable] Unsubscribing from conversation:${conversationId}`);
      subscription.unsubscribe();
    };
  }, [conversationId, user?.email, accessToken]);
}

/**
 * Hook for managing messages in a specific conversation
 */
export function useMessages(conversationId: string | null) {
  const { accessToken, isLoading: isAuthLoading } = useApi();
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  const swrKey = accessToken && conversationId
    ? `/api/v1/conversations/${conversationId}/messages`
    : null;

  if (swrKey) {
    console.log(`🔑 [useMessages] SWR Key generated: ${swrKey}`);
  }

  const { data: remoteMessages = [], error, isLoading } = useSWR(
    swrKey,
    () => MessagingAPI.getMessages(conversationId!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 1500,
    }
  );

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

  // Poll for typing status from others
  const swrKey = conversationId ? `/api/v1/conversations/${conversationId}/typing` : null;
  useSWR(
    swrKey,
    async () => {
      // Replace with real API call when backend supports it
      return null;
    },
    { refreshInterval: 10_000 }
  );

  return {
    isOtherTyping,  // ← correct export name consumed by MessagingSection
    handleTyping,
  };
}