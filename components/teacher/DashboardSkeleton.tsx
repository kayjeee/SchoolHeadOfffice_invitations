'use client';

import React from 'react';
import { LayoutDashboard, Zap, Activity as ActivityIcon, MessageSquare } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/10 rounded" />
            <div className="w-24 h-3 bg-white/10 rounded" />
          </div>
          <div className="w-64 h-10 bg-white/10 rounded-xl" />
          <div className="w-96 h-4 bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-12 bg-white/5 rounded-2xl border border-white/5" />
          <div className="w-40 h-12 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>

      {/* Command Center Skeleton */}
      <div className="h-24 w-full bg-white/5 rounded-3xl border border-white/5" />

      {/* Navigation Tabs Skeleton */}
      <div className="flex items-center gap-2 p-1 bg-surface-container/50 border border-white/5 rounded-2xl w-fit">
        <div className="w-32 h-10 bg-white/10 rounded-xl" />
        <div className="w-32 h-10 bg-white/5 rounded-xl" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Ribbon Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-3xl bg-surface-container border border-white/5 h-32" />
            ))}
          </div>

          {/* Intelligence Stream Skeleton */}
          <div className="space-y-4">
            <div className="w-48 h-4 bg-white/10 rounded px-2" />
            <div className="h-64 bg-surface-container rounded-3xl border border-white/5" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-6 rounded-3xl bg-surface-container border border-white/5 h-80" />
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 h-48" />
        </div>
      </div>
    </div>
  );
}
