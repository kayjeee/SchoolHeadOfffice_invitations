import React, { useState } from 'react';
import { FileIcon, Download, ExternalLink, Play, Eye, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

interface AttachmentPreviewProps {
  url: string;
  type: string;
  name: string;
  isMine?: boolean;
}

export default function AttachmentPreview({
  url,
  type,
  name,
  isMine = false,
}: AttachmentPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isImage = type.startsWith('image/');
  const isVideo = type.startsWith('video/');
  const isPdf = type === 'application/pdf';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  if (isImage) {
    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className="relative mt-2 cursor-pointer group rounded-xl overflow-hidden bg-white/5 border border-white/10 max-w-sm aspect-video sm:aspect-square md:aspect-video flex items-center justify-center min-h-[100px]">
            {!isLoaded && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
              </div>
            )}
            <img
              src={url}
              alt={name}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                !isLoaded ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 gap-2 p-4 text-center">
                <FileIcon className="w-8 h-8 text-red-400/60" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/60">Failed to load image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed inset-4 sm:inset-10 z-50 flex items-center justify-center outline-none animate-in zoom-in-95 duration-300">
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={url} alt={name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                  title="Download"
                >
                  <Download className="w-6 h-6" />
                </button>
                <Dialog.Close className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
                  <X className="w-6 h-6" />
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  if (isVideo) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden bg-black/20 border border-white/10 max-w-sm aspect-video relative group">
         {!isLoaded && !hasError && (
           <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-white/20" />
           </div>
         )}
         <video
           src={url}
           controls
           className={cn(
             "w-full h-full bg-black/40",
             !isLoaded ? "opacity-0" : "opacity-100"
           )}
           onLoadedData={() => setIsLoaded(true)}
           onError={() => setHasError(true)}
         />
         {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 gap-2">
              <Play className="w-12 h-12 text-red-400/20" />
              <p className="text-xs font-bold uppercase tracking-widest text-red-400/60">Processing Video...</p>
            </div>
         )}
      </div>
    );
  }

  // Fallback for PDFs and other docs
  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group",
        isMine
          ? "bg-white/10 border-white/10 hover:bg-white/20"
          : "bg-white/5 border-white/5 hover:bg-white/10"
      )}
      onClick={handleDownload}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        isPdf ? "bg-red-500/10 text-red-400" : "bg-primary-accent/10 text-primary-accent"
      )}>
        {isPdf ? <FileText className="w-6 h-6" /> : <FileIcon className="w-6 h-6" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate group-hover:text-white">
          {name}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
          {type.split('/')[1]?.toUpperCase() || 'FILE'}
        </p>
      </div>

      <div className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Download className="w-4 h-4 text-white/60" />
      </div>
    </div>
  );
}
