import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export default function MessageStatus({ status = 'sent' }: MessageStatusProps) {
  const isRead = status === 'read';
  const isDelivered = status === 'delivered' || isRead;

  return (
    <span
      className={cn(
        'flex items-center transition-colors',
        isRead ? 'text-blue-400' : 'text-white/25'
      )}
      aria-label={`Message ${status}`}
      title={`Message ${status}`}
    >
      {isDelivered ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
    </span>
  );
}
