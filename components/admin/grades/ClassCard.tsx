import React from 'react';
import { Users, User, BookOpen, MoreHorizontal } from 'lucide-react';
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
    classTeacher: string;
    subjectTeachers: { name: string; subject: string }[];
  };
}

export function ClassCard({ cls }: ClassCardProps) {
  const occupancyPercentage = (cls.learnerCount / cls.capacity) * 100;
  const isOverCapacity = cls.learnerCount > cls.capacity;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-school-primary transition-all group">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-black text-slate-900 group-hover:text-school-primary transition-colors">
          Class {cls.name}
        </h4>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Capacity Tracking */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Capacity Tracking
            </span>
            <span className={cn(
              "text-xs font-bold",
              isOverCapacity ? "text-red-500" : "text-slate-700"
            )}>
              {cls.learnerCount} / {cls.capacity}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isOverCapacity ? "bg-red-500" : "bg-school-primary"
              )}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
          {isOverCapacity && (
            <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
              ⚠️ Warning: Capacity threshold violated
            </p>
          )}
        </div>

        {/* Assignment Blocks */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-school-primary/10 text-school-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Class Teacher</p>
              <p className="text-sm font-bold text-slate-900">{cls.classTeacher}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1 mb-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Subject Teachers
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {cls.subjectTeachers.slice(0, 2).map((st, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs">
                  <span className="font-bold text-slate-700">{st.name}</span>
                  <span className="text-slate-400 font-medium">{st.subject}</span>
                </div>
              ))}
              {cls.subjectTeachers.length > 2 && (
                <button className="text-[10px] font-bold text-school-primary hover:underline mt-1 px-1">
                  + {cls.subjectTeachers.length - 2} more teachers
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
