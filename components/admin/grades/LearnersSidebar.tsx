'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SchoolAPI, Learner, Grade } from '@/lib/api/school-api';
import { toast } from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearnersSidebarProps {
  schoolId: string;
  grades: Grade[];
  onImportClick: () => void;
  onAllocateLearner?: (learner: Learner, classId: string) => void;
  refreshTrigger?: number;
}

export function LearnersSidebar({
  schoolId,
  grades,
  onImportClick,
  onAllocateLearner,
  refreshTrigger = 0
}: LearnersSidebarProps) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>('unassigned');

  const fetchLearners = async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const data = await SchoolAPI.getSchoolLearners(schoolId);
      setLearners(data);
    } catch (error) {
      console.error('Failed to fetch learners:', error);
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, [schoolId, refreshTrigger]);

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (learner.admission_number || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Determine if learner is assigned to a class
    // In our schema, we assume if class_id exists and is not empty, they are assigned
    const isAssigned = !!(learner as any).class_id;
    const matchesTab = activeTab === 'assigned' ? isAssigned : !isAssigned;

    const matchesGrade = selectedGradeId === 'all' || (learner as any).grade_id === selectedGradeId;

    return matchesSearch && matchesTab && matchesGrade;
  });

  const handleDragStart = (e: React.DragEvent, learner: Learner) => {
    e.dataTransfer.setData('learner', JSON.stringify(learner));
    e.dataTransfer.effectAllowed = 'move';
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'linked':
      case 'accepted':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" />
            Accepted
          </span>
        );
      case 'pending':
      case 'sent':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'unlinked':
      case 'declined':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
            <XCircle className="w-3 h-3" />
            No Parent
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="w-full lg:w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-xl">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-school-primary/10 rounded-lg text-school-primary">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">Learners</h3>
          </div>
          <button
            onClick={onImportClick}
            className="p-2 text-school-primary hover:bg-school-primary/10 rounded-xl transition-all group relative"
            title="Import Learners"
          >
            <UserPlus className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-school-primary/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-xl text-[11px] font-bold appearance-none outline-none focus:ring-2 focus:ring-school-primary/20"
              >
                <option value="all">All Grades</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>{grade.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-50 mx-5 mt-4 rounded-xl border border-slate-100">
        <button
          onClick={() => setActiveTab('unassigned')}
          className={cn(
            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
            activeTab === 'unassigned' ? "bg-white text-school-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Unassigned ({learners.filter(l => !(l as any).class_id).length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={cn(
            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
            activeTab === 'assigned' ? "bg-white text-school-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Assigned ({learners.filter(l => !!(l as any).class_id).length})
        </button>
      </div>

      {/* Learners List */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400">No learners found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLearners.map((learner) => (
              <div
                key={learner.id}
                draggable={activeTab === 'unassigned'}
                onDragStart={(e) => handleDragStart(e, learner)}
                className={cn(
                  "p-3 rounded-xl border border-slate-100 bg-white hover:border-school-primary hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
                  activeTab === 'assigned' && "opacity-75 grayscale-[0.5]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {learner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-school-primary transition-colors">
                        {learner.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {learner.admission_number || `ID: ${learner.id.slice(-6)}`}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-slate-300 hover:text-slate-600">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(learner.status)}
                  <span className="text-[10px] font-bold text-slate-400">
                    {grades.find(g => g.id === (learner as any).grade_id)?.name || 'Grade N/A'}
                  </span>
                </div>

                {activeTab === 'assigned' && (learner as any).class_name && (
                  <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-600">
                      Class: {(learner as any).class_name}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
