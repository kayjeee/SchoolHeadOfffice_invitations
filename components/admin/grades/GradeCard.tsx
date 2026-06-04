'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Users, School } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { ClassModal } from './ClassModal';
import { Grade } from '@/lib/api/school-api';

interface GradeCardProps {
  grade: Grade;
  schoolId: string;
  onEditGrade: (grade: Grade) => void;
  onDeleteGrade: (gradeId: string) => void;
  onClassCreated: () => void;
  onAssignTeacher: (classId: string) => void;
  onMoveLearner: (classId: string) => void;
}

export function GradeCard({
  grade,
  schoolId,
  onEditGrade,
  onDeleteGrade,
  onClassCreated,
  onAssignTeacher,
  onMoveLearner
}: GradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classModalMode, setClassModalMode] = useState<'create' | 'edit'>('create');

  const handleClassSuccess = () => {
    onClassCreated();
    // Refresh expanded view
    setIsExpanded(false);
    setTimeout(() => setIsExpanded(true), 100);
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grade.classes && grade.classes.length > 0 ? (
                    grade.classes.map((cls) => (
                      <ClassCard
                        key={cls.id}
                        cls={{
                          ...cls,
                          learnerCount: cls.current_learners || cls.learnerCount || 0
                        }}
                        schoolId={schoolId}
                        gradeId={grade.id}
                        onEdit={() => handleEditClass(cls)}
                        onAssignTeacher={onAssignTeacher}
                        onMoveLearner={onMoveLearner}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-slate-400">
                      No classes yet. Click "Add Class" to create one.
                    </div>
                  )}
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
