'use client';

import React, { use } from 'react';
import MessagingSection from '@/components/teacher/messaging/MessagingSection';
import { useSchool } from '@/lib/hooks/useSchool';
import { useAuth } from '@/lib/hooks/useAuth';
import { MessageSquare, ShieldCheck, Info } from 'lucide-react';

export default function TeacherCommunicationsPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, isLoading: isSchoolLoading } = useSchool(schoolSlug);
  const { user, isLoading: isAuthLoading } = useAuth();

  const currentUserId = user?.sub || 'teacher-123';

  if (isSchoolLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>Faculty Communications</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Message school administrators and participate in faculty broadcast channels.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Faculty WhatsApp Messaging</span>
        </div>
      </div>

      {/* Reused Messaging UI Container */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl min-h-[650px] flex flex-col">
        <div className="flex-1">
          <MessagingSection
            currentUserId={currentUserId}
            schoolId={schoolId || ''}
            godMode={false}
            skipToken={true}
          />
        </div>
      </div>
    </div>
  );
}
