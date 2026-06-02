'use client';

import React, { use, useState, useEffect } from 'react';
import {
  Plus,
  GraduationCap,
  Search,
  Filter,
  Users,
  LayoutGrid,
  TrendingUp,
  Download,
  PlusCircle,
  MoreVertical,
  UserPlus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GradeCard } from '@/components/admin/grades/GradeCard';
import { TeacherAssignmentModal } from '@/components/admin/grades/TeacherAssignmentModal';
import { LearnerTransitionModal } from '@/components/admin/grades/LearnerTransitionModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skeleton Loader Component
const GradesSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-32 bg-slate-100 rounded-md"></div>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="h-5 w-24 bg-slate-100 rounded-md hidden md:block"></div>
          <div className="h-5 w-24 bg-slate-100 rounded-md hidden md:block"></div>
          <div className="h-10 w-10 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function SchoolGradesPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [grades, setGrades] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState(false);
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);

  useEffect(() => {
    // Mock data based on requirements
    const timer = setTimeout(() => {
      setGrades([
        {
          id: '1',
          name: 'Grade 8',
          learnersCount: 124,
          classes: [
            {
              id: '8a',
              name: '8A',
              learnerCount: 34,
              capacity: 40,
              classTeacher: 'Mr Dhlamini',
              subjectTeachers: [
                { name: 'Ms Peterson', subject: 'English' },
                { name: 'Mr Botha', subject: 'Mathematics' }
              ]
            },
            {
              id: '8b',
              name: '8B',
              learnerCount: 36,
              capacity: 40,
              classTeacher: 'Mrs Smith',
              subjectTeachers: [
                { name: 'Mr Naidoo', subject: 'Science' }
              ]
            }
          ]
        },
        {
          id: '2',
          name: 'Grade 9',
          learnersCount: 138,
          classes: [
            {
              id: '9a',
              name: '9A',
              learnerCount: 34,
              capacity: 40,
              classTeacher: 'Mrs Smith',
              subjectTeachers: [
                { name: 'Mr Naidoo', subject: 'Science' },
                { name: 'Ms Zondi', subject: 'Zulu' }
              ]
            },
            {
              id: '9b',
              name: '9B',
              learnerCount: 42,
              capacity: 40,
              classTeacher: 'Mr Mabaso',
              subjectTeachers: [
                { name: 'Mrs White', subject: 'History' }
              ]
            }
          ]
        },
        { id: '3', name: 'Grade 10', learnersCount: 142, classes: [] },
        { id: '4', name: 'Grade 11', learnersCount: 118, classes: [] },
        { id: '5', name: 'Grade 12', learnersCount: 105, classes: [] },
      ]);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [schoolSlug]);

  const displayName = "Far North Secondary School"; // Hardcoded for this phase as per context

  const filteredGrades = grades.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Dynamic Header with Quick Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-school-primary rounded-full"></div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Academic Structures</h2>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Manage the management hierarchy of <span className="text-slate-900 font-bold">{displayName}</span>.
            Configure grade levels, class allocations and teacher assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={() => setIsTeacherModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Assign Teacher
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-school-primary text-white text-sm font-black rounded-2xl hover:bg-school-primary/90 transition-all shadow-xl shadow-school-primary/20">
            <PlusCircle className="w-4 h-4" />
            New Grade Level
          </button>
        </div>
      </div>

      {/* Intelligent Stats Mesh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <GraduationCap className="w-24 h-24 rotate-12" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Enrollment</p>
          <h4 className="text-3xl font-black text-slate-900">
            {isLoading ? '...' : grades.reduce((acc, g) => acc + g.learnersCount, 0)}
          </h4>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-500 font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4.2% increase</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Class Structures</p>
          <h4 className="text-3xl font-black text-slate-900">
            {isLoading ? '...' : grades.reduce((acc, g) => acc + g.classes.length, 0)} Active
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-2">Across {grades.length} grades</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Class Size</p>
          <h4 className="text-3xl font-black text-slate-900">34.2</h4>
          <p className="text-xs text-slate-500 font-medium mt-2">Optimal: 35.0</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group border-amber-200 bg-amber-50/30">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Capacity Alerts</p>
          <h4 className="text-3xl font-black text-amber-700">2 Issues</h4>
          <p className="text-xs text-amber-600 font-medium mt-2 underline cursor-pointer">View violations</p>
        </div>
      </div>

      {/* Main Grid Interface */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grades or classes..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 transition-all outline-none text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <div className="w-[1px] h-6 bg-slate-200"></div>
            <select className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 cursor-pointer pr-8">
              <option>Alphabetical</option>
              <option>Enrollment</option>
              <option>Capacity</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <GradesSkeleton />
        ) : (
          <div className="space-y-4">
            {filteredGrades.map((grade) => (
              <GradeCard
                key={grade.id}
                grade={grade}
                onAddClass={(id) => { setActiveGradeId(id); setIsTeacherModalOpen(true); }}
                onAddLearner={(id) => { setActiveGradeId(id); setIsLearnerModalOpen(true); }}
                onViewDetails={(id) => console.log('View details', id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TeacherAssignmentModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onAssign={(data) => console.log('Assign teacher', data)}
      />
      <LearnerTransitionModal
        isOpen={isLearnerModalOpen}
        onClose={() => setIsLearnerModalOpen(false)}
        onTransition={(data) => console.log('Transition learner', data)}
      />
    </div>
  );
}
