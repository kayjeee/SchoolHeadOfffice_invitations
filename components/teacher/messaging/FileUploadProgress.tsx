import React from 'react';
import { FileIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  onCancel: () => void;
  error?: string | null;
}

export default function FileUploadProgress({
  fileName,
  progress,
  onCancel,
  error = null,
}: FileUploadProgressProps) {
  return (
    <div className="absolute bottom-full left-0 right-0 p-4 bg-surface-container border-t border-white/5 animate-in slide-in-from-bottom-2">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-accent/10 flex items-center justify-center shrink-0">
          <FileIcon className="w-5 h-5 text-primary-accent" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex justify-between items-center gap-2">
            <p className="text-sm font-medium text-white/90 truncate">
              {fileName}
            </p>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider shrink-0">
              {error ? 'Upload Failed' : progress < 100 ? `${progress}%` : 'Processing...'}
            </span>
          </div>

          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                error ? "bg-red-500" : "bg-primary-accent"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {error && (
            <p className="text-[10px] font-medium text-red-400">
              {error}
            </p>
          )}
        </div>

        <button
          onClick={onCancel}
          className="p-2 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-xl transition-colors shrink-0"
          title="Cancel Upload"
        >
          {progress < 100 && !error ? (
            <X className="w-5 h-5" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
        </button>
      </div>
    </div>
  );
}
