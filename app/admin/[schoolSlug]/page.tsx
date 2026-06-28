'use client';

import React, { use } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import {
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Calendar,
  MessageSquare,
  Bell,
  ArrowUpRight,
  Plus,
  Search,
  PieChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, StatsCard, DashboardSection } from '@/components/admin/common/DashboardUI';

export default function AdminDashboardOverview({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolData, isLoading } = useSchool(schoolSlug);

  const stats = [
    { label: 'Total Learners', value: '1,284', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Teachers Active', value: '86', change: '+3%', icon: UserCheck, color: 'bg-emerald-500' },
    { label: 'Attendance Today', value: '94.2%', change: '-0.4%', icon: Calendar, color: 'bg-amber-500' },
    { label: 'Pending Invoices', value: 'R 42k', change: '+8%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const quickActions = [
    { label: 'Enroll Learner', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Add Teacher', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Send Broadcast', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Generate Report', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentActivity = [
    { user: 'Mrs. Manana', action: 'Promoted 24 learners from Grade 10 to 11', time: '12 mins ago', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    { user: 'System Admin', action: 'Uploaded term 2 examination schedule', time: '45 mins ago', icon: Clock, iconColor: 'text-blue-500' },
    { user: 'Finance Dept', action: 'Generated 1,200 monthly tuition statements', time: '2 hours ago', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    { user: 'Alert System', action: 'Critical: Low attendance detected in Grade 8B', time: '3 hours ago', icon: AlertCircle, iconColor: 'text-red-500' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <PageHeader
        title="School Dashboard"
        description={<>Welcome back to the <span className="text-school-primary font-bold">{schoolData?.schoolName || 'Admin Portal'}</span> command center.</>}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Clock className="w-4 h-4" />
              Past 30 Days
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-school-primary text-white text-sm font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20">
              <Plus className="w-4 h-4" />
              Quick Entry
            </button>
          </>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Main Insights */}
        <div className="xl:col-span-2 space-y-8">

          {/* Charts Placeholder Section */}
          <DashboardSection
            title="Attendance & Engagement"
            subtitle="Real-time tracking of student presence and participation."
            actions={
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">Weekly</button>
                <button className="px-3 py-1.5 text-[10px] font-black uppercase bg-white text-school-primary shadow-sm rounded-md transition-all">Monthly</button>
              </div>
            }
          >
             {/* Visual representation of a chart */}
             <div className="aspect-[21/9] w-full bg-slate-50 rounded-2xl flex items-end justify-around p-6 gap-2 border border-slate-100 overflow-hidden relative">
                {[45, 60, 40, 70, 85, 55, 90, 75, 65, 80, 95, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + (i * 0.05), duration: 1 }}
                    className="w-full bg-school-primary/20 rounded-t-md hover:bg-school-primary transition-colors cursor-pointer relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </motion.div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <PieChart className="w-48 h-48" />
                </div>
             </div>

             <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-school-primary"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Present</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Late</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Absent</span>
                   </div>
                </div>
                <button className="text-[10px] font-black text-school-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                   Full Analysis
                   <ChevronRight className="w-3 h-3" />
                </button>
             </div>
          </DashboardSection>

          {/* Activity Section */}
          <DashboardSection
            title="Recent Campus Activity"
            actions={
              <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                Clear Logs
              </button>
            }
            className="p-0" // Remove default padding for list
          >
             <div className="divide-y divide-slate-50">
                {recentActivity.map((item, i) => (
                  <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
                    <div className={`p-2 rounded-xl bg-white border border-slate-100 ${item.iconColor} shadow-sm`}>
                       <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-slate-900 leading-tight">{item.action}</p>
                       <p className="text-xs text-slate-400 mt-1">
                          <span className="text-slate-600 font-bold">{item.user}</span> • {item.time}
                       </p>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-100 transition-all">
                       <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
             <button className="w-full py-4 bg-slate-50 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">
                View All Activity
             </button>
          </DashboardSection>
        </div>

        {/* Right: Actions & Sidebar */}
        <div className="space-y-8">
           {/* Quick Actions Card */}
           <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                 <Plus className="w-40 h-40" />
              </div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 relative z-10">Command Palette</h4>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                 {quickActions.map((action, i) => (
                   <button
                     key={i}
                     className="flex flex-col items-start p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                   >
                     <div className={`p-2 rounded-lg ${action.bg} ${action.color} mb-3`}>
                        <action.icon className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-black tracking-tight">{action.label}</span>
                   </button>
                 ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">⌘K</kbd> for Search</span>
                 </div>
              </div>
           </section>

           {/* System Health */}
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Network Connectivity</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Cloud Sync', status: 'Optimal', color: 'text-emerald-500' },
                   { label: 'Parent Portal', status: 'Online', color: 'text-emerald-500' },
                   { label: 'Bulk Messaging', status: 'Stable', color: 'text-emerald-500' },
                   { label: 'District Link', status: 'Connecting', color: 'text-amber-500', pulse: true },
                 ].map((sys, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-600">{sys.label}</span>
                     <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${sys.color.replace('text', 'bg')} ${sys.pulse ? 'animate-pulse' : ''}`} />
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Upcoming Events */}
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Academic Calendar</h4>
              <div className="space-y-4">
                 {[
                   { date: '15 MAY', event: 'Parent-Teacher Consultations', type: 'Event' },
                   { date: '22 MAY', event: 'Term 2 Examinations Start', type: 'Academic' },
                   { date: '01 JUN', event: 'Sports Day Athletics', type: 'Extra-Curricular' },
                 ].map((ev, i) => (
                   <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center shrink-0 border border-slate-100 group-hover:border-school-primary transition-colors">
                         <span className="text-[10px] font-black text-slate-900">{ev.date.split(' ')[0]}</span>
                         <span className="text-[8px] font-black text-school-primary uppercase">{ev.date.split(' ')[1]}</span>
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-900 group-hover:text-school-primary transition-colors">{ev.event}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ev.type}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 border border-slate-100 text-[10px] font-black text-slate-400 hover:text-slate-600 rounded-xl transition-all uppercase tracking-widest">
                 View Full Calendar
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
