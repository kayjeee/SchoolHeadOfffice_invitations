'use client';

import React, { use, useState } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import {
  School,
  Search,
  Filter,
  Plus,
  Users,
  UserCheck,
  BookOpen,
  ChevronRight,
  LayoutGrid,
  List,
  MoreVertical,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, StatsCard } from '@/components/admin/common/DashboardUI';

export default function ClassesPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolData, isLoading } = useSchool(schoolSlug);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const classes = [
    { id: '1', name: 'Grade 12A', grade: 'Grade 12', teacher: 'Dr. Sarah Jenkins', learners: 30, capacity: 35, room: 'Room 401' },
    { id: '2', name: 'Grade 12B', grade: 'Grade 12', teacher: 'Mr. David Molefe', learners: 28, capacity: 35, room: 'Room 402' },
    { id: '3', name: 'Grade 11A', grade: 'Grade 11', teacher: 'Mrs. Elena Rodriguez', learners: 32, capacity: 32, room: 'Room 305' },
    { id: '4', name: 'Grade 11B', grade: 'Grade 11', teacher: 'Mr. James Thompson', learners: 26, capacity: 32, room: 'Room 306' },
    { id: '5', name: 'Grade 10A', grade: 'Grade 10', teacher: 'Ms. Linda Zulu', learners: 28, capacity: 35, room: 'Room 201' },
    { id: '6', name: 'Grade 10B', grade: 'Grade 10', teacher: 'Mr. Robert Smith', learners: 15, capacity: 35, room: 'Room 202' },
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Classroom Management"
        description="Organize your student body into classes, assign homeroom teachers, and manage room allocations."
        icon={School}
        actions={
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Active Classes" value="42" icon={School} />
        <StatsCard label="Avg Class Size" value="28" icon={Users} />
        <StatsCard label="Room Utilization" value="88%" icon={UserCheck} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
           <button
             onClick={() => setView('grid')}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${view === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
           </button>
           <button
             onClick={() => setView('list')}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${view === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <List className="w-3.5 h-3.5" />
              List
           </button>
        </div>

        <div className="flex flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by class name, teacher, or room..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 transition-all outline-none"
          />
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all">
          <Filter className="w-4 h-4" />
          All Grades
        </button>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2rem] border border-slate-200 p-6 hover:border-school-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-school-primary/10 transition-colors">
                  <GraduationCap className="w-6 h-6 text-slate-400 group-hover:text-school-primary" />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{cls.grade}</p>
                   <p className="text-[10px] font-bold text-school-primary">{cls.room}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{cls.name}</h3>
              <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">{cls.teacher}</p>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Capacity</span>
                    <span className="text-xs font-black text-slate-900">{cls.learners} / {cls.capacity}</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (cls.learners / cls.capacity) > 0.9 ? 'bg-rose-500' : (cls.learners / cls.capacity) > 0.7 ? 'bg-amber-400' : 'bg-school-primary'
                      }`}
                      style={{ width: `${(cls.learners / cls.capacity) * 100}%` }}
                    />
                 </div>
              </div>

              <div className="mt-8 flex gap-2">
                 <button className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                    View Roster
                 </button>
                 <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                    <MoreVertical className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          ))}

          <button className="rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-school-primary hover:border-school-primary/50 hover:bg-school-primary/5 transition-all group">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 group-hover:border-school-primary/50 flex items-center justify-center">
                <Plus className="w-8 h-8" />
             </div>
             <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest">New Class</p>
                <p className="text-xs font-medium opacity-60">Add a new classroom group</p>
             </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                    <th className="px-6 py-4">Class Name</th>
                    <th className="px-6 py-4">Homeroom Teacher</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Students</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {classes.map((cls) => (
                   <tr key={cls.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{cls.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{cls.teacher}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">{cls.grade}</td>
                      <td className="px-6 py-4 text-xs font-bold text-school-primary">{cls.room}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">{cls.learners}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
