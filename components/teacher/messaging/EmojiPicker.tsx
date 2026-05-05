import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
  variant?: 'compact' | 'grid';
}

const ReactEmojiPicker = dynamic<any>(
  () => import('emoji-picker-react').then(mod => mod.default),
  { ssr: false }
);

export default function EmojiPicker({ onSelect, className, variant = 'compact' }: EmojiPickerProps) {
  const isGrid = variant === 'grid';

  return (
    <div
      className={cn(
        isGrid
          ? 'rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-md'
          : 'rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-xl shadow-black/20 backdrop-blur-md',
        className
      )}
      role="menu"
      aria-label="Choose reaction"
    >
      <ReactEmojiPicker
        height={isGrid ? 360 : 300}
        width={isGrid ? 320 : 300}
        theme="dark"
        lazyLoadEmojis
        skinTonesDisabled
        searchDisabled={!isGrid}
        previewConfig={{ showPreview: false }}
        onEmojiClick={(emojiData: { emoji: string }) => onSelect(emojiData.emoji)}
      />
    </div>
  );
}
