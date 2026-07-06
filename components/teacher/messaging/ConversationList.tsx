import React, { useState } from 'react';
import { Conversation } from '@/lib/api/messaging-api';
import { Search, User, Plus, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserId: string;
  onNewMessage?: () => void;
  onNewGroupMessage?: () => void;
  onShowSaved?: () => void;
  onNoteToSelf?: () => void;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
  onNewMessage,
  onNewGroupMessage,
  onShowSaved,
  onNoteToSelf,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * The display name for a conversation.
   * 1. Use conv.title (set by the backend to the other participant's name).
   * 2. Fall back to building it from conv.participants, excluding self.
   * 3. Last resort: "Conversation".
   */
  const getDisplayName = (conv: Conversation): string => {
    if (conv.title) return conv.title;

    const others = conv.participants.filter(p => p.id !== currentUserId);
    if (others.length === 0) return 'Note to self';
    if (others.length === 1) return others[0].name;
    return others.map(p => p.name.split(' ')[0]).join(' & ');
  };

  /**
   * The avatar to show — the other participant's avatar, or null.
   */
  const getAvatar = (conv: Conversation): string | null | undefined => {
    const other = conv.participants.find(p => p.id !== currentUserId);
    return other?.avatar;
  };

  /**
   * Online status of the other participant.
   */
  const getOnlineStatus = (conv: Conversation): boolean => {
    const other = conv.participants.find(p => p.id !== currentUserId);
    return other?.online_status === 'online';
  };

  /**
   * Preview text shown under the name.
   * Shows the last message content, or a prompt if none.
   */
  const getPreviewText = (conv: Conversation): string => {
    if (!conv.last_message) return 'Start a conversation';
    const isOwn = conv.last_message.sender_id === currentUserId;
    const prefix = isOwn ? 'You: ' : '';
    const content = conv.last_message.content;
    return prefix + (content.length > 60 ? content.slice(0, 57) + '…' : content);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7)   return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // ── Filter ───────────────────────────────────────────────────────────────

  const filtered = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = getDisplayName(conv);
    const preview = getPreviewText(conv);
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
  });

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-surface-container border-r border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white/90">Messages</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onShowSaved}
              className="p-2 hover:bg-white/5 rounded-xl transition-all group"
              title="Saved Messages"
            >
              <Star className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={onNewGroupMessage}
              className="p-2 bg-primary-accent text-on-primary-fixed hover:bg-primary-accent/90 rounded-xl transition-all group shadow-lg shadow-primary-accent/20"
              title="New Group Message"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={onNoteToSelf}
              className="p-2 hover:bg-white/5 rounded-xl transition-all group"
              title="Note to self"
            >
              <User className="w-5 h-5 text-primary-accent group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={onNewMessage}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/10"
              title="New Message"
            >
              <Plus className="w-5 h-5 text-white/60 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-white/20 font-medium">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map(conv => {
            const displayName  = getDisplayName(conv);
            const avatar       = getAvatar(conv);
            const isOnline     = getOnlineStatus(conv);
            const preview      = getPreviewText(conv);
            const isActive     = activeConversationId === conv.id;
            const hasUnread    = conv.unread_count > 0;
            const dateLabel    = formatDate(conv.updated_at);

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'w-full p-4 flex gap-4 transition-all hover:bg-white/5 border-l-2',
                  isActive
                    ? 'bg-white/5 border-primary-accent shadow-[inset_1px_0_0_0_rgba(255,255,255,0.05)]'
                    : 'border-transparent'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-12 h-12 rounded-2xl object-cover bg-surface-container"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-4 border-surface-container" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-white/90 truncate text-sm">{displayName}</h4>
                    <span className="text-[10px] font-bold text-white/20 uppercase whitespace-nowrap ml-2">
                      {dateLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <p className={cn(
                      'text-xs truncate transition-colors',
                      hasUnread ? 'text-white/80 font-semibold' : 'text-white/40'
                    )}>
                      {preview}
                    </p>
                    {hasUnread && (
                      <span className="shrink-0 bg-primary-accent text-on-primary-fixed text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse shadow-lg shadow-primary-accent/20">
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