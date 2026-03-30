'use client';

import React from 'react';
import { Send, Plus, Wand2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PromptInputProps {
  godMode?: boolean;
}

export default function PromptInput({ godMode = false }: PromptInputProps) {
  const accentBorder = godMode ? 'focus-within:border-secondary-accent/40' : 'focus-within:border-primary-accent/40';
  const accentShadow = godMode ? 'focus-within:shadow-[0_0_20px_rgba(188,197,255,0.1)]' : 'focus-within:shadow-[0_0_20px_rgba(173,198,255,0.1)]';
  const accentBtn = godMode ? 'bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-accent' : 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-accent';

  return (
    <div className={cn(
      "relative flex items-center gap-2 p-1 pl-4 rounded-2xl bg-surface-container border border-white/5 transition-all duration-300",
      accentBorder,
      accentShadow
    )}>
      <Wand2 className={cn("w-5 h-5", godMode ? "text-secondary-accent" : "text-primary-accent")} />
      <input
        type="text"
        placeholder="Ask the AI Sentinel anything about your class..."
        className="flex-1 bg-transparent border-none outline-none text-sm py-3 placeholder:text-white/20 text-white/80"
      />
      <div className="flex items-center gap-1 pr-1">
        <button className="p-2 text-white/40 hover:text-white/60 hover:bg-white/5 rounded-xl transition-all">
          <Plus className="w-5 h-5" />
        </button>
        <button className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95",
          accentBtn
        )}>
          Send
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
