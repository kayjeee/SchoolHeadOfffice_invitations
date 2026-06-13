'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Users, School, Loader2 } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { ClassModal } from './ClassModal';
import { UnassignedLearnersPanel } from './UnassignedLearnersPanel';
import { Grade, Class, SchoolAPI, Learner } from '@/lib/api/school-api';

interface GradeCardProps {
  grade: Grade;
  schoolId: string;
  unassignedLearners?: Learner[];
  onEditGrade: (grade: Grade) => void;
  onDeleteGrade: (gradeId: string) => void;
  onClassUpdated: (gradeId: string, updatedClass: Class) => void;
  onAssignTeacher: (classId: string) => void;
  onMoveLearner: (classId: string) => void;
  onAllocateLearner?: (learner: Learner, classId: string) => void;
}

export function GradeCard({
  grade,
  schoolId,
  unassignedLearners = [],
  onEditGrade,
  onDeleteGrade,
  onClassUpdated,
  onAssignTeacher,
  onMoveLearner,
  onAllocateLearner
}: GradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classModalMode, setClassModalMode] = useState<'create' | 'edit'>('create');
  const [classesList, setClassesList] = useState<Class[]>(grade.classes || []);
  const [gradeMetadata, setGradeMetadata] = useState<Grade | null>(grade);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  useEffect(() => {
    if (grade.classes) {
      setClassesList(grade.classes);
    }
  }, [grade.classes]);

  useEffect(() => {
    const fetchGradeDetails = async () => {
      if (isExpanded && classesList.length === 0 && schoolId) {
        setIsLoadingClasses(true);
        try {
          // Fetch classes directly using the school and grade context
          const classes = await SchoolAPI.getClasses(schoolId, grade.id);
          setClassesList(classes);
        } catch (error) {
          console.error("Failed to fetch classes for grade:", error);
        } finally {
          setIsLoadingClasses(false);
        }
      }
    };
    fetchGradeDetails();
  }, [isExpanded, grade.id, schoolId, classesList.length]);

  const handleClassSuccess = (updatedClass: Class) => {
    setClassesList(prev => {
      const exists = prev.some(c => c.id === updatedClass.id);
      return exists
        ? prev.map(c => c.id === updatedClass.id ? updatedClass : c)
        : [...prev, updatedClass];
    });
    onClassUpdated(grade.id, updatedClass);
  };

  const handleEditClass = (classItem: any) => {
    setSelectedClass(classItem);
    setClassModalMode('edit');
    setIsClassModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Grade Header */}
        <div
          className="p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-black text-slate-900">{grade.name}</h3>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                  Level {grade.level}
                </span>
              </div>

              {grade.description && (
                <p className="text-slate-500 text-sm mb-3">{grade.description}</p>
              )}

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <School className="w-4 h-4" />
                  <span className="text-sm font-medium">{grade.total_classes || grade.classes?.length || 0} Classes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{grade.total_learners || 0} Learners</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEditGrade(grade)}
                className="p-2 text-slate-400 hover:text-school-primary rounded-xl hover:bg-school-primary/10 transition-all"
                title="Edit Grade"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteGrade(grade.id)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"
                title="Delete Grade"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Classes Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-100 bg-slate-50/30"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-700">Classes</h4>
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      setClassModalMode('create');
                      setIsClassModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-school-primary text-white text-sm font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add Class
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Classes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {isLoadingClasses ? (
                    <div className="col-span-2 lg:col-span-3 py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-100">
                      <Loader2 className="w-8 h-8 animate-spin text-school-primary mb-2" />
                      <p className="text-sm font-medium">Loading classes and learners...</p>
                    </div>
                  ) : classesList.length > 0 ? (
                    classesList.map((schoolClass) => (
                      <ClassCard
                        key={schoolClass.id}
                        classData={schoolClass}
                        schoolId={schoolId}
                        gradeId={grade.id}
                        onEdit={() => handleEditClass(schoolClass)}
                        onAssignTeacher={onAssignTeacher}
                        onMoveLearner={onMoveLearner}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 lg:col-span-3 text-center py-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                      No classes found for this grade context. Click "Add Class" to get started.
                    </div>
                  )}
                  </div>

                  {/* Unassigned Learners Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <UnassignedLearnersPanel
                      learners={unassignedLearners}
                      onMoveLearner={(learner) => {
                        // For simplicity, we'll use a selection workflow or the first available class
                        // In a real dragging scenario, this would be the drop target
                        if (classesList.length > 0 && onAllocateLearner) {
                          onAllocateLearner(learner, classesList[0].id);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Class Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        mode={classModalMode}
        classItem={selectedClass}
        gradeId={grade.id}
        schoolId={schoolId}
        onSuccess={handleClassSuccess}
      />
    </>
  );
}
