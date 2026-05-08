import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { MessagingAPI, normalizeMessage, normalizeReactions } from '@/lib/api/messaging-api';
import { Message, Conversation, Participant } from '@/lib/types/messaging';
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

          // Handle typing indicator events
          if (data?.type === 'typing') {
            const event = new CustomEvent(`typing:${conversationId}`, {
              detail: {
                userId: data.user_id,
                isTyping: data.is_typing
              }
            });
            window.dispatchEvent(event);
            return;
          }

          const messagesSwrKey = `/api/v1/conversations/${conversationId}/messages`;
          const convsSwrKey = '/api/v1/conversations';

          // Update messages list
          mutate(messagesSwrKey, (currentData: Message[] | undefined) => {
            const messages = currentData || [];
            const incoming = data?.message || data;

            // Handle bulk status updates (e.g. { status: 'read', conversation_id: '...' })
            if (data?.status && !data?.id && !data?.message_id) {
              return messages.map(m => ({ ...m, status: data.status }));
            }

            const messageId = String(
              incoming?.id ||
              incoming?.message_id ||
              incoming?._id?.$oid ||
              incoming?._id ||
              ''
            );

            if (!messageId) return messages;

            if (messages.some(m => m.id === messageId)) {
              return messages.map(message =>
                message.id === messageId
                  ? mergeMessageUpdate(message, incoming, data)
                  : message
              );
            }

            const normalized = normalizeMessage(incoming);
            return [...messages, normalized];
          }, false);

          // Update conversation list to reflect last message/unread count
          mutate(convsSwrKey);
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

function mergeMessageUpdate(
  currentMessage: Message,
  incoming: any,
  broadcast: any
): Message {
  const hasFullMessage =
    incoming?.content !== undefined ||
    incoming?.body !== undefined ||
    incoming?.text !== undefined ||
    incoming?.timestamp ||
    incoming?.created_at;

  const nextMessage = hasFullMessage
    ? { ...currentMessage, ...normalizeMessage(incoming) }
    : { ...currentMessage };

  const status = broadcast?.status || incoming?.status || incoming?.status_update;
  if (status) {
    nextMessage.status = status;
  }

  const reactionPayload =
    broadcast?.reactions ||
    incoming?.reactions ||
    broadcast?.reaction ||
    incoming?.reaction ||
    incoming?.reaction_counts;

  if (reactionPayload) {
    nextMessage.reactions = normalizeReactions(reactionPayload);
  }

  return nextMessage;
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
    attachment?: { url: string; type: string; name: string; size?: number },
    replyToId?: string
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
      reply_to_id: replyToId,
    } as any;

    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      const realMessage = await MessagingAPI.sendMessage(conversationId, content, attachment, replyToId);

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
 * Manages outgoing "typing" signals and incoming broadcasts.
 */
export function useTyping(conversationId: string | null, participants: Participant[] = []) {
  const { user } = useApi();
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const remoteTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const isLocalTypingRef = useRef(false);
  const startDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const handleTypingEvent = (event: any) => {
      const { userId, isTyping } = event.detail;
      const uid = String(userId);

      // Don't show typing indicator for self
      if (user?.sub && uid === String(user.sub)) return;
      if (user?.email && uid === user.email) return;

      if (isTyping) {
        setTypingUserIds(prev => prev.includes(uid) ? prev : [...prev, uid]);

        if (remoteTimeoutsRef.current[uid]) clearTimeout(remoteTimeoutsRef.current[uid]);
        remoteTimeoutsRef.current[uid] = setTimeout(() => {
          setTypingUserIds(prev => prev.filter(id => id !== uid));
          delete remoteTimeoutsRef.current[uid];
        }, 5000); // 5s safety timeout
      } else {
        setTypingUserIds(prev => prev.filter(id => id !== uid));
        if (remoteTimeoutsRef.current[uid]) {
          clearTimeout(remoteTimeoutsRef.current[uid]);
          delete remoteTimeoutsRef.current[uid];
        }
      }
    };

    window.addEventListener(`typing:${conversationId}` as any, handleTypingEvent);
    return () => {
      window.removeEventListener(`typing:${conversationId}` as any, handleTypingEvent);
      // Clean up all timeouts
      Object.values(remoteTimeoutsRef.current).forEach(clearTimeout);
      if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [conversationId, user]);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    // Outgoing Logic
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

    if (!isLocalTypingRef.current && !startDebounceRef.current) {
      // User started typing, wait 500ms to be sure they are typing
      startDebounceRef.current = setTimeout(() => {
        isLocalTypingRef.current = true;
        MessagingAPI.setTyping(conversationId, true).catch(() => {});
        startDebounceRef.current = null;
      }, 500);
    }

    // Refresh stop timeout
    stopTimeoutRef.current = setTimeout(() => {
      if (startDebounceRef.current) {
        clearTimeout(startDebounceRef.current);
        startDebounceRef.current = null;
      }
      if (isLocalTypingRef.current) {
        isLocalTypingRef.current = false;
        MessagingAPI.setTyping(conversationId, false).catch(() => {});
      }
    }, 3000); // 3s stop timeout
  }, [conversationId]);

  const typingUsers = useMemo(() => {
    return typingUserIds.map(id => {
      return participants.find(p => String(p.id) === id) || { id, name: 'Someone', role: 'staff' } as Participant;
    });
  }, [typingUserIds, participants]);

  return {
    typingUsers,
    isOtherTyping: typingUsers.length > 0,
    handleTyping,
  };
}
