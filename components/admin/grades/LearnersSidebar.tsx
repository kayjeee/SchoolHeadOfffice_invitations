'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  X,
  Loader2,
  UserPlus,
  MoreVertical,
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  learners?: Learner[];
  onImportClick: () => void;
  onViewMasterRoster?: () => void;
  refreshTrigger?: number;
}

export function LearnersSidebar({
  schoolId,
  grades,
  learners: initialLearners,
  onImportClick,
  onViewMasterRoster,
  refreshTrigger = 0
}: LearnersSidebarProps) {
  const [learners, setLearners] = useState<Learner[]>(initialLearners || []);
  const [searchResults, setSearchResults] = useState<Learner[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'unassigned' | 'all'>('unassigned');

  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 100;

  // 1. Debounce Search Query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Fetch Initial School-Wide Learners
  const fetchLearners = async (targetPage: number = page) => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const data = await SchoolAPI.getSchoolLearners(schoolId, targetPage, perPage);
      setLearners(data.learners);
      setTotal(data.total || data.learners.length);
    } catch (error) {
      console.error('Failed to fetch learners:', error);
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If search is active, we don't fetch regular paginated list
    if (debouncedQuery.trim()) return;

    fetchLearners(page);
  }, [schoolId, refreshTrigger, page, debouncedQuery]);

  // 3. Server-Side Search Logic (Dual-Mode Fallback)
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults(null);
        return;
      }

      // If we have a local cache and the query matches local records,SearchResults stay null
      // and we use the Client-Side filter below.
      // However, if local list is empty OR query is specific, we hit the server.
      if (learners.length === 0 || debouncedQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await SchoolAPI.searchLearners(schoolId, debouncedQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      }
    };

    performSearch();
  }, [debouncedQuery, schoolId, learners.length]);

  // 4. Combined Filtering (Local vs Server)
  const currentPool = searchResults !== null ? searchResults : learners;

  const filteredLearners = currentPool.filter(learner => {
    // Basic search filtering (only needed for local pool)
    const name = `${learner.name}`.toLowerCase();
    const id = `${learner.admission_number || learner.id}`.toLowerCase();
    const matchesSearch = searchResults !== null ? true : (name.includes(searchQuery.toLowerCase()) || id.includes(searchQuery.toLowerCase()));

    const classId = (learner as any).class_id || (learner as any).classId;
    const gradeId = (learner as any).grade_id || (learner as any).gradeId;

    const isAssigned = !!classId;
    const matchesTab = activeTab === 'all' ? true : !isAssigned;
    const matchesGrade = selectedGradeId === 'all' || gradeId === selectedGradeId;

    return matchesSearch && matchesTab && matchesGrade;
  });

  const handleDragStart = (e: React.DragEvent, learner: Learner) => {
    e.dataTransfer.setData('learner', JSON.stringify(learner));
    e.dataTransfer.effectAllowed = 'move';
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'linked' || s === 'accepted') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" /> Accepted
        </span>
      );
    }
    if (s === 'pending' || s === 'sent') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
        <XCircle className="w-3 h-3" /> No Parent
      </span>
    );
  };

  return (
    <div className="w-full lg:w-96 h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Learners</h3>
            <p className="text-xs font-medium text-slate-400">Allocate students to classes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onViewMasterRoster}
              className="flex items-center justify-center p-2 bg-slate-50 text-slate-600 hover:text-school-primary rounded-xl border border-slate-200 hover:border-school-primary transition-all shadow-sm"
              title="View Master Roster"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={onImportClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm"
              title="Bulk Import Learners"
            >
              <Download className="w-3.5 h-3.5" />
              Import
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-school-primary/20 transition-all outline-none text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border-none rounded-2xl text-[11px] font-bold appearance-none outline-none focus:ring-2 focus:ring-school-primary/20"
              >
                <option value="all">Filter by Grade</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>{grade.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-50 mx-6 mt-6 rounded-2xl border border-slate-100">
        <button
          onClick={() => setActiveTab('unassigned')}
          className={cn(
            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'unassigned' ? "bg-white text-school-primary shadow-md" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Unassigned ({learners.filter(l => !((l as any).class_id || (l as any).classId)).length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === 'all' ? "bg-white text-school-primary shadow-md" : "text-slate-400 hover:text-slate-600"
          )}
        >
          All Learners ({learners.length})
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence mode="popLayout">
          {isLoading || isSearching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          ) : filteredLearners.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Users className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm font-black text-slate-900 mb-1">No learners found</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                No matches for <span className="text-school-primary">&quot;{searchQuery}&quot;</span>. Try refining your spelling or accession number.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredLearners.map((learner) => (
                <motion.div
                  key={learner.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  draggable={!((learner as any).class_id || (learner as any).classId)}
                  onDragStart={(e) => handleDragStart(e, learner)}
                  className={cn(
                    "p-4 rounded-2xl border border-slate-100 bg-white transition-all cursor-grab active:cursor-grabbing group shadow-sm",
                    !((learner as any).class_id || (learner as any).classId) ? "hover:border-school-primary hover:shadow-lg" : "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-100">
                        {learner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-school-primary transition-colors">
                          {learner.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400">
                           {learner.admission_number || `ID: ${learner.id.slice(-6)}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {grades.find(g => g.id === ((learner as any).grade_id || (learner as any).gradeId))?.name?.split(' ')[1] || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {getStatusBadge(learner.status || '')}
                    {((learner as any).class_id || (learner as any).classId) && (
                       <p className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                         Class {(learner as any).class_name || (learner as any).className || 'Assigned'}
                       </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      {!debouncedQuery.trim() && total > perPage && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-900">
              Page {page} of {Math.ceil(total / perPage)}
            </p>
            <p className="text-[9px] font-bold text-slate-400">
              Showing {Math.min(page * perPage, total)} of {total}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-50 hover:border-school-primary hover:text-school-primary transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page * perPage >= total || isLoading}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-50 hover:border-school-primary hover:text-school-primary transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
