'use client';

import React from 'react';
import { UserPlus, Mail, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { Learner } from '@/lib/api/school-api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UnassignedLearnersPanelProps {
  learners: Learner[];
  onMoveLearner: (learner: Learner) => void;
  isLoading?: boolean;
}

export function UnassignedLearnersPanel({ learners, onMoveLearner, isLoading }: UnassignedLearnersPanelProps) {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" />
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-school-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">No unassigned learners found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Unassigned Learners ({learners.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {learners.map((learner) => (
          <div
            key={learner.id}
            className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-school-primary hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onMoveLearner(learner)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-school-primary/10 group-hover:text-school-primary transition-colors">
                  {learner.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-school-primary transition-colors truncate max-w-[140px]">
                    {learner.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">
                    {learner.admission_number || 'No EMIS'}
                  </p>
                </div>
              </div>
              {getStatusBadge(learner.status || 'pending')}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{learner.parent_name || 'No Parent'}</span>
              </div>
              <div className="p-1 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-school-primary group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
