'use client';

import React, { use, useState, useEffect } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import { SchoolAPI, Term } from '@/lib/api/school-api';
import { useSchoolContext } from '@/components/context/SchoolContext';
import {
  Building2,
  Mail,
  MapPin,
  Shield,
  Key,
  UserCheck,
  Globe,
  Fingerprint,
  Save,
  RefreshCw,
  ExternalLink,
  School,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Clock
} from 'lucide-react';

export default function AdminSettingsPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, schoolData, isLoading } = useSchool(schoolSlug);

  const displayName = (schoolData?.schoolName || schoolSlug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administrative Settings</h2>
        <p className="text-slate-500 mt-1">Configure your school's identity, academic terms, and security parameters.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Meta & Terms Cards */}
        <div className="xl:col-span-2 space-y-8">

          {/* Terms & Academic Year Section */}
          {schoolId && <TermsConfigSection schoolId={schoolId} />}

          {/* School Meta Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-school-primary/10 rounded-lg text-school-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">School Meta Information</h3>
                  <p className="text-xs text-slate-500">Public profile and contact details</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-school-primary text-white text-sm font-bold rounded-lg hover:bg-school-primary/90 transition-all shadow-md shadow-school-primary/20">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={displayName}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    defaultValue="info@farnorthsecondary.edu.za"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={3}
                    defaultValue="2188, 27 Ukraine Ave, Cosmo City, Johannesburg, 2188"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue="www.farnorthsecondary.co.za"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-school-primary/10 focus:border-school-primary transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School EMIS Number</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={schoolData?.emisNumber || "700400585"}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Profile/Security Details Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Security & Authentication</h3>
                <p className="text-xs text-slate-500">Identity hooks and access control</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 tracking-tight">Internal School ID</p>
                    <p className="text-xs font-mono text-slate-500 select-all">{schoolData?.id || schoolData?._id || "..."}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-200">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rotate Key
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500 rounded-full text-white mt-0.5">
                    <UserCheck className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Identity Verified</p>
                    <p className="text-xs text-emerald-700/80 leading-relaxed">
                      Your administrative credentials have been verified by the District Head Office.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex items-start gap-3">
                  <div className="p-1.5 bg-amber-500 rounded-full text-white mt-0.5">
                    <Shield className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">2FA Active</p>
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                      Multi-factor authentication is required for all administrative access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Status & Flags */}
        <div className="space-y-6">
          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <School className="w-24 h-24" />
            </div>

            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System Status</h4>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Deployment Mode</span>
                <span className="px-2 py-0.5 rounded bg-school-primary text-[10px] font-bold">PRODUCTION</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Branding Engine</span>
                <span className="text-school-primary text-sm font-bold">Dynamic (v2.4)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Last Sync</span>
                <span className="text-white text-sm font-medium italic">2 mins ago</span>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">All Systems Operational</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'View School Website', icon: ExternalLink },
                { label: 'District Admin Panel', icon: ExternalLink },
                { label: 'Audit Log API', icon: Key },
                { label: 'Documentation', icon: Globe },
              ].map((link, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 text-slate-400 group-hover:text-school-primary transition-colors" />
                    <span className="text-sm font-medium text-slate-700">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TermsConfigSection({ schoolId }: { schoolId: string }) {
  const { setCurrentTerm, setTermsList } = useSchoolContext();
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  // Form states
  const currentYearStr = new Date().getFullYear().toString();
  const [academicYear, setAcademicYear] = useState(currentYearStr);
  const [termNumber, setTermNumber] = useState<number>(1);
  const [termName, setTermName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTerms = async () => {
    setIsLoading(true);
    try {
      const [fetchedTerms, currentInfo] = await Promise.all([
        SchoolAPI.getTerms(schoolId),
        SchoolAPI.getCurrentTerm(schoolId)
      ]);
      setTerms(fetchedTerms);
      setTermsList(fetchedTerms);
      setCurrentTerm(currentInfo.current_term);
    } catch (err) {
      console.error("Error loading terms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [schoolId]);

  const openAddModal = () => {
    setEditingTerm(null);
    setAcademicYear(currentYearStr);
    setTermNumber(1);
    setTermName('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (term: Term) => {
    setEditingTerm(term);
    setAcademicYear(term.academic_year || currentYearStr);
    setTermNumber(term.term_number || 1);
    setTermName(term.name || '');
    setStartDate(term.start_date || '');
    setEndDate(term.end_date || '');
    setIsCurrent(Boolean(term.is_current));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      school_id: schoolId,
      academic_year: academicYear,
      term_number: Number(termNumber),
      name: termName.trim() || `Term ${termNumber}`,
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
    };

    try {
      if (editingTerm?.id) {
        await SchoolAPI.updateTerm(editingTerm.id, payload);
      } else {
        await SchoolAPI.createTerm(payload);
      }
      setIsModalOpen(false);
      await loadTerms();
    } catch (err: any) {
      console.error("Term save error:", err);
      const specificError =
        err.details?.message ||
        err.details?.error ||
        (Array.isArray(err.details?.errors) ? err.details.errors.join(', ') : null) ||
        err.message ||
        "Failed to save term";
      setFormError(specificError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this term?")) return;
    setDeletingId(id);
    try {
      await SchoolAPI.deleteTerm(id);
      await loadTerms();
    } catch (err: any) {
      console.error("Delete term error:", err);
      alert(err.details?.message || err.details?.error || err.message || "Failed to delete term");
    } finally {
      setDeletingId(null);
    }
  };

  // Group terms by academic_year
  const termsByYear: Record<string, Term[]> = {};
  terms.forEach(term => {
    const yr = term.academic_year || currentYearStr;
    if (!termsByYear[yr]) termsByYear[yr] = [];
    termsByYear[yr].push(term);
  });

  // Sort years descending
  const sortedYears = Object.keys(termsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Terms & Academic Year</h3>
            <p className="text-xs text-slate-500">Configure school term dates and active academic year periods</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Term
        </button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading school terms...</span>
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No Terms Configured Yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your school's terms for {currentYearStr} to enable term-based filtering across communications, attendance, and reports.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-school-primary text-white text-xs font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Term
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedYears.map(year => (
              <div key={year} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
                    {year} Academic Year
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    ({termsByYear[year].length} {termsByYear[year].length === 1 ? 'term' : 'terms'})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {termsByYear[year]
                    .sort((a, b) => (a.term_number || 0) - (b.term_number || 0))
                    .map(term => (
                      <div
                        key={term.id}
                        className={`p-4 rounded-xl border transition-all relative ${
                          term.is_current
                            ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {term.name || `Term ${term.term_number}`}
                              </h4>
                              {term.is_current && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Current Term
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {term.start_date || 'N/A'} &mdash; {term.end_date || 'N/A'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(term)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Term"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(term.id!)}
                              disabled={deletingId === term.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Term"
                            >
                              {deletingId === term.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Term Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-school-primary/10 rounded-lg text-school-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingTerm ? 'Edit Term' : 'Configure New Term'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{formError}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Term Number *
                  </label>
                  <select
                    required
                    value={termNumber}
                    onChange={(e) => setTermNumber(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary outline-none"
                  >
                    <option value={1}>Term 1</option>
                    <option value={2}>Term 2</option>
                    <option value={3}>Term 3</option>
                    <option value={4}>Term 4</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  placeholder={`Defaults to "Term ${termNumber}"`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4 text-school-primary rounded border-slate-300 focus:ring-school-primary"
                  />
                  <span className="text-xs font-bold text-slate-700">Set as Current Active Term</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-school-primary text-white text-xs font-bold rounded-xl hover:bg-school-primary/90 transition-all shadow-md shadow-school-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Term'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
