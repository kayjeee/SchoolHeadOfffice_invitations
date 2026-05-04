import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, MoreHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/api-client';
import { z } from 'zod';
import FileUploadProgress from './FileUploadProgress';

interface MessageInputProps {
  onSendMessage: (content: string, attachment?: { url: string; type: string; name: string; size?: number }) => void;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState<{ name: string; url: string; type: string; size?: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 💡 Auto-focus textarea on mount (when chat window opens)
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const hasValidAttachment = uploadFile && uploadFile.url && !uploadError;
    const canSend = (message.trim() || hasValidAttachment) && !isSending && !disabled && !isUploading;

    if (canSend) {
      onSendMessage(message, hasValidAttachment ? uploadFile : undefined);
      setMessage('');
      setUploadFile(null);
      setUploadProgress(0);
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);
    setUploadFile({ name: file.name, type: file.type, url: '' });

    try {
      // Step 1: Get Cloudinary signature from backend
      // Backend generates signature using Cloudinary::Utils.api_sign_request
      const data = await apiClient.get<any>(
        '/api/v1/uploads',
        z.any()
      );

      // ✅ Fix the Crash: Ensure we have the signature before proceeding
      // Add a check: if (!data.signature) return; before calling .toString()
      if (!data || !data.signature) {
        setIsUploading(false);
        return;
      }

      const { signature, timestamp, api_key, folder, cloud_name } = data;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || cloud_name || 'chameleon-techie';

      setUploadProgress(30);

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      if (folder) formData.append('folder', folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
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
        name: file.name,
        type: file.type,
        url: result.secure_url,
        size: result.bytes || file.size
      };

      setUploadFile(newAttachment);

      // ✅ Requirement: Auto-send the message once upload is successful
      onSendMessage(message, newAttachment);
      setMessage('');
      setUploadFile(null);
      setUploadProgress(0);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Auto-focus the input after upload
      textareaRef.current?.focus();

    } catch (err) {
      console.error('File upload error:', err);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadFile(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  return (
    <div className="relative p-4 md:p-6 bg-surface-container border-t border-white/5 space-y-4">
      {/* Upload Progress Overlay */}
      {(isUploading || uploadFile || uploadError) && (
        <FileUploadProgress
          fileName={uploadFile?.name || 'File'}
          progress={uploadProgress}
          onCancel={cancelUpload}
          error={uploadError}
        />
      )}

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
              "p-3 rounded-2xl transition-all active:scale-95",
              isUploading ? "text-primary-accent" : "text-white/20 hover:text-white/60 hover:bg-white/5"
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
          disabled={(!message.trim() && !(uploadFile && uploadFile.url && !uploadError)) || isSending || disabled || isUploading}
          className={cn(
            "shrink-0 p-4 rounded-[28px] transition-all shadow-xl active:scale-95",
            (message.trim() || (uploadFile && uploadFile.url && !uploadError)) && !isSending && !disabled && !isUploading
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
