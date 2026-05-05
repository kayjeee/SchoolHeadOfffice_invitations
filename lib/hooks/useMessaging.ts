import { useState, useRef, useCallback, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { MessagingAPI, normalizeMessage } from '@/lib/api/messaging-api';
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
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 60000,
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
      { channel: 'MessagesChannel', conversation_id: conversationId },
      {
        received(data: any) {
          console.log('📨 [ActionCable] New message received:', data);
          const normalized = normalizeMessage(data);
          const swrKey = `/api/v1/conversations/${conversationId}/messages`;

          mutate(swrKey, (currentData: Message[] | undefined) => {
            const messages = currentData || [];
            // Avoid duplicates
            if (messages.some(m => m.id === normalized.id)) {
              return messages;
            }
            return [...messages, normalized];
          }, false);
        },
        connected() {
          console.log(`✅ [ActionCable] Handshake successful! Connected to MessagesChannel for ID: ${conversationId}`);
        },
        disconnected() {
          console.log(`❌ [ActionCable] Connection lost for conversation: ${conversationId}`);
        },
        rejected() {
          console.error(`🚫 [ActionCable] Subscription rejected for conversation: ${conversationId}`);
          console.log(`💡 [ActionCable] Troubleshooting: Ensure the WebSocket URL includes ?user_email=${user.email} and that the Rails server's Connection#connect allows this user.`);
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
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 60000,
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

  const sendMessage = async (
    content: string,
    senderId: string,
    attachment?: { url: string; type: string; name: string; size?: number }
  ) => {
    if (!conversationId || (!content.trim() && !attachment)) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      is_optimistic: true,
      attachment_url: attachment?.url,
      attachment_type: attachment?.type,
      attachment_name: attachment?.name,
      attachment_size: attachment?.size,
    } as any;

    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      const realMessage = await MessagingAPI.sendMessage(conversationId, content, attachment);

      // Update cache and clear optimistic
      // Using functional update to avoid stale closures
      mutate(swrKey, (current: Message[] | undefined) => {
        const existing = current || [];
        if (existing.some(m => m.id === realMessage.id)) return existing;
        return [...existing, realMessage];
      }, false);

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
  const [isOtherTyping] = useState(false); // ✅ RESTORED to maintain hook count
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

  // TODO: Add Action Cable typing indicator support when backend is ready
  // RESTORED: useSWR call with null key to maintain hook count and avoid React errors
  useSWR(null, async () => null);

  return {
    isOtherTyping,  // ← correct export name consumed by MessagingSection
    handleTyping,
  };
}