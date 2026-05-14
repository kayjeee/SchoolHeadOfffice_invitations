import React from 'react';
import useSWR from 'swr';
import { MessagingAPI } from '@/lib/api/messaging-api';
import { Star, MessageSquare, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { Message, Participant } from '@/lib/types/messaging';
import MessageBubble from './MessageBubble';

interface SavedMessagesViewProps {
  onBack: () => void;
  onJumpToConversation: (conversationId: string, messageId: string) => void;
  currentUserId: string;
  contactMap: Map<string, Participant>;
}

export default function SavedMessagesView({
  onBack,
  onJumpToConversation,
  currentUserId,
  contactMap,
}: SavedMessagesViewProps) {
  const { data: messages, isLoading, error } = useSWR(
    '/api/v1/messages/starred',
    () => MessagingAPI.getStarredMessages()
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-surface-container">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400/10 rounded-xl">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-white/90">Saved Messages</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400/40" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/20">Loading saved messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-sm text-red-400">Failed to load saved messages.</p>
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-12">
            {messages.map((msg) => {
              const sender = contactMap.get(msg.sender_id.toString());
              const isMine = msg.sender_id.toString() === currentUserId.toString();

              return (
                <div key={msg.id} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                          {formatDate(msg.timestamp)}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <button
                          onClick={() => onJumpToConversation(msg.conversation_id, msg.id)}
                          className="flex items-center gap-1 text-[10px] font-black text-primary-accent uppercase tracking-widest hover:text-primary-accent/80 transition-colors"
                        >
                          Jump to Chat <ChevronRight className="w-3 h-3" />
                        </button>
                     </div>
                     <div className="flex items-center gap-1 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        <MessageSquare className="w-3 h-3" />
                        ID: {msg.conversation_id.slice(-6)}
                     </div>
                  </div>

                  <div className="flex flex-col">
                    <MessageBubble
                      conversationId={msg.conversation_id}
                      message={msg}
                      sender={sender}
                      isMine={isMine}
                      currentUserId={currentUserId}
                      formattedTime={formatTime(msg.timestamp)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center">
              <Star className="w-10 h-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white/80">No saved messages</h4>
              <p className="text-sm text-white/20 max-w-[240px]">
                Star important messages to find them easily later in this section.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
