import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, MoreHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  isSending?: boolean;
  disabled?: boolean;
  isOtherTyping?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  isSending = false,
  disabled = false,
  isOtherTyping = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 💡 Auto-focus textarea on mount (when chat window opens)
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !isSending && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-surface-container border-t border-white/5 space-y-4">
      {/* Typing Indicator */}
      {isOtherTyping && (
        <div className="flex items-center gap-2 text-[10px] font-bold text-primary-accent uppercase tracking-widest px-4 animate-pulse">
          <span className="flex gap-1">
             <span className="w-1 h-1 rounded-full bg-current animate-bounce"></span>
             <span className="w-1 h-1 rounded-full bg-current animate-bounce delay-75"></span>
             <span className="w-1 h-1 rounded-full bg-current animate-bounce delay-150"></span>
          </span>
          Someone is typing...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-3 group"
      >
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all active:scale-95"
            title="Attach File"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all active:scale-95 hidden md:flex"
            title="Add Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
           <textarea
             ref={textareaRef}
             rows={1}
             value={message}
             onChange={handleChange}
             onKeyDown={handleKeyDown}
             placeholder="Type your message..."
             disabled={disabled}
             className="w-full bg-white/5 border border-white/10 rounded-[28px] py-3.5 px-6 pr-12 text-sm md:text-base text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all resize-none max-h-32 custom-scrollbar"
           />
           <div className="absolute right-2 bottom-2">
              <button
                type="button"
                className="p-1.5 text-white/10 hover:text-white/30 transition-colors hidden md:block"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
           </div>
        </div>

        <button
          type="submit"
          disabled={!message.trim() || isSending || disabled}
          className={cn(
            "shrink-0 p-4 rounded-[28px] transition-all shadow-xl active:scale-95",
            message.trim() && !isSending && !disabled
              ? "bg-primary-accent text-on-primary-fixed shadow-primary-accent/20"
              : "bg-white/5 text-white/10 border border-white/10 cursor-not-allowed shadow-none"
          )}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}
