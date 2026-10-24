import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Participant } from '@/lib/types/messaging';

interface GroupAvatarProps {
  participants: Participant[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GroupAvatar({ participants, className, size = 'md' }: GroupAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const avatarSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  // Only show up to 3 avatars
  const displayParticipants = participants.slice(0, 3);

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {displayParticipants.map((p, i) => (
        <div
          key={p.id}
          className={cn(
            'absolute rounded-xl overflow-hidden border-2 border-surface-container bg-surface-container shadow-sm transition-transform hover:z-10',
            avatarSizeClasses[size],
            i === 0 && 'top-0 left-0 z-30',
            i === 1 && 'bottom-0 right-0 z-20',
            i === 2 && 'top-0 right-0 z-10'
          )}
        >
          {p.avatar ? (
            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <User className="w-3 h-3 text-white/20" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
