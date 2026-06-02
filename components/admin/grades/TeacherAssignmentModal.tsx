import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, User, BookOpen, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: any) => void;
}

export function TeacherAssignmentModal({ isOpen, onClose, onAssign }: TeacherAssignmentModalProps) {
  const [role, setRole] = useState<'class' | 'subject'>('class');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-school-primary text-white flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                  Assign Teacher
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium">
                  Configure teaching roles and subject scopes.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                Select Staff Member
              </label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-700">
                <option value="">Choose a teacher...</option>
                <option value="1">Mrs Smith</option>
                <option value="2">Mr Dhlamini</option>
                <option value="3">Ms Peterson</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                Assignment Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('class')}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border-2",
                    role === 'class'
                      ? "bg-school-primary/5 border-school-primary text-school-primary"
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  Class Teacher
                </button>
                <button
                  onClick={() => setRole('subject')}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border-2",
                    role === 'subject'
                      ? "bg-school-primary/5 border-school-primary text-school-primary"
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  Subject Teacher
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                Target Subject Scopes
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mathematics', 'English', 'Physical Science', 'History', 'Life Orientation'].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                      selectedSubjects.includes(subject)
                        ? "bg-school-primary border-school-primary text-white shadow-md shadow-school-primary/20"
                        : "border-slate-200 text-slate-600 hover:border-school-primary hover:text-school-primary"
                    )}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => { onAssign({ role, subjects: selectedSubjects }); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-school-primary text-white font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20"
            >
              <Save className="w-4 h-4" />
              Confirm Assignment
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
