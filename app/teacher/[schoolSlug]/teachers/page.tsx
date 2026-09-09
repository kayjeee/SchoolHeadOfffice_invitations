'use client';

import React, { use, useState, useEffect } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import { SchoolAPI, Teacher } from '@/lib/api/school-api';
import {
  Briefcase,
  Search,
  Mail,
  Users,
  Loader2,
  Info,
  Building2,
  GraduationCap
} from 'lucide-react';

export default function TeacherStaffDirectoryPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, isLoading: isSchoolLoading } = useSchool(schoolSlug);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!schoolId) return;

    let isMounted = true;
    setIsLoading(true);

    SchoolAPI.getTeachers(schoolId)
      .then(data => {
        if (isMounted) setTeachers(data);
      })
      .catch(err => console.error('Failed to load faculty directory:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span>Faculty Staff Directory</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            School teaching staff, department leads, and administrative colleagues.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold w-fit">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Faculty Read-Only Directory</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search colleagues by name, department, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
        />
      </div>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-xs font-bold">Loading faculty directory...</span>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">No Colleagues Found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeachers.map(teacher => (
            <div
              key={teacher.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500/30 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg">
                  {teacher.avatar || teacher.name.charAt(0)}
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-wider">
                  {teacher.status || 'Active'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{teacher.name}</h4>
                <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                  {teacher.role || 'Faculty Member'}
                </p>
              </div>

              {teacher.grades && teacher.grades.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {teacher.grades.map((g, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Department</span>
                  <span className="text-slate-900 font-bold">{teacher.department || 'General'}</span>
                </div>
                {teacher.email && (
                  <div className="flex items-center gap-1.5 text-slate-600 pt-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px]">{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
