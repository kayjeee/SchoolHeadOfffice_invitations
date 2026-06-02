import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, MoveRight, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearnerTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransition: (data: any) => void;
}

export function LearnerTransitionModal({ isOpen, onClose, onTransition }: LearnerTransitionModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                  Learner Transition
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium">
                  Move individual students between class structures.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Learner</p>
                <p className="text-sm font-black text-slate-900">Johannes Van Wyk</p>
              </div>
              <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                Grade 9A
              </div>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MoveRight className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                Target Destination Class
              </label>
              <select className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 transition-all outline-none font-bold text-slate-700">
                <option value="">Select target class...</option>
                <option value="9B">Grade 9B</option>
                <option value="9C">Grade 9C</option>
                <option value="9D">Grade 9D</option>
              </select>
              <p className="text-[10px] text-slate-400 font-medium px-1">
                Note: This will update all academic records and timetable associations.
              </p>
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
              onClick={() => { onTransition({}); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Execute Move
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
