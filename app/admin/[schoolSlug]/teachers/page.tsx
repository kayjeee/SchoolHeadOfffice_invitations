'use client';

import React, { use, useEffect, useState } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  BookOpen,
  UserPlus,
  Download,
  ShieldCheck,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, StatsCard } from '@/components/admin/common/DashboardUI';
import { TeacherProfileDrawer } from '@/components/admin/teachers/TeacherProfileDrawer';
import { SchoolAPI, Teacher } from '@/lib/api/school-api';

export default function TeachersCRMPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, isLoading: isSchoolLoading } = useSchool(schoolSlug);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (schoolId) {
      loadTeachers();
    }
  }, [schoolId]);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await SchoolAPI.getTeachers(schoolId!);
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <PageHeader
        title="Teacher Management"
        description="Manage your faculty, academic workloads, and performance metrics."
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" />
              Export Staff List
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-sm font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20">
              <UserPlus className="w-4 h-4" />
              Add Faculty Member
            </button>
          </>
        }
      />

      {/* Faculty Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Faculty" value="114" change="+2" icon={Users} />
        <StatsCard label="Classes Assigned" value="428" change="+12" icon={BookOpen} />
        <StatsCard label="Avg Performance" value="94.2%" icon={Star} />
        <StatsCard label="On Leave" value="6" icon={ShieldCheck} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, department, or subject..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-[320px]">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-1/2 mb-6" />
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="h-2 bg-slate-50 rounded" />
                <div className="h-2 bg-slate-50 rounded" />
              </div>
            </div>
          ))
        ) : filteredTeachers.map((teacher, i) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-school-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg">
                {teacher.avatar || teacher.name.charAt(0)}
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                teacher.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {teacher.status}
              </span>
            </div>

            <h5 className="font-bold text-slate-900 mb-1 truncate">{teacher.name}</h5>
            <p className="text-xs font-black text-school-primary uppercase tracking-wider mb-4">
              {teacher.role}
            </p>

            <div className="space-y-2 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Department</span>
                <span className="text-slate-900 font-bold">{teacher.department || 'General'}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Students</span>
                <span className="text-slate-900 font-bold">{teacher.student_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Avg Result</span>
                <span className="text-emerald-600 font-black">{teacher.performance || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setSelectedTeacher(teacher);
                  setIsDrawerOpen(true);
                }}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 rounded-xl transition-all uppercase tracking-widest border border-slate-100"
              >
                View Profile
              </button>
              <button className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all border border-slate-100">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {/* Empty/Add Slot */}
        <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-school-primary hover:border-school-primary/50 hover:bg-school-primary/5 transition-all group">
           <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 group-hover:border-school-primary/50 flex items-center justify-center">
              <Plus className="w-6 h-6" />
           </div>
           <span className="text-xs font-black uppercase tracking-widest">New Faculty Member</span>
        </button>
      </div>

      <TeacherProfileDrawer
        teacher={selectedTeacher}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
