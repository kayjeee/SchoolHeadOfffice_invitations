import React from 'react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-white/10 bg-surface-container/95 p-1 shadow-xl shadow-black/20 backdrop-blur-md',
        className
      )}
      role="menu"
      aria-label="Choose reaction"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:scale-110 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-accent/60"
          onClick={() => onSelect(emoji)}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
