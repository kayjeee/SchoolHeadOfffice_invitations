import React, { useEffect, useRef } from 'react';
import { Message, Participant } from '@/lib/types/messaging';
import { Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversationSubscription } from '@/lib/hooks/useMessaging';
import { MessagingAPI } from '@/lib/api/messaging-api';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  conversationId: string | null;
  messages: Message[];
  participants: Participant[];
  currentUserId: string;
  loading?: boolean;
}

export default function ChatWindow({
  conversationId,
  messages,
  participants,
  currentUserId,
  loading = false,
}: ChatWindowProps) {
  // Initialize real-time subscription
  useConversationSubscription(conversationId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastReadSignalRef = useRef<string | null>(null);
  const [lastSeenTimestamp, setLastSeenTimestamp] = React.useState<string | null>(null);

  useEffect(() => {
    // Set initial last seen on mount or when messages first load
    if (!lastSeenTimestamp && messages.length > 0) {
      setLastSeenTimestamp(messages[messages.length - 1].timestamp);
    }
  }, [messages, lastSeenTimestamp]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages if already at bottom
    // or if the message is from the current user
    if (bottomRef.current) {
      const isMyMessage = messages.length > 0 && messages[messages.length - 1].sender_id === currentUserId;
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentUserId]);

  const isNearBottom = React.useCallback(() => {
    const container = scrollRef.current;
    if (!container) return true;

    return container.scrollHeight - container.scrollTop - container.clientHeight < 96;
  }, []);

  const sendReadSignal = React.useCallback((requireBottom: boolean) => {
    if (!conversationId || messages.length === 0) return;
    if (typeof document !== 'undefined') {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
    }
    if (requireBottom && !isNearBottom()) return;

    // Check if there are any unread messages from others
    const unreadFromOthers = messages.some(
      m => m.sender_id !== currentUserId && m.status !== 'read'
    );
    if (!unreadFromOthers) return;

    const latestIncomingMessage = [...messages]
      .reverse()
      .find(message => message.sender_id !== currentUserId);
    if (!latestIncomingMessage) return;

    const readSignature = `${conversationId}:${latestIncomingMessage.id}`;
    if (lastReadSignalRef.current === readSignature) return;

    console.log(`🔵 [ChatWindow] Sending read signal for conversation: ${conversationId}`);
    lastReadSignalRef.current = readSignature;
    MessagingAPI.markAsRead(conversationId).catch(error => {
      lastReadSignalRef.current = null;
      console.warn('markAsRead failed:', error);
    });
  }, [conversationId, currentUserId, isNearBottom, messages]);

  useEffect(() => {
    sendReadSignal(false);
  }, [sendReadSignal]);

  useEffect(() => {
    const container = scrollRef.current;
    const handleFocusRead = () => sendReadSignal(false);
    const handleScrollRead = () => sendReadSignal(true);

    window.addEventListener('focus', handleFocusRead);
    document.addEventListener('visibilitychange', handleFocusRead);
    container?.addEventListener('scroll', handleScrollRead, { passive: true });

    return () => {
      window.removeEventListener('focus', handleFocusRead);
      document.removeEventListener('visibilitychange', handleFocusRead);
      container?.removeEventListener('scroll', handleScrollRead);
    };
  }, [sendReadSignal]);

  const getParticipant = (id: string) => {
    return participants.find(p => p.id?.toString() === id?.toString());
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by date to show date separators
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach(msg => {
    const dateStr = new Date(msg.timestamp).toLocaleDateString();
    if (!groupedMessages[dateStr]) {
      groupedMessages[dateStr] = [];
    }
    groupedMessages[dateStr].push(msg);
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-surface-container/30 custom-scrollbar" ref={scrollRef}>
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-white/20" />
        </div>
      )}

      {!loading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
           <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
              <User className="w-12 h-12 text-white/40" />
           </div>
           <p className="text-sm font-bold uppercase tracking-widest text-white/40">No messages yet</p>
        </div>
      )}

      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="space-y-6">
          {/* Date Separator */}
          <div className="flex justify-center">
            <span className="bg-white/5 border border-white/5 rounded-full px-4 py-1 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
              {formatFullDate(msgs[0].timestamp)}
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
            {msgs.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              const sender = getParticipant(msg.sender_id);

              const isNew = lastSeenTimestamp && new Date(msg.timestamp) > new Date(lastSeenTimestamp) && msg.sender_id !== currentUserId;

              return (
                <React.Fragment key={msg.id}>
                {isNew && msg.id === messages.find(m => new Date(m.timestamp) > new Date(lastSeenTimestamp!))?.id && (
                  <div className="flex justify-center my-4">
                    <span className="bg-primary-accent/10 border border-primary-accent/20 rounded-full px-4 py-1 text-[10px] font-bold text-primary-accent uppercase tracking-widest">
                      New Messages Below
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex group",
                    isMine ? "justify-end" : "justify-start"
                  )}
                >
                  {conversationId && (
                    <MessageBubble
                      conversationId={conversationId}
                      message={msg}
                      sender={sender}
                      isMine={isMine}
                      currentUserId={currentUserId}
                      formattedTime={formatDate(msg.timestamp)}
                    />
                  )}
                </motion.div>
                </React.Fragment>
              );
            })}
            </AnimatePresence>
          </div>
        </div>
      ))}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
