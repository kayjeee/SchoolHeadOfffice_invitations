'use client';

import React from 'react';
import { Users, User, BookOpen, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClassCardProps {
  cls: {
    id: string;
    name: string;
    learnerCount: number;
    capacity: number;
    classTeacher?: string;
    subjectTeachers?: { name: string; subject: string }[] | Record<string, string>;
    learners?: any[];
  };
  schoolId: string;
  gradeId: string;
  onEdit?: () => void;
  onAssignTeacher?: (classId: string) => void;
  onMoveLearner?: (classId: string) => void;
}

export function ClassCard({ cls, onEdit, onAssignTeacher, onMoveLearner }: ClassCardProps) {
  const occupancyPercentage = (cls.learnerCount / cls.capacity) * 100;
  const isOverCapacity = cls.learnerCount > cls.capacity;
  const isNearCapacity = occupancyPercentage >= 90 && !isOverCapacity;

  // Normalize subject teachers for rendering
  const subjectTeachersArray = Array.isArray(cls.subjectTeachers)
    ? cls.subjectTeachers
    : Object.entries(cls.subjectTeachers || {}).map(([subject, name]) => ({ name: name as string, subject }));

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-emerald-500 transition-colors duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-slate-800 text-lg group-hover:text-school-primary transition-colors">
          Class {cls.name}
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAssignTeacher?.(cls.id)}
            className="p-1.5 text-slate-400 hover:text-school-primary hover:bg-school-primary/10 rounded-lg transition-all"
            title="Assign Teacher"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveLearner?.(cls.id)}
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
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <MoreHorizontal className="w-5 h-5" />
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
              {cls.learnerCount || 0} / {cls.capacity}
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
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Learners & Guarded Parents
            </p>
            {cls.learners && cls.learners.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  {cls.learners.map((learner) => (
                    <li
                      key={learner.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                    >
                      {/* Left Block: Learner Info */}
                      <div className="flex items-center">
                        <span className="font-semibold text-slate-800 text-sm truncate max-w-[120px]" title={learner.name}>
                          {learner.name}
                        </span>
                        <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 shrink-0">
                          {learner.admission_number || "LNR"}
                        </span>
                      </div>

                      {/* Right Block: Linked Parents Section */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {learner.parents && learner.parents.length > 0 ? (
                          learner.parents.map((parent: any) => (
                            <div
                              key={parent.id}
                              title={`Email: ${parent.email || 'N/A'} | Phone: ${parent.phone || 'N/A'}`}
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 group/parent cursor-help"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span className="truncate max-w-[100px]">Parent: {parent.name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold italic text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                            No Parent Linked
                          </span>
                        )}
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
                {cls.classTeacher || 'Not assigned'}
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
