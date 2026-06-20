'use client';

import React from 'react';
import { Users, User, BookOpen, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    current_learners?: number;
    learnerCount?: number;
    capacity: number;
    class_teacher_name?: string;
    classTeacher?: string;
    subject_teachers?: { name: string; subject: string }[] | Record<string, string>;
    subjectTeachers?: { name: string; subject: string }[] | Record<string, string>;
    learners?: any[];
  };
  schoolId: string;
  gradeId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignTeacher?: (classId: string) => void;
  onMoveLearner?: (classId: string, learnerId?: string) => void;
}

export function ClassCard({ classData, schoolId, gradeId, onEdit, onDelete, onAssignTeacher, onMoveLearner, onDropLearner }: ClassCardProps & { onDropLearner?: (learner: any, classId: string) => void }) {
  const [isOver, setIsOver] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [learners, setLearners] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const learnerCount = Math.max(classData.current_learners ?? 0, learners.length);
  const classTeacher = classData.class_teacher_name ?? classData.classTeacher;
  const subjectTeachers = classData.subject_teachers ?? classData.subjectTeachers;

  const occupancyPercentage = (learnerCount / classData.capacity) * 100;
  const isOverCapacity = learnerCount > classData.capacity;
  const isNearCapacity = occupancyPercentage >= 90 && !isOverCapacity;

  React.useEffect(() => {
    const fetchLearners = async () => {
      if (isExpanded && learners.length === 0) {
        setIsLoading(true);
        try {
          const data = await SchoolAPI.getClassLearners(schoolId, gradeId, classData.id);
          setLearners(data);
        } catch (error) {
          console.error("Failed to fetch class learners:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchLearners();
  }, [isExpanded, schoolId, gradeId, classData.id, learners.length]);

  // Normalize subject teachers for rendering
  const subjectTeachersArray = Array.isArray(subjectTeachers)
    ? subjectTeachers
    : Object.entries(subjectTeachers || {}).map(([subject, name]) => ({ name: name as string, subject }));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const learnerData = e.dataTransfer.getData('learner');
    if (learnerData && onDropLearner) {
      const learner = JSON.parse(learnerData);
      onDropLearner(learner, classData.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "p-4 bg-white rounded-lg border transition-all duration-200 flex flex-col justify-between group relative",
        isOver ? "border-school-primary border-2 bg-school-primary/5 scale-[1.02] shadow-lg" : "border-slate-200 shadow-sm hover:border-emerald-500"
      )}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-school-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
            DROP TO ALLOCATE
          </div>
        </div>
      )}
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-bold text-slate-800 text-lg group-hover:text-school-primary transition-colors">
          Class {classData.name}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAssignTeacher?.(classData.id)}
            className="p-1.5 text-slate-400 hover:text-school-primary hover:bg-school-primary/10 rounded-lg transition-all"
            title="Assign Teacher"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveLearner?.(classData.id)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            title="Move Learners"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-school-primary hover:bg-school-primary/10 rounded-lg transition-all"
            title="Edit Class"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Class"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Capacity Tracking */}
        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Utilization
            </span>
            <span className="font-medium text-slate-700">
              {learnerCount} / {classData.capacity}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                isOverCapacity ? "bg-red-500" : isNearCapacity ? "bg-amber-500" : "bg-emerald-600"
              )}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
          {isOverCapacity && (
            <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
              ⚠️ Warning: Capacity threshold violated
            </p>
          )}
          {isNearCapacity && !isOverCapacity && (
            <p className="text-[10px] text-amber-500 font-bold mt-1">
              ⚠️ Near capacity: {Math.round(occupancyPercentage)}% full
            </p>
          )}
        </div>

        {/* Nested Learners & Parents Section */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "mt-4 pt-4 border-t border-slate-200 opacity-100 max-h-[500px]" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Learners & Guarded Parents
            </p>
            {isLoading ? (
               <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                 <div className="w-5 h-5 border-2 border-school-primary border-t-transparent rounded-full animate-spin mb-2" />
                 <p className="text-[10px] font-bold tracking-tight">Syncing roster...</p>
               </div>
            ) : learners.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  {learners.map((learner) => (
                    <li
                      key={learner.id}
                      className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                    >
                      {/* Left Block: Learner Info */}
                      <div className="flex items-center min-w-0">
                        <span className="font-semibold text-slate-800 text-sm truncate" title={learner.name}>
                          {learner.name}
                        </span>
                      </div>

                      {/* Action Block */}
                      <div className="flex items-center gap-1 shrink-0">
                         <button
                           onClick={() => onMoveLearner?.(classData.id, learner.id)}
                           className="p-1.5 text-slate-400 hover:text-school-primary rounded-lg transition-all"
                           title="Transition Learner"
                         >
                            <Users className="w-3.5 h-3.5" />
                         </button>
                         <button className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs italic text-slate-400">No learners assigned to this class section yet.</p>
            )}
          </div>
        </div>

        {/* Assignment Blocks */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-school-primary/10 text-school-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Class Teacher</p>
              <p className="text-sm font-bold text-slate-900">
                {classTeacher || 'Not assigned'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1 mb-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Subject Teachers ({subjectTeachersArray.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {subjectTeachersArray.slice(0, 2).map((st, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs">
                  <span className="font-bold text-slate-700">{st.name}</span>
                  <span className="text-slate-400 font-medium">{st.subject}</span>
                </div>
              ))}
              {subjectTeachersArray.length > 2 && (
                <button className="text-[10px] font-bold text-school-primary hover:underline mt-1 px-1">
                  + {subjectTeachersArray.length - 2} more teachers
                </button>
              )}
              {subjectTeachersArray.length === 0 && (
                <p className="text-xs text-slate-400 italic px-3 py-2">No subject teachers assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
