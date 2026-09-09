'use client';

import React, { use, useState, useEffect, useMemo } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import { useAuth } from '@/lib/hooks/useAuth';
import { SchoolAPI, Learner, Grade, Class } from '@/lib/api/school-api';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  Loader2,
  BookOpen,
  Eye,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TeacherLearnersPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, isLoading: isSchoolLoading } = useSchool(schoolSlug);
  const { user } = useAuth();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');

  useEffect(() => {
    if (!schoolId) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadAssignedData() {
      try {
        const gradesData = await SchoolAPI.getGrades(schoolId);
        if (!isMounted) return;
        setGrades(gradesData);

        // Fetch learners for assigned grades
        const learnersData = await SchoolAPI.getSchoolLearners(schoolId);
        if (!isMounted) return;
        setLearners(learnersData.learners);
      } catch (err) {
        console.error('Failed to load teacher learners:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAssignedData();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const filteredLearners = useMemo(() => {
    return learners.filter(learner => {
      const fName = learner.name || `${(learner as any).first_name || ''} ${(learner as any).last_name || ''}`;
      const nameMatch = fName.toLowerCase().includes(searchQuery.toLowerCase());
      const admMatch = (learner.admission_number || (learner as any).accession_number || '').toLowerCase().includes(searchQuery.toLowerCase());

      const currentGradeId = learner.gradeId || (learner as any).grade_id;
      const gradeMatch = selectedGradeId === 'all' || currentGradeId === selectedGradeId;

      return (nameMatch || admMatch) && gradeMatch;
    });
  }, [learners, searchQuery, selectedGradeId]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Assigned Class Roster</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Read-only student roster for your assigned grades and class sections.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold w-fit">
          <Info className="w-4 h-4" />
          <span>Faculty Read-Only View</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search learner name or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-slate-900"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none min-w-[160px]"
          >
            <option value="all">All Assigned Grades</option>
            {grades.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-bold">Loading assigned class roster...</span>
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No Learners Found</p>
            <p className="text-xs text-slate-400">Adjust your search or grade filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission #</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade / Section</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLearners.map(learner => {
                  const fullName = learner.name || `${(learner as any).first_name || ''} ${(learner as any).last_name || ''}`.trim() || 'Learner';
                  const grade = grades.find(g => g.id === (learner.gradeId || (learner as any).grade_id));
                  const className = learner.className || (learner as any).class_name || 'Enrolled';

                  return (
                    <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                            {fullName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{fullName}</p>
                            <p className="text-[10px] text-slate-400">{learner.gender_text || learner.gender || 'Student'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                        {learner.admission_number || (learner as any).accession_number || '---'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 text-xs">{grade?.name || 'Assigned Grade'}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">{className}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {learner.parent_phone || '---'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {learner.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
