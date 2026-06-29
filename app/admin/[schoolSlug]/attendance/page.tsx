'use client';

import React, { use } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Download,
  Mail,
  Smartphone,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, StatsCard, DashboardSection } from '@/components/admin/common/DashboardUI';

export default function AttendancePage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolData, isLoading } = useSchool(schoolSlug);

  const classes = [
    { name: 'Grade 12A', teacher: 'Dr. Sarah Jenkins', present: 28, late: 2, absent: 0, total: 30, trend: '93%' },
    { name: 'Grade 12B', teacher: 'Mr. David Molefe', present: 24, late: 1, absent: 5, total: 30, trend: '80%' },
    { name: 'Grade 11A', teacher: 'Mrs. Elena Rodriguez', present: 32, late: 0, absent: 0, total: 32, trend: '100%' },
    { name: 'Grade 11B', teacher: 'Mr. James Thompson', present: 26, late: 4, absent: 2, total: 32, trend: '81%' },
    { name: 'Grade 10A', teacher: 'Ms. Linda Zulu', present: 28, late: 2, absent: 0, total: 30, trend: '93%' },
    { name: 'Grade 10B', teacher: 'Mr. Robert Smith', present: 15, late: 5, absent: 10, total: 30, trend: '50%' },
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Attendance Tracking"
        description="Monitor daily student presence, manage excused absences, and analyze attendance trends."
        icon={Calendar}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" />
              Reports
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              <Plus className="w-4 h-4" />
              Manual Registry
            </button>
          </div>
        }
      />

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="School Presence" value="92.4%" change="+1.2%" icon={CheckCircle2} />
        <StatsCard label="Unexcused Absence" value="42" change="-8" icon={XCircle} />
        <StatsCard label="Late Arrivals" value="18" icon={Clock} />
        <StatsCard label="At Risk Learners" value="12" icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <DashboardSection
            title="Class Registry Overview"
            subtitle="Live status of classroom attendance for today"
            actions={
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" placeholder="Search classes..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-school-primary w-48" />
                 </div>
                 <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                    <Filter className="w-3.5 h-3.5" />
                 </button>
              </div>
            }
          >
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-slate-100">
                         <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class / Teacher</th>
                         <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                         <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance %</th>
                         <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {classes.map((cls, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="py-4">
                              <p className="text-sm font-black text-slate-900">{cls.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{cls.teacher}</p>
                           </td>
                           <td className="py-4">
                              <div className="flex items-center justify-center gap-4">
                                 <div className="text-center">
                                    <p className="text-xs font-black text-emerald-600">{cls.present}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Present</p>
                                 </div>
                                 <div className="text-center">
                                    <p className="text-xs font-black text-amber-500">{cls.late}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Late</p>
                                 </div>
                                 <div className="text-center">
                                    <p className="text-xs font-black text-rose-500">{cls.absent}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Absent</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4">
                              <div className="flex items-center justify-center gap-3">
                                 <div className="flex-1 max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${parseInt(cls.trend) > 90 ? 'bg-emerald-500' : parseInt(cls.trend) > 75 ? 'bg-amber-400' : 'bg-rose-500'}`}
                                      style={{ width: cls.trend }}
                                    />
                                 </div>
                                 <span className="text-xs font-black text-slate-900">{cls.trend}</span>
                              </div>
                           </td>
                           <td className="py-4 text-right">
                              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                 <ChevronRight className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </DashboardSection>
        </div>

        <div className="space-y-8">
           {/* Alerts & Risk */}
           <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-rose-500 text-white rounded-xl">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 <h4 className="font-black text-rose-900">Attendance Alerts</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { name: 'Thabo Mokoena', detail: 'Absent for 3 consecutive days', grade: '12B' },
                   { name: 'Sarah Wilson', detail: 'Persistent late coming (5 instances)', grade: '10B' },
                   { name: 'Michael Ndlovu', detail: 'Attendance dropped below 75%', grade: '11B' }
                 ].map((alert, i) => (
                   <div key={i} className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-xs font-black text-slate-900">{alert.name}</span>
                         <span className="text-[10px] font-black text-rose-500 uppercase">{alert.grade}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mb-3">{alert.detail}</p>
                      <div className="flex gap-2">
                         <button className="flex-1 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-600 transition-colors">
                            Notify Parent
                         </button>
                         <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors">
                            <Smartphone className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Trend Chart Placeholder */}
           <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Attendance Heatmap</h4>
                 <BarChart3 className="w-4 h-4 text-slate-300" />
              </div>
              <div className="grid grid-cols-5 gap-2 h-40 items-end">
                 {[40, 70, 90, 85, 95].map((h, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                         <div className="absolute inset-0 bg-emerald-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
