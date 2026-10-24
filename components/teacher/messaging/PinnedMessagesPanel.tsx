import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, X, ChevronRight, MessageSquare } from 'lucide-react';
import { Message, Participant } from '@/lib/types/messaging';
import { cn } from '@/lib/utils';

interface PinnedMessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedMessages: Message[];
  participants: Participant[];
  onJumpToMessage: (messageId: string) => void;
}

export default function PinnedMessagesPanel({
  isOpen,
  onClose,
  pinnedMessages,
  participants,
  onJumpToMessage,
}: PinnedMessagesPanelProps) {
  const getSender = (senderId: string) => {
    return participants.find(p => p.id.toString() === senderId.toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-primary-accent/5 border-b border-primary-accent/10 overflow-hidden"
        >
          <div className="p-4 md:px-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary-accent">
                <Pin className="w-4 h-4 fill-current" />
                <h4 className="text-xs font-black uppercase tracking-widest">
                  Pinned Messages ({pinnedMessages.length})
                </h4>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-white/20 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinnedMessages.length === 0 ? (
              <p className="text-xs text-white/40 italic py-2">No pinned messages yet.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {pinnedMessages.map((msg) => {
                  const sender = getSender(msg.sender_id);
                  return (
                    <button
                      key={msg.id}
                      onClick={() => onJumpToMessage(msg.id)}
                      className="shrink-0 w-64 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left snap-start group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {sender?.avatar ? (
                          <img src={sender.avatar} className="w-5 h-5 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
                            <MessageSquare className="w-3 h-3 text-white/40" />
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-white/60 truncate">
                          {sender?.name || 'Contact'}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-2">
                        {msg.content}
                      </p>
                      <div className="flex items-center text-[10px] text-primary-accent font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        Jump to message <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
