'use client';

import React, { useState, useEffect, use } from 'react';
import { Plus, Search, Filter, GraduationCap, TrendingUp, Download, UserPlus, PlusCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GradeCard } from '@/components/admin/grades/GradeCard';
import { GradeModal } from '@/components/admin/grades/GradeModal';
import { TeacherAssignmentModal } from '@/components/admin/grades/TeacherAssignmentModal';
import { LearnerTransitionModal } from '@/components/admin/grades/LearnerTransitionModal';
import { SchoolAPI, Grade } from '@/lib/api/school-api';
import { toast } from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skeleton Loader Component
const GradesSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-32 bg-slate-100 rounded-md"></div>
          </div>
          <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function SchoolGradesPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeModalMode, setGradeModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState(false);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const data = await SchoolAPI.getGrades(schoolSlug);
      setGrades(data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      toast.error('Failed to load grades hierarchy');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [schoolSlug]);

  const displayName = schoolSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const filteredGrades = grades.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalLearners = grades.reduce((acc, g) => acc + (g.total_learners || 0), 0);
  const totalClasses = grades.reduce((acc, g) => acc + (g.total_classes || 0), 0);
  const avgClassSize = totalClasses > 0 ? Math.round(totalLearners / totalClasses) : 0;
  const capacityIssues = grades.flatMap(g =>
    g.classes?.filter(c => (c.current_learners || 0) > c.capacity) || []
  ).length;

  const handleGradeSuccess = () => {
    fetchGrades();
  };

  const handleClassUpdated = (gradeId: string, updatedClass: any) => {
    setGrades(prevGrades => prevGrades.map(grade => {
      if (grade.id === gradeId) {
        const existingClasses = grade.classes || [];
        const classExists = existingClasses.some(c => c.id === updatedClass.id);

        return {
          ...grade,
          classes: classExists
            ? existingClasses.map(c => c.id === updatedClass.id ? updatedClass : c)
            : [...existingClasses, updatedClass],
          total_classes: classExists ? grade.total_classes : (grade.total_classes || 0) + 1
        };
      }
      return grade;
    }));
  };

  const handleEditGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setGradeModalMode('edit');
    setIsGradeModalOpen(true);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (confirm('Are you sure you want to delete this grade? All associated classes will also be deleted.')) {
      try {
        await SchoolAPI.deleteGrade(gradeId);
        toast.success('Grade deleted successfully');
        fetchGrades();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete grade');
      }
    }
  };

  const handleAssignTeacher = async (data: any) => {
    if (!activeClassId) return;
    try {
      await SchoolAPI.assignTeacher(activeClassId, {
        teacher_id: data.teacher_id,
        role: data.role === 'class' ? 'class_teacher' : 'subject_teacher',
        subject_ids: data.subjects || []
      });
      toast.success('Teacher assigned successfully');
      fetchGrades();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign teacher');
    }
  };

  const handleTransitionLearner = async (data: any) => {
    if (!data.learner_id) return;
    try {
      await SchoolAPI.moveLearner(data.learner_id, {
        target_class_id: data.target_class_id,
        school_id: schoolSlug
      });
      toast.success('Learner transition successful');
      fetchGrades();
    } catch (error: any) {
      toast.error(error.message || 'Failed to transition learner');
    }
  };

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
            onClick={() => {
              setActiveClassId(null);
              setIsTeacherModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Assign Teacher
          </button>
          <button
            onClick={() => {
              setSelectedGrade(null);
              setGradeModalMode('create');
              setIsGradeModalOpen(true);
            }}
            className="flex items-center gap-2 px-8 py-3 bg-school-primary text-white text-sm font-black rounded-2xl hover:bg-school-primary/90 transition-all shadow-xl shadow-school-primary/20"
          >
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
            {isLoading ? '...' : totalLearners}
          </h4>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-500 font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4.2% increase</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Class Structures</p>
          <h4 className="text-3xl font-black text-slate-900">
            {isLoading ? '...' : totalClasses} Active
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-2">Across {grades.length} grades</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Class Size</p>
          <h4 className="text-3xl font-black text-slate-900">{avgClassSize}</h4>
          <p className="text-xs text-slate-500 font-medium mt-2">Target: 35.0</p>
        </div>

        <div className={cn(
          "bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden group",
          capacityIssues > 0 ? "border-amber-200 bg-amber-50/30" : "border-slate-200"
        )}>
          <p className={cn(
            "text-xs font-bold uppercase tracking-widest mb-1",
            capacityIssues > 0 ? "text-amber-600" : "text-slate-400"
          )}>
            Capacity Alerts
          </p>
          <h4 className={cn(
            "text-3xl font-black",
            capacityIssues > 0 ? "text-amber-700" : "text-slate-900"
          )}>
            {capacityIssues} {capacityIssues === 1 ? 'Issue' : 'Issues'}
          </h4>
          <p className={cn(
            "text-xs font-medium mt-2 underline cursor-pointer",
            capacityIssues > 0 ? "text-amber-600" : "text-slate-400"
          )}>
            {capacityIssues > 0 ? 'View violations' : 'No capacity issues'}
          </p>
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
              <option>By Level</option>
              <option>By Enrollment</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <GradesSkeleton />
        ) : filteredGrades.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No grades found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? `No results matching "${searchQuery}"` : 'Get started by creating your first grade level'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  setSelectedGrade(null);
                  setGradeModalMode('create');
                  setIsGradeModalOpen(true);
                }}
                className="px-6 py-3 bg-school-primary text-white font-bold rounded-xl hover:bg-school-primary/90 transition-all"
              >
                Create Grade
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGrades.map((grade) => (
              <GradeCard
                key={grade.id}
                grade={grade}
                schoolId={schoolSlug}
                onEditGrade={handleEditGrade}
                onDeleteGrade={handleDeleteGrade}
                onClassUpdated={handleClassUpdated}
                onAssignTeacher={(classId) => {
                  setActiveGradeId(grade.id);
                  setActiveClassId(classId);
                  setIsTeacherModalOpen(true);
                }}
                onMoveLearner={(classId) => {
                  setActiveGradeId(grade.id);
                  setActiveClassId(classId);
                  setIsLearnerModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <GradeModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        mode={gradeModalMode}
        grade={selectedGrade}
        schoolId={schoolSlug}
        onSuccess={handleGradeSuccess}
      />

      <TeacherAssignmentModal
        isOpen={isTeacherModalOpen}
        schoolId={schoolSlug}
        onClose={() => setIsTeacherModalOpen(false)}
        onAssign={handleAssignTeacher}
      />

      <LearnerTransitionModal
        isOpen={isLearnerModalOpen}
        schoolId={schoolSlug}
        gradeId={activeGradeId || ''}
        classId={activeClassId || ''}
        onClose={() => setIsLearnerModalOpen(false)}
        onTransition={handleTransitionLearner}
      />
    </div>
  );
}
