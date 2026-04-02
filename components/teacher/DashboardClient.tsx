'use client';

import React, { useState } from 'react';
import { useGodmode } from '@/context/GodmodeContext';
import PromptInput from '@/components/teacher/PromptInput';
import ActivityFeed from '@/components/teacher/ActivityFeed';
import AgentStatusList from '@/components/teacher/AgentStatusList';
import MessagingSection from '@/components/teacher/MessagingSection';
import {
  Zap,
  TrendingUp,
  Users,
  BookOpen,
  Mail,
  Heart,
  ChevronRight,
  MoreHorizontal,
  Plus,
  LayoutDashboard,
  ArrowUpRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DashboardData } from '@/lib/types/dashboard';
import Link from 'next/link';

const Activity = ({ className }: { className?: string }) => (
  <Zap className={className} />
);

const Shield = ({ className }: { className?: string }) => (
  <Zap className={className} />
);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardClientProps {
  initialData: DashboardData;
  schoolSlug: string;
  teacherSlug: string;
}

export default function DashboardClient({
  initialData,
  schoolSlug,
  teacherSlug
}: DashboardClientProps) {
  const { godMode, setGodMode } = useGodmode();
  const [data, setData] = useState<DashboardData>(initialData);

  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';
  const accentBg = godMode ? 'bg-secondary-accent/10' : 'bg-primary-accent/10';
  const accentBorder = godMode ? 'border-secondary-accent/20' : 'border-primary-accent/20';
  const accentGradient = godMode ? 'from-secondary-accent to-secondary-accent/40' : 'from-primary-accent to-primary-accent/40';

  const stats = [
    { label: 'Total Learners', value: data.stats.totalLearners, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Active Grades', value: data.stats.activeGrades, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { label: 'Pending Invites', value: data.stats.pendingInvites, icon: Mail, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'Connection Rate', value: `${data.stats.parentConnectionRate}%`, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              <LayoutDashboard className="w-3 h-3" />
              Operational Core
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-white/90">
              Teacher <span className={accentColor}>Dashboard</span>
            </h1>
            <p className="text-sm text-white/40 font-medium">
              Welcome back, {data.teacher.name}. Intelligence systems are active for <span className="text-white/60">{data.school.schoolName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-surface-container/50 border border-white/5 rounded-2xl px-4 py-2">
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Godmode</p>
                <p className="text-[10px] font-bold text-white/60 uppercase">Sentinel Mode</p>
              </div>
              <button
                onClick={() => setGodMode(!godMode)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300",
                  godMode ? "bg-secondary-fixed shadow-[0_0_15px_rgba(188,197,255,0.4)]" : "bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full transition-all duration-300",
                    godMode ? "translate-x-6 bg-on-secondary-fixed" : "translate-x-1 bg-white/40"
                  )}
                />
              </button>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest">
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>

        {/* Command Center */}
        <div className="relative group">
          <div className={cn(
            "absolute -inset-1 rounded-3xl opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40",
            godMode ? "bg-secondary-accent" : "bg-primary-accent"
          )}></div>
          <div className="relative space-y-4">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                 <Zap className={cn("w-3.5 h-3.5", accentColor)} />
                 Command Center
               </h3>
               <div className="flex gap-4">
                 <span className="text-[10px] font-bold text-white/20 uppercase">Core Processing: <span className="text-green-500/60">Nominal</span></span>
                 <span className="text-[10px] font-bold text-white/20 uppercase">Uptime: <span className="text-white/40">99.9%</span></span>
               </div>
             </div>
             <PromptInput godMode={godMode} />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">

          {/* Main Dashboard Stream */}
          <div className="lg:col-span-8 space-y-8">

            {/* Stats Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="group p-4 rounded-3xl bg-surface-container border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2 rounded-2xl border", stat.bg, stat.border)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white/90 mb-0.5 tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Intelligence Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Activity className={cn("w-3.5 h-3.5", accentColor)} />
                  Intelligence Stream
                </h3>
                <button className="text-[10px] font-bold text-white/40 hover:text-white/60 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  Full Feed
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <ActivityFeed activities={data.activities} godMode={godMode} />
            </div>

            {/* Messaging Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className={cn("w-3.5 h-3.5", accentColor)} />
                  Intelligent Messaging
                </h3>
              </div>
              <MessagingSection
                schoolId={data.school.id}
                currentUserId={data.teacher.auth0Id || data.teacher.id}
                godMode={godMode}
              />
            </div>

            {/* Active Classes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className={cn("w-3.5 h-3.5", accentColor)} />
                  Active Classes
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.classes.map((cls) => (
                  <div key={cls.id} className="p-5 rounded-3xl bg-surface-container border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div>
                      <h4 className="text-sm font-black text-white/90 mb-1">{cls.grade_name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{cls.learner_count} Learners</span>
                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                        <span className="text-[10px] font-bold text-green-500/60 uppercase tracking-widest">{cls.connection_rate || 0}% Linked</span>
                      </div>
                    </div>
                    <Link
                      href={`/teacher/school/${schoolSlug}/teachers/${teacherSlug}/grades/${cls.id}`}
                      className={cn("p-3 rounded-2xl bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-all active:scale-95", godMode ? "hover:text-secondary-accent" : "hover:text-primary-accent")}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Active Sentinel Agents */}
          <div className="lg:col-span-4 space-y-8">
             <div className="p-6 rounded-3xl bg-surface-container border border-white/5 space-y-6 relative overflow-hidden">
               {/* Background Glow */}
               <div className={cn("absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-10", godMode ? "bg-secondary-accent" : "bg-primary-accent")}></div>

               <div className="space-y-4 relative">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Shield className={cn("w-3.5 h-3.5", accentColor)} />
                      Active Sentinels
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", godMode ? "bg-secondary-accent" : "bg-primary-accent")}></span>
                        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", godMode ? "bg-secondary-accent" : "bg-primary-accent")}></span>
                      </span>
                      <span className="text-[10px] font-bold text-white/20 uppercase">Live</span>
                    </div>
                 </div>
                 <AgentStatusList agents={data.agents} godMode={godMode} />
               </div>

               <div className="pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Network Load</span>
                    <span className="text-[10px] font-bold text-white/60 uppercase">12% / 100%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full w-[12%] rounded-full", godMode ? "bg-secondary-accent shadow-[0_0_8px_rgba(188,197,255,0.4)]" : "bg-primary-accent shadow-[0_0_8px_rgba(173,198,255,0.4)]")}></div>
                 </div>
               </div>
             </div>

             {/* Quick Actions Card */}
             <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-900 border border-white/10 shadow-2xl shadow-indigo-900/20 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-16 h-16 text-white rotate-12" />
               </div>
               <div className="relative space-y-4">
                  <h3 className="text-lg font-black text-white/90 leading-tight">Generate Weekly<br />Parent Update</h3>
                  <p className="text-xs text-white/60 leading-relaxed">Let the Sentinel summarize this week's classroom performance and post it to your Story.</p>
                  <button className="w-full py-3 rounded-2xl bg-white text-indigo-900 text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl active:scale-95">
                    Start Generation
                  </button>
               </div>
             </div>
          </div>
        </div>
      </div>
  );
}
