'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MessagingSection from '@/components/teacher/messaging/MessagingSection';
import { useSchool } from '@/lib/hooks/useSchool';
import { useApi } from '@/lib/hooks/useApi';
import { useSchoolContext } from '@/components/context/SchoolContext';
import { PageHeader } from '@/components/admin/common/DashboardUI';
import { MessagingAPI, Conversation } from '@/lib/api/messaging-api';
import { SchoolAPI, Term, Grade } from '@/lib/api/school-api';
import { MessageSquare, Plus, Bell, Settings, History, Filter, Users, Calendar, ArrowRight, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunicationsPageProps {
  params: Promise<{ schoolSlug: string }>;
}

export default function CommunicationsPage({ params }: CommunicationsPageProps) {
  const { schoolSlug } = React.use(params);
  const { schoolId, schoolData, isLoading: schoolLoading } = useSchool(schoolSlug);
  const { user, isLoading: authLoading } = useApi({ skipToken: true });
  const { selectedAcademicYear } = useSchoolContext();
  const searchParams = useSearchParams();

  const queryConvId = searchParams?.get('conversationId');
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(queryConvId);

  // History Filters
  const [filterYear, setFilterYear] = useState<string>(selectedAcademicYear || new Date().getFullYear().toString());
  const [filterTermId, setFilterTermId] = useState<string>('all');
  const [filterGradeId, setFilterGradeId] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const [terms, setTerms] = useState<Term[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [historyConversations, setHistoryConversations] = useState<Conversation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Prefer Auth0 sub, fallback to dev mock if not logged in
  const currentUserId = user?.sub || "admin-123";

  useEffect(() => {
    if (queryConvId) {
      setSelectedConvId(queryConvId);
      setActiveTab('live');
    }
  }, [queryConvId]);

  useEffect(() => {
    if (schoolId) {
      SchoolAPI.getTerms(schoolId).then(setTerms).catch(console.error);
      SchoolAPI.getGrades(schoolId).then(setGrades).catch(console.error);
    }
  }, [schoolId]);

  const loadHistory = async () => {
    if (!schoolId) return;
    setIsHistoryLoading(true);
    try {
      const convs = await MessagingAPI.getConversations({
        school_id: schoolId,
        academic_year: filterYear,
        term_id: filterTermId !== 'all' ? filterTermId : undefined,
        grade_id: filterGradeId !== 'all' ? filterGradeId : undefined,
      });
      // Group or scoped conversations
      setHistoryConversations(convs);
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && schoolId) {
      loadHistory();
    }
  }, [activeTab, schoolId, filterYear, filterTermId, filterGradeId]);

  if (schoolLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="w-8 h-8 border-4 border-school-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Communications Hub"
        description="Connect with parents, teachers, and staff in real-time. Enterprise WhatsApp for schools."
        icon={MessageSquare}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              <Plus className="w-4 h-4" />
              <span>New Broadcast</span>
            </button>
          </div>
        }
      />

      {/* Main Mode Toggle: Live Messaging vs Conversation History */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-px">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('live')}
            className={cn(
              "flex items-center gap-2 pb-3.5 px-2 text-sm font-bold border-b-2 transition-all",
              activeTab === 'live'
                ? "border-school-primary text-school-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Workspace</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-2 pb-3.5 px-2 text-sm font-bold border-b-2 transition-all",
              activeTab === 'history'
                ? "border-school-primary text-school-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <History className="w-4 h-4" />
            <span>Conversation History & Audits</span>
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="space-y-6">
          {/* History Filter Toolbar */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Filter className="w-4 h-4 text-school-primary" />
              <span>Filter Group Conversations & Historical Threads</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Academic Year</label>
                <input
                  type="text"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-school-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Term</label>
                <select
                  value={filterTermId}
                  onChange={(e) => setFilterTermId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-school-primary/20"
                >
                  <option value="all">All Terms</option>
                  {terms.map(t => (
                    <option key={t.id} value={t.id}>{t.name || `Term ${t.term_number}`} ({t.academic_year})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Grade / Scope</label>
                <select
                  value={filterGradeId}
                  onChange={(e) => setFilterGradeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-school-primary/20"
                >
                  <option value="all">All Grades / Scopes</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Search Query</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Search thread titles..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-school-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {isHistoryLoading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Fetching conversation archives...</span>
              </div>
            ) : historyConversations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <History className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No Group Conversations Found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters above or start a new group broadcast.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {historyConversations
                  .filter(c => !historySearchQuery || (c.title || '').toLowerCase().includes(historySearchQuery.toLowerCase()))
                  .map(conv => (
                    <div
                      key={conv.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setActiveTab('live');
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-school-primary/10 border border-school-primary/20 flex items-center justify-center text-school-primary">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{conv.title || 'Group Conversation'}</h4>
                            {conv.scope_type && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 uppercase border border-slate-200">
                                {conv.scope_type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-3">
                            <span>{conv.participants.length} Participants</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Updated {new Date(conv.updated_at).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl group-hover:bg-school-primary transition-all shadow-sm">
                        <span>Open Thread</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 min-h-[700px] flex flex-col">
          <div className="flex-1">
            <MessagingSection
              currentUserId={currentUserId}
              schoolId={schoolId || ''}
              godMode={true}
              skipToken={true}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-lg mb-1">98% Open Rate</h4>
          <p className="text-white/60 text-sm">WhatsApp messages have a significantly higher engagement than email.</p>
        </div>
        <div className="p-6 bg-emerald-600 rounded-[2rem] text-white">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-bold text-lg mb-1">Instant Delivery</h4>
          <p className="text-white/60 text-sm">Send urgent school alerts and newsletters directly to parents phones.</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-[2rem]">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Settings className="w-5 h-5 text-slate-600" />
          </div>
          <h4 className="font-bold text-lg mb-1 text-slate-900">Safe & Secure</h4>
          <p className="text-slate-500 text-sm">End-to-end encrypted messaging with full school audit logs.</p>
        </div>
      </div>
    </div>
  );
}
