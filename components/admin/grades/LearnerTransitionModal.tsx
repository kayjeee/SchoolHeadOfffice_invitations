import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, MoveRight, CheckCircle2, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SchoolAPI, Learner, Class } from '@/lib/api/school-api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearnerTransitionModalProps {
  isOpen: boolean;
  schoolId: string;
  gradeId: string;
  classId: string;
  onClose: () => void;
  onTransition: (data: any) => void;
}

export function LearnerTransitionModal({ isOpen, schoolId, gradeId, classId, onClose, onTransition }: LearnerTransitionModalProps) {
  const [targetClass, setTargetClass] = React.useState('');
  const [learners, setLearners] = React.useState<Learner[]>([]);
  const [selectedLearner, setSelectedLearner] = React.useState('');
  const [targetClasses, setTargetClasses] = React.useState<Class[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && gradeId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // In Phase 1, we can get learners for the grade or the specific class
          // If classId is provided, we fetch learners for that class (to move them OUT)
          const learnerData = await SchoolAPI.getGradeLearners(gradeId);
          setLearners(learnerData);

          // Also fetch available classes in the grade to move them TO
          const classesData = await SchoolAPI.getClasses(gradeId);
          setTargetClasses(classesData.filter(c => c.id !== classId));
        } catch (error) {
          console.error('Failed to fetch transition data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, gradeId, classId]);

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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                Select Learner to Move
              </label>
              <div className="relative">
                <select
                  value={selectedLearner}
                  onChange={(e) => setSelectedLearner(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 transition-all outline-none font-bold text-slate-700 disabled:opacity-50 appearance-none"
                >
                  <option value="">{isLoading ? 'Loading learners...' : 'Select learner...'}</option>
                  {learners.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                {isLoading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-school-primary animate-spin" />
                )}
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
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                disabled={isLoading || targetClasses.length === 0}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 transition-all outline-none font-bold text-slate-700 disabled:opacity-50"
              >
                <option value="">{targetClasses.length === 0 && !isLoading ? 'No other classes available' : 'Select target class...'}</option>
                {targetClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
              onClick={() => { onTransition({ learner_id: selectedLearner, target_class_id: targetClass }); onClose(); }}
              disabled={!targetClass || !selectedLearner}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
