'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Plus,
  Users,
  BookOpen,
  School,
  Search,
  Filter,
  PlusCircle,
  GraduationCap,
  TrendingUp,
  Download,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { GradeCard } from '@/components/admin/grades/GradeCard';
import { GradeModal } from '@/components/admin/grades/GradeModal';
import { TeacherAssignmentModal } from '@/components/admin/grades/TeacherAssignmentModal';
import { LearnerTransitionModal } from '@/components/admin/grades/LearnerTransitionModal';
import { BulkUploadModal } from '@/components/admin/grades/BulkUploadModal';
import { LearnersSidebar } from '@/components/admin/grades/LearnersSidebar';
import { SchoolAPI, Grade, Learner, Class } from '@/lib/api/school-api';
import { useSchoolContext } from '@/components/context/SchoolContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SchoolGradesPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { currentSchool } = useSchoolContext();
  const schoolId = currentSchool?.id || currentSchool?._id;

  // --- State Management ---
  const [grades, setGrades] = useState<Grade[]>([]);
  const [allLearners, setAllLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeModalMode, setGradeModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isLearnerModalOpen, setIsLearnerModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null);
  const [activeLearnerId, setActiveLearnerId] = useState<string | null>(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // --- Data Hydration ---
  const fetchData = async () => {
    if (!schoolId) {
      console.warn('⚠️ [SchoolGradesPage] schoolId is missing, skipping hydration');
      return;
    }
    setIsLoading(true);
    try {
      // Single-Fetch Strategy for Learners
      const [gradesData, learnersData] = await Promise.all([
        SchoolAPI.getGrades(schoolId),
        SchoolAPI.getSchoolLearners(schoolId)
      ]);
      setGrades(gradesData);
      setAllLearners(learnersData);
    } catch (error) {
      console.error('Failed to fetch school data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchData();
  }, [schoolId]);

  // --- Actions ---
  const handleAllocateLearner = async (learner: Learner, classId: string) => {
    if (!schoolId) return;
    const targetGradeId = (learner as any).grade_id || (grades.length > 0 ? grades[0].id : '');

    // Optimistic UI Update
    const prevLearners = [...allLearners];
    const prevGrades = [...grades];

    setAllLearners(prev => prev.map(l => l.id === learner.id ? { ...l, class_id: classId } : l));
    setGrades(prev => prev.map(g => {
      if (g.id === targetGradeId) {
        return {
          ...g,
          classes: g.classes?.map(c => c.id === classId ? { ...c, current_learners: (c.current_learners || 0) + 1 } : c)
        };
      }
      return g;
    }));

    try {
      await SchoolAPI.moveLearner(learner.id, {
        target_class_id: classId,
        school_id: schoolId,
        grade_id: targetGradeId
      });
      toast.success(`${learner.name} allocated successfully!`);
      setRefreshSidebar(prev => prev + 1);
    } catch (error) {
      setAllLearners(prevLearners);
      setGrades(prevGrades);
      toast.error('Failed to allocate learner');
    }
  };

  const handleBulkUploadSuccess = () => {
    toast.success('Learners imported successfully');
    fetchData();
  };

  const handleEditGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setGradeModalMode('edit');
    setIsGradeModalOpen(true);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) return;

    if (!confirm(`Are you sure you want to delete ${grade.name}? This will also delete all associated classes.`)) return;

    try {
      await SchoolAPI.deleteGrade(gradeId);
      toast.success('Grade deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete grade');
    }
  };

  const handleMoveLearner = async (data: { learner_id: string; target_class_id: string }) => {
    if (!schoolId || !activeGradeId) return;

    try {
      await SchoolAPI.moveLearner(data.learner_id, {
        target_class_id: data.target_class_id,
        school_id: schoolId,
        grade_id: activeGradeId
      });
      toast.success('Learner moved successfully');
      fetchData(); // Refresh all data to reflect changes
    } catch (error) {
      console.error('Failed to move learner:', error);
      toast.error('Failed to move learner');
    }
  };

  // --- Metrics ---
  const totalGrades = grades.length;
  const totalClasses = grades.reduce((acc, g) => acc + (g.total_classes || 0), 0);
  const unassignedCount = allLearners.filter(l => !(l as any).class_id).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50/50">
      {/* Left Main Content - 8 Cols Equivalent */}
      <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-school-primary rounded-full"></div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">School Hierarchy</h2>
            </div>
            <p className="text-slate-500 font-medium">
              Manage grades, class streams, and student allocations for <span className="text-slate-900 font-bold">{currentSchool?.name}</span>.
            </p>
          </div>

          <button
            onClick={() => setIsGradeModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-school-primary text-white text-sm font-black rounded-2xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Grade Level
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <GraduationCap className="w-24 h-24 rotate-12" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Grades</p>
            <h4 className="text-3xl font-black text-slate-900">{isLoading ? '...' : totalGrades}</h4>
            <p className="text-xs text-slate-500 font-medium mt-2">Active academic levels</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Classes</p>
            <h4 className="text-3xl font-black text-slate-900">{isLoading ? '...' : totalClasses}</h4>
            <p className="text-xs text-slate-500 font-medium mt-2">Streams across all grades</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Learners</p>
            <h4 className="text-3xl font-black text-slate-900">{isLoading ? '...' : allLearners.length}</h4>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {allLearners.length - unassignedCount} Assigned
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                {unassignedCount} Unassigned
              </span>
            </div>
          </div>
        </div>

        {/* Grades List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800">Grades & Streams</h3>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hierarchy..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none"
              />
            </div>
          </div>

          {isLoading ? (
             <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                <div className="w-8 h-8 border-4 border-school-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold tracking-tight">Hydrating Academic Schemas...</p>
             </div>
          ) : (
            <div className="space-y-4">
              {grades.map(grade => (
                <GradeCard
                  key={grade.id}
                  grade={grade}
                  schoolId={schoolId!}
                  learners={allLearners.filter(l => (l as any).grade_id === grade.id || (l as any).gradeId === grade.id)}
                  onAllocateLearner={handleAllocateLearner}
                  onClassUpdated={() => fetchData()}
                  onEditGrade={handleEditGrade}
                  onDeleteGrade={handleDeleteGrade}
                  onAssignTeacher={(classId) => {
                    setActiveClassId(classId);
                    setIsTeacherModalOpen(true);
                  }}
                  onMoveLearner={(classId, learnerId) => {
                    setActiveGradeId(grade.id);
                    setActiveClassId(classId);
                    setActiveLearnerId(learnerId || null);
                    setIsLearnerModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - 4 Cols Equivalent */}
      <LearnersSidebar
        schoolId={schoolId!}
        grades={grades}
        onImportClick={() => setIsBulkUploadOpen(true)}
        refreshTrigger={refreshSidebar}
      />

      {/* Modals */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      <TeacherAssignmentModal
        isOpen={isTeacherModalOpen}
        schoolId={schoolId!}
        onClose={() => setIsTeacherModalOpen(false)}
        onAssign={() => fetchData()}
      />

      <LearnerTransitionModal
        isOpen={isLearnerModalOpen}
        schoolId={schoolId!}
        gradeId={activeGradeId!}
        classId={activeClassId!}
        initialLearnerId={activeLearnerId}
        onClose={() => setIsLearnerModalOpen(false)}
        onTransition={handleMoveLearner}
      />

      <GradeModal
        isOpen={isGradeModalOpen}
        mode={gradeModalMode}
        grade={selectedGrade}
        schoolId={schoolId!}
        onClose={() => {
          setIsGradeModalOpen(false);
          setSelectedGrade(null);
        }}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
