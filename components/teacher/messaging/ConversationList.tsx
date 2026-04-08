import React from 'react';
import { Conversation, Participant } from '@/lib/types/messaging';
import { Search, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewMessage: () => void;
  currentUserId: string;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
}: ConversationListProps) {

  const getOtherParticipant = (participants: Participant[]) => {
    return participants.find(p => p.id !== currentUserId) || participants[0];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-container border-r border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white/90">Messages</h2>
          <button
            onClick={onNewMessage}
            className="p-2 hover:bg-white/5 rounded-xl text-primary-accent transition-all active:scale-95"
            title="New Message"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-white/20 font-medium">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv.participants);
            const isActive = activeConversationId === conv.id;
            const lastMsg = conv.last_message;

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full p-4 flex gap-4 transition-all hover:bg-white/5 border-l-2",
                  isActive
                    ? "bg-white/5 border-primary-accent shadow-[inset_1px_0_0_0_rgba(255,255,255,0.05)]"
                    : "border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  {other.avatar ? (
                    <img
                      src={other.avatar}
                      alt={other.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-surface-container"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                  {other.online_status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-4 border-surface-container"></span>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-white/90 truncate text-sm">
                      {conv.title || other.name}
                    </h4>
                    <span className="text-[10px] font-bold text-white/20 uppercase whitespace-nowrap">
                      {formatDate(conv.updated_at)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <p className={cn(
                      "text-xs truncate transition-colors",
                      conv.unread_count > 0 ? "text-white/80 font-semibold" : "text-white/40"
                    )}>
                      {lastMsg ? lastMsg.content : "Start a conversation"}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 bg-primary-accent text-on-primary-fixed text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
