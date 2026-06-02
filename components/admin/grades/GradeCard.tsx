import React, { useState } from 'react';
import {
  Users,
  ChevronDown,
  Plus,
  UserPlus,
  ArrowRight,
  GraduationCap,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassCard } from './ClassCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ClassData {
  id: string;
  name: string;
  learnerCount: number;
  capacity: number;
  classTeacher: string;
  subjectTeachers: { name: string; subject: string }[];
}

interface GradeCardProps {
  grade: {
    id: string;
    name: string;
    learnersCount: number;
    classes: ClassData[];
  };
  onAddClass: (gradeId: string) => void;
  onAddLearner: (gradeId: string) => void;
  onViewDetails: (gradeId: string) => void;
}

export function GradeCard({ grade, onAddClass, onAddLearner, onViewDetails }: GradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div
        className={cn(
          "p-6 cursor-pointer transition-colors",
          isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/50"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
              isExpanded
                ? "bg-school-primary text-white shadow-lg shadow-school-primary/20 scale-110"
                : "bg-slate-100 text-slate-400 group-hover:bg-school-primary/10 group-hover:text-school-primary"
            )}>
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{grade.name}</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                  <Users className="w-4 h-4" />
                  <span>{grade.learnersCount} Learners</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                  <LayoutGrid className="w-4 h-4" />
                  <span>{grade.classes.length} Classes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onAddClass(grade.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-school-primary hover:text-school-primary transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
            <button
              onClick={() => onAddLearner(grade.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-school-primary hover:text-school-primary transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Learner
            </button>
            <button
              onClick={() => onViewDetails(grade.id)}
              className="p-2 text-slate-400 hover:text-school-primary hover:bg-school-primary/10 rounded-xl transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className={cn(
              "ml-2 transition-transform duration-300",
              isExpanded ? "rotate-180" : ""
            )}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {grade.classes.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
