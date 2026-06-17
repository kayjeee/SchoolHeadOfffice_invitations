'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, Search, ChevronRight, Loader2, UserMinus } from 'lucide-react';
import { SchoolAPI, Learner, Class } from '@/lib/api/school-api';
import { toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearnerTransitionModalProps {
  isOpen: boolean;
  schoolId: string;
  gradeId: string;
  classId: string;
  onClose: () => void;
  onTransition: (data: { learner_id: string; target_class_id: string }) => void;
}

export function LearnerTransitionModal({
  isOpen,
  schoolId,
  gradeId,
  classId,
  onClose,
  onTransition
}: LearnerTransitionModalProps) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [targetClassId, setTargetClassId] = useState('');

  useEffect(() => {
    if (isOpen && gradeId && schoolId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [learnersData, classesData] = await Promise.all([
            SchoolAPI.getGradeLearners(schoolId, gradeId),
            SchoolAPI.getClasses(schoolId, gradeId)
          ]);
          setLearners(learnersData);
          setClasses(classesData.filter(c => c.id !== classId));
        } catch (error) {
          console.error('Failed to fetch transition data:', error);
          toast.error('Failed to load learners or classes');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setSelectedLearner(null);
      setTargetClassId('');
      setSearchQuery('');
    }
  }, [isOpen, gradeId, schoolId, classId]);

  const filteredLearners = learners.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransition = () => {
    if (!selectedLearner || !targetClassId) return;
    onTransition({
      learner_id: selectedLearner.id,
      target_class_id: targetClassId
    });
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <UserMinus className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                  Learner Transition
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-medium">
                  Move students between class structures within the same grade.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="flex flex-col md:flex-row h-[500px]">
            {/* Step 1: Select Learner */}
            <div className="w-full md:w-1/2 border-r border-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find learner..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-school-primary transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-school-primary" />
                    <span className="text-xs font-medium">Loading learners...</span>
                  </div>
                ) : filteredLearners.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <span className="text-xs font-medium">No learners found</span>
                  </div>
                ) : (
                  filteredLearners.map((learner) => (
                    <button
                      key={learner.id}
                      onClick={() => setSelectedLearner(learner)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group",
                        selectedLearner?.id === learner.id
                          ? "bg-school-primary text-slate-900 shadow-lg shadow-school-primary/20"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div>
                        <p className={cn("text-sm font-bold", selectedLearner?.id === learner.id ? "text-slate-900" : "text-slate-900")}>
                          {learner.name}
                        </p>
                        <p className={cn("text-[10px]", selectedLearner?.id === learner.id ? "text-slate-800 font-bold" : "text-slate-700 font-bold")}>
                          {learner.status}
                        </p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4", selectedLearner?.id === learner.id ? "text-slate-900" : "text-slate-300")} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Step 2: Select Target Class */}
            <div className="w-full md:w-1/2 flex flex-col bg-slate-50/20">
              {selectedLearner ? (
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Moving</p>
                      <p className="text-lg font-black text-slate-900 leading-tight">{selectedLearner.name}</p>
                    </div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                      Select Target Class
                    </label>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setTargetClassId(cls.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                          targetClassId === cls.id
                            ? "bg-white border-school-primary ring-4 ring-school-primary/5 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div>
                          <p className="font-bold text-slate-900">Class {cls.name}</p>
                          <p className="text-xs text-slate-500">{cls.current_learners} / {cls.capacity} Learners</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          targetClassId === cls.id ? "border-school-primary bg-school-primary" : "border-slate-200"
                        )}>
                          {targetClassId === cls.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                    {classes.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <p className="text-xs font-medium">No other classes available in this grade.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-white border-t border-slate-100">
                    <button
                      onClick={handleTransition}
                      disabled={!targetClassId}
                      className="w-full py-4 bg-school-primary text-slate-900 font-black rounded-2xl shadow-xl shadow-school-primary/20 hover:bg-school-primary/90 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                      Confirm Transition
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-700 mb-1">No Student Selected</h4>
                  <p className="text-sm text-slate-400">Please select a student from the left panel to begin transition.</p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
