'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Users, School, Loader2 } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { ClassModal } from './ClassModal';
import { Grade, Class, SchoolAPI, Learner } from '@/lib/api/school-api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GradeCardProps {
  grade: Grade;
  schoolId: string;
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
  onEditGrade,
  onDeleteGrade,
  onClassUpdated,
  onAssignTeacher,
  onMoveLearner,
  onAllocateLearner
}: GradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'learners' | 'move'>('classes');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classModalMode, setClassModalMode] = useState<'create' | 'edit'>('create');
  const [classesList, setClassesList] = useState<Class[]>(grade.classes || []);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [gradeLearners, setGradeLearners] = useState<Learner[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(false);

  useEffect(() => {
    if (grade.classes) {
      setClassesList(grade.classes);
    }
  }, [grade.classes]);

  useEffect(() => {
    const fetchGradeDetails = async () => {
      if (isExpanded && schoolId) {
        if (activeTab === 'classes' && classesList.length === 0) {
          setIsLoadingClasses(true);
          try {
            const classes = await SchoolAPI.getClasses(schoolId, grade.id);
            setClassesList(classes);
          } catch (error) {
            console.error("Failed to fetch classes:", error);
          } finally {
            setIsLoadingClasses(false);
          }
        } else if (activeTab === 'learners' && gradeLearners.length === 0) {
          setIsLoadingLearners(true);
          try {
            const learners = await SchoolAPI.getGradeLearners(schoolId, grade.id);
            setGradeLearners(learners);
          } catch (error) {
            console.error("Failed to fetch grade learners:", error);
          } finally {
            setIsLoadingLearners(false);
          }
        }
      }
    };
    fetchGradeDetails();
  }, [isExpanded, activeTab, grade.id, schoolId, classesList.length, gradeLearners.length]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <React.Fragment>
      <div
        onDragOver={handleDragOver}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      >
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

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-100 bg-slate-50/30"
            >
              <div className="p-0">
                <div className="flex items-center gap-6 px-6 pt-4 border-b border-slate-100 bg-white">
                  <button
                    onClick={() => setActiveTab('classes')}
                    className={cn(
                      "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'classes' ? "text-school-primary" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Classes
                    {activeTab === 'classes' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-school-primary" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('learners')}
                    className={cn(
                      "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'learners' ? "text-school-primary" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Learners
                    {activeTab === 'learners' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-school-primary" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('move')}
                    className={cn(
                      "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                      activeTab === 'move' ? "text-school-primary" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Move Learner
                    {activeTab === 'move' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-school-primary" />}
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'classes' && (
                    <React.Fragment>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700">Class Streams</h4>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoadingClasses ? (
                          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-school-primary mb-2" />
                            <p className="text-sm font-medium">Hydrating classes...</p>
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
                              onDropLearner={onAllocateLearner}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                            No classes found. Click "Add Class" to get started.
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  )}

                  {activeTab === 'learners' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-700">Enrolled Learners</h4>
                        <p className="text-xs text-slate-500">{gradeLearners.length} Students</p>
                      </div>
                      {isLoadingLearners ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                          <Loader2 className="w-8 h-8 animate-spin text-school-primary mb-2" />
                          <p className="text-sm font-medium">Loading roster...</p>
                        </div>
                      ) : gradeLearners.length > 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                              <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {gradeLearners.map(l => (
                                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900">{l.name}</p>
                                    <p className="text-[10px] text-slate-400">{l.admission_number || 'No ID'}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={cn(
                                      "px-2 py-1 rounded-full text-[10px] font-bold border",
                                      l.status === 'Linked' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                    )}>
                                      {l.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="font-medium text-slate-600">{(l as any).class_name || 'Unassigned'}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      onClick={() => onMoveLearner((l as any).class_id || '')}
                                      className="p-2 text-slate-400 hover:text-school-primary rounded-lg transition-all"
                                    >
                                      <Users className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                          No learners assigned to this grade yet.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'move' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-700">Quick Transition</h4>
                        <p className="text-xs text-slate-500">Shift students between streams</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8" />
                        </div>
                        <h5 className="font-bold text-slate-900 mb-2">Promote or Reassign</h5>
                        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                          Use the move tool to transfer learners to another grade or class for promotion or reassignment.
                        </p>
                        <button
                          onClick={() => onMoveLearner('')}
                          className="px-6 py-2 bg-school-primary text-white font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20"
                        >
                          Launch Transition Tool
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        mode={classModalMode}
        classItem={selectedClass}
        gradeId={grade.id}
        schoolId={schoolId}
        onSuccess={handleClassSuccess}
      />
    </React.Fragment>
  );
}
