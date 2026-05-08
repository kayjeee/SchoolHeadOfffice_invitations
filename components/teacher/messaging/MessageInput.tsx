import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, Paperclip, MoreHorizontal, Loader2, Mic, Trash2, X, CornerUpLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import FileUploadProgress from './FileUploadProgress';
import EmojiPicker from './EmojiPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/types/messaging';

interface MessageInputProps {
  onSendMessage: (content: string, attachment?: { url: string; type: string; name: string; size?: number }) => Promise<void> | void;
  onTyping: () => void;
  isSending?: boolean;
  disabled?: boolean;
  isOtherTyping?: boolean;
  replyTo?: (Message & { sender_name: string }) | null;
  onClearReply?: () => void;
}

// Converts any MIME string to the short backend type token.
// "audio/webm;codecs=opus" → "audio"
// "audio/webm"             → "audio"
// "image/jpeg"             → "image"
// "video/mp4"              → "video"
// "application/pdf"        → "pdf"   (explicit, not "application")
function toAttachmentType(mimeType: string): string {
  const base = mimeType.split(';')[0].trim(); // drop ;codecs=... or ;charset=...
  if (base === 'application/pdf') return 'pdf';
  return base.split('/')[0]; // "audio", "image", "video", etc.
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  isSending = false,
  disabled = false,
  isOtherTyping = false,
  replyTo = null,
  onClearReply,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState<{ name: string; url: string; type: string; size?: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (!showEmojiPicker) return;
      if (emojiPickerRef.current?.contains(event.target as Node)) return;
      setShowEmojiPicker(false);
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [showEmojiPicker]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const hasValidAttachment = uploadFile && uploadFile.url && !uploadError;
    const canSend = (message.trim() || hasValidAttachment) && !isSending && !disabled && !isUploading;

    if (canSend) {
      try {
        const result = onSendMessage(message, hasValidAttachment ? uploadFile : undefined);
        if (result instanceof Promise) {
          await result;
        }
        setMessage('');
        setShowEmojiPicker(false);
        setUploadFile(null);
        setUploadProgress(0);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (err) {
        console.error('Failed to send message in MessageInput:', err);
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

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessage(current => `${current}${emoji}`);
      onTyping();
      return;
    }

    const selectionStart = textarea.selectionStart ?? message.length;
    const selectionEnd = textarea.selectionEnd ?? message.length;
    const nextMessage = `${message.slice(0, selectionStart)}${emoji}${message.slice(selectionEnd)}`;
    const nextCursorPosition = selectionStart + emoji.length;

    setMessage(nextMessage);
    onTyping();

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  };

  const uploadToCloudinary = async (file: File | Blob, fileName: string, fileType: string) => {
    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);
    setUploadFile({ name: fileName, type: fileType, url: '' });

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'chameleon-techie';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'w1ofo4vi';

      // Cloudinary requires resource_type "video" for all audio files
      const isAudio = fileType.startsWith('audio/') || fileType === 'audio';
      const resourceType = isAudio ? 'video' : 'auto';

      setUploadProgress(30);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const result = await uploadResponse.json();
      setUploadProgress(100);

      const newAttachment = {
        name: fileName,
        // Strip codec params and MIME subtype → "audio", "image", "video", "pdf"
        // "audio/webm;codecs=opus" → "audio"  ✓  backend allowlist accepts this
        type: toAttachmentType(fileType),
        url: result.secure_url,
        size: result.bytes ?? file.size,
      };

      setUploadFile(newAttachment);

      // Auto-send once upload is complete
      onSendMessage(message, newAttachment);
      setMessage('');
      setUploadFile(null);
      setUploadProgress(0);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadToCloudinary(file, file.name, file.type);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------------------------------------------------------------------------
  // Recording logic
  // ---------------------------------------------------------------------------

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);

        if (audioChunksRef.current.length > 0) {
          // Pass the raw MIME — toAttachmentType() inside uploadToCloudinary
          // normalizes it to "audio" before it ever reaches the backend
          await uploadToCloudinary(blob, `voice-message-${Date.now()}.webm`, 'audio/webm');
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingStartTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    audioChunksRef.current = []; // clear before stop so onstop skips upload
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadFile(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  return (
    <div className="relative p-4 md:p-6 bg-surface-container border-t border-white/5 space-y-4">
      {/* Reply Preview Bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 px-4 py-3 bg-secondary/30 border-l-4 border-primary-accent/50 rounded-lg mb-2 group relative"
          >
            <div className="shrink-0 text-primary-accent">
              <CornerUpLeft className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-primary-accent uppercase tracking-widest truncate">
                Replying to {replyTo.reply_to_preview?.sender_name || replyTo.sender_name || 'Contact'}
              </p>
              <p className="text-sm text-white/60 truncate italic">
                {replyTo.content || (replyTo.attachment_url ? `[${replyTo.attachment_type || 'Attachment'}]` : '...')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearReply}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Overlay */}
      {(isUploading || uploadFile || uploadError) && (
        <FileUploadProgress
          fileName={uploadFile?.name || 'File'}
          progress={uploadProgress}
          onCancel={cancelUpload}
          error={uploadError}
        />
      )}


      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-3 group"
      >
        <div className="flex shrink-0 items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleFileClick}
            disabled={isUploading || disabled}
            className={cn(
              'p-3 rounded-2xl transition-all active:scale-95',
              isUploading
                ? 'text-primary-accent'
                : 'text-white/20 hover:text-white/60 hover:bg-white/5',
            )}
            title="Attach File"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => setShowEmojiPicker(open => !open)}
            disabled={disabled}
            className={cn(
              'p-3 rounded-2xl transition-all active:scale-95 hidden md:flex',
              showEmojiPicker
                ? 'text-primary-accent bg-white/5'
                : 'text-white/20 hover:text-white/60 hover:bg-white/5',
            )}
            title="Add Emoji"
            aria-expanded={showEmojiPicker}
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full left-12 z-50 mb-3">
            <EmojiPicker onSelect={handleEmojiSelect} variant="grid" />
          </div>
        )}

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between w-full bg-primary-accent/10 border border-primary-accent/20 rounded-[28px] py-3 px-6 h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-white/90">
                    Recording... {formatDuration(recordingDuration)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 animate-pulse hidden sm:inline">
                    Release to send • Slide to cancel
                  </span>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {message.trim() || (uploadFile && uploadFile.url && !uploadError) ? (
          <button
            type="submit"
            disabled={isSending || disabled || isUploading}
            className={cn(
              'shrink-0 p-4 rounded-[28px] transition-all shadow-xl active:scale-95',
              'bg-primary-accent text-on-primary-fixed shadow-primary-accent/20',
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={cancelRecording}
            onTouchStart={(e) => {
              e.preventDefault();
              startRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            disabled={disabled || isUploading}
            className={cn(
              'shrink-0 p-4 rounded-[28px] transition-all shadow-xl active:scale-105 touch-none',
              isRecording
                ? 'bg-red-500 text-white shadow-red-500/20 scale-110'
                : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60 hover:bg-white/10',
            )}
          >
            <Mic className={cn('w-5 h-5', isRecording && 'animate-pulse')} />
          </button>
        )}
      </form>
    </div>
  );
}