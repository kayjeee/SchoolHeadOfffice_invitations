'use client';

import React, { use } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Users,
  GraduationCap,
  TrendingUp,
  FileText,
  LayoutGrid,
  List,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, StatsCard, DashboardSection } from '@/components/admin/common/DashboardUI';

export default function SubjectsPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolData, isLoading } = useSchool(schoolSlug);

  const subjects = [
    { id: '1', name: 'Mathematics', code: 'MATH-SEC', teachers: 8, classes: 12, performance: '82%', trend: '+4%', level: 'Secondary' },
    { id: '2', name: 'Physical Science', code: 'SCI-PHYS', teachers: 5, classes: 9, performance: '76%', trend: '-2%', level: 'Secondary' },
    { id: '3', name: 'English First Language', code: 'ENG-FL', teachers: 10, classes: 15, performance: '88%', trend: '+1%', level: 'All Levels' },
    { id: '4', name: 'Information Technology', code: 'CAT-IT', teachers: 3, classes: 6, performance: '91%', trend: '+5%', level: 'Further Education' },
    { id: '5', name: 'Economics', code: 'BUS-ECON', teachers: 4, classes: 8, performance: '79%', trend: '+0%', level: 'Secondary' },
    { id: '6', name: 'Life Orientation', code: 'LIFE-OR', teachers: 12, classes: 20, performance: '94%', trend: '+2%', level: 'All Levels' },
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Subject Curriculum"
        description="Design and manage academic subjects, curriculum resources, and faculty assignments."
        icon={BookOpen}
        actions={
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        }
      />

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Subjects" value="24" icon={BookOpen} />
        <StatsCard label="Curriculum Docs" value="142" change="+8" icon={FileText} />
        <StatsCard label="Avg Pass Rate" value="84.5%" change="+1.2%" icon={CheckCircle2} />
        <StatsCard label="Pending Material" value="12" icon={Clock} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
           <button className="px-3 py-1.5 bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
           </button>
           <button className="px-3 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold flex items-center gap-2">
              <List className="w-3.5 h-3.5" />
              List
           </button>
        </div>

        <div className="flex flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects, codes, or levels..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 transition-all outline-none"
          />
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all">
          <Filter className="w-4 h-4" />
          Filter Levels
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, i) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white rounded-[2rem] border border-slate-200 p-6 hover:border-school-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-school-primary/10 transition-colors">
                <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-school-primary" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{subject.code}</span>
                <span className="text-[10px] font-bold text-school-primary">{subject.level}</span>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-school-primary transition-colors">
              {subject.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Teachers</p>
                 <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-black text-slate-900">{subject.teachers} Faculty</span>
                 </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Classes</p>
                 <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-black text-slate-900">{subject.classes} Groups</span>
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Performance</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900">{subject.performance}</span>
                  <span className={`text-[10px] font-bold ${subject.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {subject.trend}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                Manage
              </button>
            </div>

            {/* Background design element */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
               <BookOpen className="w-32 h-32" />
            </div>
          </motion.div>
        ))}

        {/* Add New Card */}
        <button className="rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-school-primary hover:border-school-primary/50 hover:bg-school-primary/5 transition-all group">
           <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 group-hover:border-school-primary/50 flex items-center justify-center">
              <Plus className="w-8 h-8" />
           </div>
           <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest">New Subject</p>
              <p className="text-xs font-medium opacity-60">Add a new curriculum area</p>
           </div>
        </button>
      </div>

      {/* Curriculum Resource Section */}
      <DashboardSection
        title="Curriculum Resources"
        subtitle="Shared educational material and planning documents"
        actions={
          <button className="text-xs font-black text-school-primary uppercase tracking-widest hover:underline">
            View Repository
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { name: 'Grade 12 MATH CAPS.pdf', type: 'Curriculum', size: '2.4MB' },
             { name: 'Physics Lab Safety.docx', type: 'Safety', size: '840KB' },
             { name: 'History Assessment Guide.pdf', type: 'Assessment', size: '1.2MB' },
             { name: 'IT Lab Schedule 2024.xlsx', type: 'Admin', size: '420KB' }
           ].map((doc, idx) => (
             <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div className="min-w-0">
                   <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                   <p className="text-[10px] text-slate-400 font-medium">{doc.type} • {doc.size}</p>
                </div>
             </div>
           ))}
        </div>
      </DashboardSection>
    </div>
  );
}
