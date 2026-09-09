'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/hooks/useSchool';
import { useAuth } from '@/lib/hooks/useAuth';
import { SchoolAPI } from '@/lib/api/school-api';
import {
  Users,
  Briefcase,
  MessageSquare,
  Package,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';

export default function TeacherDashboardLanding({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, schoolData, isLoading } = useSchool(schoolSlug);
  const { user } = useAuth();

  const [assignedGradesCount, setAssignedGradesCount] = useState(0);
  const [supplySummary, setSupplySummary] = useState({ requested: 0, approved: 0, fulfilled: 0, total: 0 });

  const teacherName =
    user?.name ||
    (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null) ||
    'Teacher';

  const displayName = schoolData?.schoolName || schoolSlug;

  useEffect(() => {
    if (!schoolId) return;

    // Load teacher metrics
    SchoolAPI.getGrades(schoolId)
      .then(grades => setAssignedGradesCount(grades.length))
      .catch(console.error);

    SchoolAPI.getSupplySummary(schoolId, user?.sub)
      .then(summary => setSupplySummary(summary))
      .catch(console.error);
  }, [schoolId, user?.sub]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Faculty Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back, {teacherName}!
          </h1>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            You are currently connected to <span className="text-white font-bold">{displayName}</span>. Manage your class rosters, communicate with parents and administration, and log supply requisitions.
          </p>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 p-8 opacity-10 hidden md:block">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Active Grades</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{assignedGradesCount || '---'}</p>
          <p className="text-xs text-slate-500 font-medium">Mapped academic levels</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Class Roster</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">Assigned</p>
          <p className="text-xs text-slate-500 font-medium">Read-only student roster</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Supplies Pending</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{supplySummary.requested || 0}</p>
          <p className="text-xs text-slate-500 font-medium">Requisitions awaiting triage</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Supplies Fulfilled</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{supplySummary.fulfilled || 0}</p>
          <p className="text-xs text-slate-500 font-medium">Completed orders</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={`/teacher/${schoolSlug}/learners`}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              My Class Roster
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm">
              View your assigned student lists, admission numbers, and contact details.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href={`/teacher/${schoolSlug}/communications`}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Communications
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm">
              Message school administration and participate in faculty broadcast channels.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href={`/teacher/${schoolSlug}/supply-requests`}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              Supply Requisitions
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm">
              Submit requests for paper, printing, and classroom materials directly to administration.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href={`/teacher/${schoolSlug}/teachers`}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Staff Directory
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm">
              View faculty colleagues, department leads, and school administrative roles.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
