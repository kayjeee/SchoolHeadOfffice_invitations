'use client';

import React from 'react';
import MessagingSection from '@/components/teacher/messaging/MessagingSection';
import { useSchool } from '@/lib/hooks/useSchool';
import { useApi } from '@/lib/hooks/useApi';
import { PageHeader } from '@/components/admin/common/DashboardUI';
import { MessageSquare, Plus, Bell, Settings } from 'lucide-react';

interface CommunicationsPageProps {
  params: Promise<{ schoolSlug: string }>;
}

export default function CommunicationsPage({ params }: CommunicationsPageProps) {
  const { schoolSlug } = React.use(params);
  const { schoolId, schoolData, isLoading: schoolLoading } = useSchool(schoolSlug);
  const { user, isLoading: authLoading } = useApi();

  // Prefer Auth0 sub, fallback to dev mock if not logged in
  const currentUserId = user?.sub || "admin-123";

  if (schoolLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="w-8 h-8 border-4 border-school-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Communications Hub"
        description="Connect with parents, teachers, and staff in real-time. Enterprise WhatsApp for schools."
        icon={MessageSquare}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              <Plus className="w-4 h-4" />
              <span>New Broadcast</span>
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 min-h-[700px] flex flex-col">
        <div className="flex-1">
          <MessagingSection
            currentUserId={currentUserId}
            schoolId={schoolId || ''}
            godMode={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-lg mb-1">98% Open Rate</h4>
          <p className="text-white/60 text-sm">WhatsApp messages have a significantly higher engagement than email.</p>
        </div>
        <div className="p-6 bg-emerald-600 rounded-[2rem] text-white">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-lg mb-1">Instant Delivery</h4>
          <p className="text-white/60 text-sm">Send urgent school alerts and newsletters directly to parents phones.</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-[2rem]">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
          <h4 className="font-bold text-lg mb-1 text-slate-900">Safe & Secure</h4>
          <p className="text-slate-500 text-sm">End-to-end encrypted messaging with full school audit logs.</p>
        </div>
      </div>
    </div>
  );
}
