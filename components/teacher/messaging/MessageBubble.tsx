import React, { useEffect, useRef, useState } from 'react';
import { mutate } from 'swr';
import { Smile, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessagingAPI, MessageReaction, normalizeMessage, normalizeReactions } from '@/lib/api/messaging-api';
import { Message, Participant } from '@/lib/types/messaging';
import AttachmentPreview from './AttachmentPreview';
import EmojiPicker from './EmojiPicker';
import MessageStatus from './MessageStatus';

interface MessageBubbleProps {
  conversationId: string;
  message: Message;
  sender?: Participant;
  isMine: boolean;
  currentUserId: string;
  formattedTime: string;
  isHighlighted?: boolean;
}

export default function MessageBubble({
  conversationId,
  message,
  sender,
  isMine,
  currentUserId,
  formattedTime,
  isHighlighted = false,
}: MessageBubbleProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const reactions = message.reactions || [];
  const swrKey = `/api/v1/conversations/${conversationId}/messages`;

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (!isPickerOpen) return;
      if (reactionPickerRef.current?.contains(event.target as Node)) return;
      setIsPickerOpen(false);
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [isPickerOpen]);

  const handleReaction = async (emoji: string) => {
    setIsPickerOpen(false);
    if (message.is_optimistic || isReacting) return;

    try {
      setIsReacting(true);
      mutate(swrKey, (current: Message[] | undefined) => {
        const messages = current || [];

        return messages.map((existingMessage) =>
          existingMessage.id === message.id
            ? {
                ...existingMessage,
                reactions: applyOptimisticReaction(
                  existingMessage.reactions || [],
                  emoji,
                  currentUserId
                ),
              }
            : existingMessage
        );
      }, false);

      const response = await MessagingAPI.reactToMessage(conversationId, message.id, emoji);
      const updatedMessage = response?.message || response;
      const reactions = updatedMessage?.reactions || response?.reactions || response?.reaction;

      if (updatedMessage?.id || reactions) {
        mutate(swrKey, (current: Message[] | undefined) => {
          const messages = current || [];

          return messages.map((existingMessage) => {
            if (existingMessage.id !== message.id) return existingMessage;
            if (updatedMessage?.id) return { ...existingMessage, ...normalizeMessage(updatedMessage) };
            return { ...existingMessage, reactions: normalizeReactions(reactions) };
          });
        }, false);
      }
    } catch (error) {
      mutate(swrKey, (current: Message[] | undefined) => {
        const messages = current || [];

        return messages.map((existingMessage) =>
          existingMessage.id === message.id
            ? {
                ...existingMessage,
                reactions: applyOptimisticReaction(
                  existingMessage.reactions || [],
                  emoji,
                  currentUserId
                ),
              }
            : existingMessage
        );
      }, false);
      console.error('Failed to react to message', error);
    } finally {
      setIsReacting(false);
    }
  };

  const hasCurrentUserReacted = (reaction: MessageReaction) => {
    if (reaction.current_user_reacted) return true;
    return reaction.user_ids?.map(String).includes(String(currentUserId)) || false;
  };

  return (
    <div className={cn('group flex max-w-[85%] gap-3 md:max-w-[70%]', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {!isMine && (
        <div className="mt-1 shrink-0">
          {sender?.avatar ? (
            <img src={sender.avatar} alt={sender.name} className="h-8 w-8 rounded-xl object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <User className="h-4 w-4 text-white/20" />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <div ref={reactionPickerRef} className="relative">
          <button
            type="button"
            className={cn(
              'absolute top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-surface-container/90 text-white/60 opacity-0 shadow-lg shadow-black/20 transition hover:scale-105 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-accent/60 group-hover:opacity-100',
              isMine ? '-left-9' : '-right-9'
            )}
            onClick={() => setIsPickerOpen(open => !open)}
            disabled={message.is_optimistic || isReacting}
            aria-label="Add reaction"
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </button>

          {isPickerOpen && (
            <div className={cn('absolute bottom-full z-[100] mb-2', isMine ? 'right-0' : 'left-0')}>
              <EmojiPicker
                onSelect={handleReaction}
                className="shadow-2xl"
              />
            </div>
          )}

          <div
            className={cn(
              'relative rounded-2xl p-4 text-sm transition-all md:rounded-[24px] md:text-base',
              isMine
                ? 'rounded-tr-none bg-primary-fixed font-medium text-on-primary-fixed shadow-xl shadow-primary-fixed/10'
                : 'rounded-tl-none border border-white/5 bg-surface-container text-white/90',
              isHighlighted && (isMine
                ? 'bg-primary-accent ring-4 ring-primary-accent ring-offset-4 ring-offset-black/20 scale-[1.02] shadow-2xl shadow-primary-accent/40'
                : 'bg-primary-accent/20 ring-4 ring-primary-accent ring-offset-4 ring-offset-black/20 scale-[1.02] shadow-2xl shadow-primary-accent/20')
            )}
          >
            {message.content && <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>}

            {message.attachment_url && (
              <AttachmentPreview
                url={message.attachment_url}
                type={message.attachment_type || 'application/octet-stream'}
                name={message.attachment_name || 'Attachment'}
                isMine={isMine}
              />
            )}
          </div>
        </div>

        {reactions.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 px-1', isMine ? 'justify-end' : 'justify-start')}>
            {reactions.map((reaction) => {
              const reacted = hasCurrentUserReacted(reaction);

              return (
                <button
                  key={reaction.emoji}
                  type="button"
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition hover:scale-105',
                    reacted
                      ? 'border-primary-accent/40 bg-primary-accent/15 text-primary-accent'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  )}
                  onClick={() => handleReaction(reaction.emoji)}
                  disabled={message.is_optimistic || isReacting}
                  aria-pressed={reacted}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div
          className={cn(
            'flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-white/20',
            isMine ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formattedTime}</span>
          {isMine && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function applyOptimisticReaction(
  reactions: MessageReaction[],
  emoji: string,
  currentUserId: string
): MessageReaction[] {
  const currentUserIdString = String(currentUserId);
  const existingReaction = reactions.find(reaction => reaction.emoji === emoji);

  if (!existingReaction) {
    return [
      ...reactions,
      {
        emoji,
        count: 1,
        current_user_reacted: true,
        user_ids: [currentUserIdString],
      },
    ];
  }

  const hasReacted =
    existingReaction.current_user_reacted ||
    existingReaction.user_ids?.map(String).includes(currentUserIdString) ||
    false;

  const nextCount = Math.max(0, existingReaction.count + (hasReacted ? -1 : 1));
  const nextUserIds = hasReacted
    ? existingReaction.user_ids?.filter(id => String(id) !== currentUserIdString)
    : [...(existingReaction.user_ids || []), currentUserIdString];

  return reactions
    .map(reaction =>
      reaction.emoji === emoji
        ? {
            ...reaction,
            count: nextCount,
            current_user_reacted: !hasReacted,
            user_ids: nextUserIds,
          }
        : reaction
    )
    .filter(reaction => reaction.count > 0);
}
