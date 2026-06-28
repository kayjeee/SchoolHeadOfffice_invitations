'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Download,
  Upload,
  UserPlus,
  ArrowUpRight,
  GraduationCap,
  ClipboardList,
  Calendar,
  BookOpen,
  PieChart,
  ChevronRight,
  ChevronLeft,
  SearchX,
  Loader2,
  Mail,
  Phone,
  LayoutGrid,
  List,
  AlertCircle,
  TrendingUp,
  Eye,
  Edit2,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SchoolAPI, Grade, Learner } from '@/lib/api/school-api';
import { apiClient } from '@/lib/api/api-client';
import { useSchoolContext } from '@/components/context/SchoolContext';
import { z } from 'zod';

/**
 * Utility: Standard Tailwind merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Guardrail 2: Full Name Representation Mismatch
 */
const getLearnerFullName = (learner: any): string => {
  if (learner?.full_name) return learner.full_name;
  if (learner?.fullName) return learner.fullName;
  const fName = learner?.firstName || learner?.first_name || '';
  const lName = learner?.lastName || learner?.last_name || '';
  return `${fName} ${lName}`.trim() || 'Unnamed Learner';
};

export default function LearnerDirectoryPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  // Guardrail 3: Resolve slug into MongoDB ObjectId
  const { schoolSlug } = use(params);
  const { currentSchool } = useSchoolContext();
  const schoolId = currentSchool?.id || currentSchool?._id;

  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'directory' | 'management' | 'academic'>('directory');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 100;

  // Mock Modal State for Enrollment
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

  // --- Data Fetching ---
  const fetchData = async (targetPage: number = page) => {
    if (!schoolId) {
      console.log('⏳ [LearnerDirectory] Waiting for schoolId resolution...');
      return;
    }

    console.log(`🚀 [LearnerDirectory] Hydrating directory for school: ${schoolId} (Page ${targetPage})`);
    setIsLoading(true);

    try {
      // Using school-scoped route as per routes.rb: /api/v1/schools/:school_id/learners
      const [learnersResponse, gradesData, stats] = await Promise.all([
        SchoolAPI.getSchoolLearners(schoolId, targetPage, perPage),
        SchoolAPI.getGrades(schoolId),
        SchoolAPI.getLearnerStatistics(schoolId)
      ]);

      console.log(`✅ [LearnerDirectory] Received ${learnersResponse.learners.length} learners. Total: ${learnersResponse.total}`);

      setLearners(learnersResponse.learners);
      setTotal(learnersResponse.total || learnersResponse.learners.length);
      setGrades(gradesData);
      setStatsData(stats);
    } catch (error: any) {
      console.error('❌ [LearnerDirectory] Critical Hydration Error:', error);
      // Guardrail 4: Resilient Payload Parsing (Capture HTML dumps in ApiClient)
      toast.error(error.message || 'Failed to load learner directory. Check console for server logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [schoolId, page]);

  // --- Filtered Data ---
  const filteredLearners = useMemo(() => {
    return learners.filter(learner => {
      const nameMatch = getLearnerFullName(learner).toLowerCase().includes(searchQuery.toLowerCase());
      const admissionMatch = (learner.admission_number || learner.accession_number || (learner as any).accessionNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Guardrail 1: gradeId Naming Trap
      const currentGradeId = learner.gradeId || (learner as any).grade_id;
      const gradeMatch = filterGrade === 'all' || currentGradeId === filterGrade;

      return (nameMatch || admissionMatch) && gradeMatch;
    });
  }, [learners, searchQuery, filterGrade]);

  // --- Stats ---
  const stats = useMemo(() => {
    if (statsData) {
      return {
        total: statsData.total || total,
        active: statsData.by_status?.['active'] || statsData.by_status?.['Linked'] || 0,
        unassigned: learners.filter(l => !((l as any).class_id || (l as any).classId)).length, // Approximate if not global
      };
    }
    return {
      total: total,
      active: learners.filter(l => l.status === 'active' || l.status === 'Linked').length,
      unassigned: learners.filter(l => !((l as any).class_id || (l as any).classId)).length,
    };
  }, [learners, total, statsData]);

  // --- Phase 2 Actions ---
  const handleImportData = async () => {
    console.log('📂 [Action] Triggering Bulk Excel Import');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsProcessing('import');
      toast.loading(`Processing ${file.name}...`, { id: 'import-toast' });

      try {
        // Target: POST /api/v1/import_export/import_learners
        const formData = new FormData();
        formData.append('file', file);
        formData.append('school_id', schoolId!);

        await apiClient.post('/api/v1/import_export/import_learners', formData, z.any(), {
          headers: { 'Content-Type': 'multipart/form-data' } as any
        });

        toast.success('Learners imported successfully!', { id: 'import-toast' });
        // Refresh directory
        fetchData();
      } catch (error: any) {
        toast.error(`Import failed: ${error.message}`, { id: 'import-toast' });
      } finally {
        setIsProcessing(null);
      }
    };
    input.click();
  };

  const handleStartEnrollment = () => {
    console.log('👤 [Action] Opening Enrollment Flow');
    setIsEnrollmentOpen(true);
  };

  const handlePromotion = async (learnerId?: string) => {
    console.log(`📈 [Action] Triggering Promotion System ${learnerId ? `for ${learnerId}` : '(Global)'}`);
    if (learnerId) {
      setIsProcessing(`promote-${learnerId}`);
      try {
        // Target: PATCH /api/v1/learners/:id/graduate
        await apiClient.patch(`/api/v1/learners/${learnerId}/graduate`, {}, z.any());
        toast.success('Learner promoted/graduated!');
        fetchData();
      } catch (error: any) {
        toast.error(`Promotion failed: ${error.message}`);
      } finally {
        setIsProcessing(null);
      }
    } else {
      toast('Global promotion system engaged. Targeting term-end bulk transitions.', { icon: '🎓' });
    }
  };

  const handleViewMetrics = async () => {
    console.log('📊 [Action] Fetching Academic Metrics');
    setIsProcessing('metrics');
    try {
      // Target: GET /api/v1/dashboard/grade_statistics
      toast.loading('Synthesizing grade statistics...', { id: 'metrics-toast' });
      await apiClient.get('/api/v1/dashboard/grade_statistics', z.any());
      toast.success('Metrics updated.', { id: 'metrics-toast' });
    } catch (error: any) {
      toast.dismiss('metrics-toast');
      setActiveTab('academic');
      console.warn('Dashboard stats route pending. Redirecting to Academic View.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header & Main Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-school-primary rounded-full"></div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Learner Directory</h2>
          </div>
          <p className="text-slate-500 font-medium">
            Central repository for student records at <span className="text-slate-900 font-bold">{currentSchool?.schoolName || 'your school'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleStartEnrollment}
            className="flex items-center gap-2 px-6 py-2.5 bg-school-primary text-white text-sm font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-lg shadow-school-primary/20"
          >
            <UserPlus className="w-4 h-4" />
            Enroll New Learner
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Enrolled', value: stats.total, sub: 'Registered Students', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Learners', value: stats.active, sub: 'Currently Attending', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Unassigned', value: stats.unassigned, sub: 'Needs Class Allocation', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
            </div>
            <h4 className="text-3xl font-black text-slate-900">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-200" /> : stat.value}</h4>
            <p className="text-sm font-bold text-slate-500 mt-1">{stat.label}</p>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon className="w-24 h-24 rotate-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-px">
        <div className="flex gap-8">
          {[
            { id: 'directory', label: 'Directory', icon: Users },
            { id: 'management', label: 'Management Hub', icon: LayoutGrid },
            { id: 'academic', label: 'Academic Modules', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                console.log(`📑 [TabSwitch] Navigating to: ${tab.id}`);
                setActiveTab(tab.id as any);
              }}
              className={cn(
                "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative",
                activeTab === tab.id ? "text-school-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-school-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'directory' && (
          <div className="flex p-1 bg-slate-100 rounded-lg mb-4 sm:mb-0">
            <button
              onClick={() => setViewMode('table')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'table' ? "bg-white shadow-sm text-school-primary" : "text-slate-400")}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-school-primary" : "text-slate-400")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or admission number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none text-slate-900"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none appearance-none text-slate-900 min-w-[160px]"
                    >
                      <option value="all">All Grades</option>
                      {grades.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Display */}
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-school-primary mb-4" />
                  <p className="font-bold tracking-tight">Syncing Learner Records...</p>
                </div>
              ) : filteredLearners.length > 0 ? (
                <>
                {viewMode === 'table' ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission #</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade / Class</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredLearners.map((learner) => {
                            const fullName = getLearnerFullName(learner);
                            const grade = grades.find(g => g.id === (learner.gradeId || (learner as any).grade_id));
                            const className = learner.className || (learner as any).class_name || 'Unallocated';

                            return (
                              <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-sm">
                                      {fullName[0]}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{fullName}</p>
                                      <p className="text-xs text-slate-500">{learner.gender_text || learner.gender || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                                  {learner.admission_number || learner.accession_number || (learner as any).accessionNumber || '---'}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 text-sm">{grade?.name || '---'}</span>
                                    <span className="text-[10px] font-black text-school-primary uppercase tracking-wider">{className}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <Phone className="w-3 h-3" />
                                      {learner.parent_phone || '---'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                      <Mail className="w-3 h-3" />
                                      {learner.email || '---'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                    learner.status === 'Linked' || learner.status === 'active'
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : learner.status === 'graduated'
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : "bg-slate-50 text-slate-500 border-slate-100"
                                  )}>
                                    {learner.status || 'inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-slate-400 hover:text-school-primary hover:bg-slate-50 rounded-lg transition-all" title="View Profile">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handlePromotion(learner.id)}
                                      disabled={isProcessing === `promote-${learner.id}`}
                                      className="p-2 text-slate-400 hover:text-school-primary hover:bg-slate-50 rounded-lg transition-all"
                                      title="Promote Learner"
                                    >
                                      {isProcessing === `promote-${learner.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-school-primary hover:bg-slate-50 rounded-lg transition-all">
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLearners.map((learner) => {
                      const fullName = getLearnerFullName(learner);
                      const grade = grades.find(g => g.id === (learner.gradeId || (learner as any).grade_id));
                      return (
                        <div key={learner.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-school-primary/30 transition-all group relative overflow-hidden">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-lg">
                              {fullName[0]}
                            </div>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                              learner.status === 'Linked' || learner.status === 'active'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-slate-50 text-slate-500 border-slate-100"
                            )}>
                              {learner.status || 'inactive'}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 mb-1 truncate">{fullName}</h5>
                          <p className="text-xs font-black text-school-primary uppercase tracking-wider mb-4">
                            {grade?.name || 'No Grade'} • {learner.className || (learner as any).class_name || 'Unallocated'}
                          </p>
                          <div className="space-y-2 pt-4 border-t border-slate-50">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-bold uppercase">Admission</span>
                              <span className="text-slate-900 font-mono font-bold">{learner.admission_number || learner.accession_number || (learner as any).accessionNumber || '---'}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-bold uppercase">Contact</span>
                              <span className="text-slate-900 font-bold">{learner.parent_phone || '---'}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 flex gap-2">
                             <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 rounded-xl transition-all uppercase tracking-widest">
                                Profile
                             </button>
                             <button className="p-2 bg-slate-50 hover:bg-school-primary hover:text-white text-slate-400 rounded-xl transition-all">
                               <ArrowUpRight className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400">
                    Showing <span className="text-slate-900 font-black">{((page - 1) * perPage) + 1}</span> to <span className="text-slate-900 font-black">{Math.min(page * perPage, total)}</span> of <span className="text-slate-900 font-black">{total}</span> learners
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1 || isLoading}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    <div className="hidden md:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(total / perPage)) }, (_, i) => {
                        const pageNum = i + 1;
                        // Simple logic for first 5 pages, can be expanded for ellipsis
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                              page === pageNum
                                ? "bg-school-primary text-white shadow-md shadow-school-primary/20"
                                : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {Math.ceil(total / perPage) > 5 && (
                        <span className="px-2 text-slate-300 font-black text-xs">...</span>
                      )}
                    </div>

                    <button
                      disabled={page * perPage >= total || isLoading}
                      onClick={() => setPage(p => p + 1)}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                </>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                  <SearchX className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold text-lg text-slate-900">No learners found</p>
                  <p className="text-sm font-medium">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'management' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Bulk Excel Import',
                  desc: 'Ingest thousands of learners using our standard template.',
                  icon: Upload,
                  phase: 2,
                  action: 'Import Data',
                  handler: handleImportData,
                  loading: isProcessing === 'import'
                },
                {
                  title: 'Bulk Enrollment',
                  desc: 'Process admissions for multiple students simultaneously.',
                  icon: UserPlus,
                  phase: 2,
                  action: 'Start Enrollment',
                  handler: handleStartEnrollment
                },
                {
                  title: 'Promotion System',
                  desc: 'Transition learners between grades at the end of the term.',
                  icon: TrendingUp,
                  phase: 2,
                  action: 'Manage Promotions',
                  handler: () => handlePromotion()
                },
                {
                  title: 'Capacity Planning',
                  desc: 'Monitor class occupancy and balance student distributions.',
                  icon: PieChart,
                  phase: 2,
                  action: 'View Metrics',
                  handler: handleViewMetrics,
                  loading: isProcessing === 'metrics'
                },
              ].map((card, i) => (
                <ManagementCard key={i} {...card} />
              ))}
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Attendance Tracking', desc: 'Daily registers and automated absence reporting.', icon: Calendar, phase: 3 },
                { title: 'Subject Management', desc: 'Link teachers and learners to specific academic subjects.', icon: BookOpen, phase: 3 },
                { title: 'Timetable Hub', desc: 'Generate and manage class schedules across the school.', icon: ClipboardList, phase: 3 },
                { title: 'Academic Reports', desc: 'Automated report card generation and grade tracking.', icon: PieChart, phase: 3 },
              ].map((card, i) => (
                <ManagementCard key={i} {...card} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enrollment Mock Modal */}
      <AnimatePresence>
        {isEnrollmentOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">New Enrollment</h3>
                <button onClick={() => setIsEnrollmentOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                   <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900" placeholder="e.g. John Smith" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Grade</label>
                     <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900">
                        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admission #</label>
                     <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-school-primary/20 text-slate-900" placeholder="LNR-000" />
                   </div>
                 </div>
                 <button
                  onClick={() => {
                    toast.success('Learner enrollment initialized! (POST /api/v1/learners)');
                    setIsEnrollmentOpen(false);
                  }}
                  className="w-full py-4 bg-school-primary text-white font-black rounded-2xl shadow-lg shadow-school-primary/20 hover:bg-school-primary/90 transition-all uppercase tracking-widest text-xs"
                 >
                   Complete Enrollment
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ManagementCard({ title, desc, icon: Icon, phase, action, handler, loading }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-school-primary/30 transition-all">
      <div className="absolute top-4 right-4">
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase tracking-widest">
          Phase {phase}
        </span>
      </div>

      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-school-primary/10 group-hover:text-school-primary flex items-center justify-center mb-6 transition-all">
        {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Icon className="w-7 h-7" />}
      </div>

      <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 h-10">
        {desc}
      </p>

      {action ? (
        <button
          onClick={handler}
          disabled={loading}
          className="w-full py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : action}
          {!loading && <ChevronRight className="w-3 h-3" />}
        </button>
      ) : (
        <div className="w-full py-3 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl text-center uppercase tracking-widest border border-slate-100">
          Module Locked (Under Dev)
        </div>
      )}
    </div>
  );
}
