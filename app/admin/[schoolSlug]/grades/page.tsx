'use client';

import React, { use, useState, useEffect } from 'react';
import {
  Plus,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Users,
  Mail,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skeleton Loader Component
const GradesSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-3 w-48 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="h-4 w-20 bg-slate-100 rounded hidden md:block"></div>
          <div className="h-4 w-24 bg-slate-100 rounded hidden md:block"></div>
          <div className="h-8 w-8 bg-slate-50 rounded-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function SchoolGradesPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [grades, setGrades] = useState<any[]>([]);

  // Mock data fetching - In production, this would use schoolId from a context or fetch by slug
  useEffect(() => {
    const timer = setTimeout(() => {
      setGrades([
        { id: '1', name: 'Grade 8', learners: 124, teachers: 4, status: 'active' },
        { id: '2', name: 'Grade 9', learners: 138, teachers: 5, status: 'active' },
        { id: '3', name: 'Grade 10', learners: 142, teachers: 6, status: 'active' },
        { id: '4', name: 'Grade 11', learners: 118, teachers: 4, status: 'active' },
        { id: '5', name: 'Grade 12', learners: 105, teachers: 6, status: 'active' },
      ]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [schoolSlug]);

  const displayName = schoolSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Grade Structures</h2>
          <p className="text-slate-500 mt-1">Manage academic levels and enrollment for {displayName}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-sm font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20">
            <PlusCircle className="w-4 h-4" />
            Add New Grade
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Grades</p>
              <h4 className="text-2xl font-black text-slate-900">{grades.length} Active</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Learners</p>
              <h4 className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : grades.reduce((acc, g) => acc + g.learners, 0)}
              </h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Open Invitations</p>
              <h4 className="text-2xl font-black text-slate-900">42 Pending</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search grades..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Sort by:</span>
            <select className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer">
              <option>Alphabetical</option>
              <option>Enrollment</option>
              <option>Recently Added</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <GradesSkeleton />
          ) : (
            <div className="space-y-3">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-school-primary hover:shadow-md hover:shadow-school-primary/5 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-school-primary/10 group-hover:text-school-primary transition-colors">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-school-primary transition-colors">{grade.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Standard Academic Level</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-12">
                    <div className="hidden md:flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Learners</span>
                      <span className="text-sm font-bold text-slate-700">{grade.learners}</span>
                    </div>
                    <div className="hidden md:flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Teachers</span>
                      <span className="text-sm font-bold text-slate-700">{grade.teachers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-school-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
