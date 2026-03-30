'use client';

import React from 'react';
import {
  Bell,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ActivityItem {
  id: string;
  type: 'insight' | 'message' | 'alert' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  schoolSlug: string;
  teacherSlug: string;
  metadata?: any;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  godMode?: boolean;
}

const ActivityIcon = ({ type, godMode }: { type: ActivityItem['type'], godMode: boolean }) => {
  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';
  const accentBg = godMode ? 'bg-secondary-accent/10' : 'bg-primary-accent/10';
  const accentBorder = godMode ? 'border-secondary-accent/20' : 'border-primary-accent/20';

  switch (type) {
    case 'insight':
      return (
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center p-2.5 border", accentBg, accentBorder)}>
          <Zap className={cn("w-full h-full", accentColor)} />
        </div>
      );
    case 'message':
      return (
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center p-2.5">
          <MessageSquare className="w-full h-full text-indigo-400" />
        </div>
      );
    case 'alert':
      return (
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center p-2.5">
          <AlertCircle className="w-full h-full text-red-400" />
        </div>
      );
    case 'success':
      return (
        <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center p-2.5">
          <CheckCircle2 className="w-full h-full text-green-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5">
          <Bell className="w-full h-full text-white/40" />
        </div>
      );
  }
};

export default function ActivityFeed({ activities, godMode = false }: ActivityFeedProps) {
  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {activities.length > 0 ? (
        activities.map((item) => (
          <div
            key={item.id}
            className="group relative flex items-start gap-4 p-4 rounded-3xl bg-surface-container border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-black/20"
          >
            <ActivityIcon type={item.type} godMode={godMode} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-white/90 truncate">{item.title}</h4>
                <div className="flex items-center gap-2 text-[10px] font-medium text-white/30 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {item.metadata?.trend && (
                <div className="mt-3 flex items-center gap-3">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                    item.metadata.trend === 'up' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {item.metadata.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {item.metadata.trendValue}%
                  </div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.metadata.trendLabel}</span>
                </div>
              )}
            </div>

            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-lg transition-all">
              <MoreVertical className="w-4 h-4 text-white/40" />
            </button>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-surface-container rounded-3xl border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-white/10" />
          </div>
          <h3 className="text-lg font-bold text-white/80 mb-2">Intelligence Stream is Quiet</h3>
          <p className="text-sm text-white/40 max-w-xs mx-auto">All systems are operational. New insights will appear here in real-time as they are detected.</p>
        </div>
      )}
    </div>
  );
}
