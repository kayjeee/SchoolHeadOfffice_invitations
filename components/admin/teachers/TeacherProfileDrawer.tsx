'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Mail, Phone, BookOpen, GraduationCap,
  TrendingUp, Star, Calendar, Clock,
  ChevronRight, ExternalLink, ShieldCheck,
  FileText, User, Award, Briefcase,
  PieChart as PieChartIcon,
  BarChart3, Package, Plus, Loader2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSection } from '@/components/admin/common/DashboardUI';
import { SchoolAPI } from '@/lib/api/school-api';
import { toast } from 'react-hot-toast';

interface TeacherProfileDrawerProps {
  teacher: any;
  schoolId?: string;
  isOpen: boolean;
  onClose: () => void;
  onDataChange?: () => void;
}

export const TeacherProfileDrawer = ({ teacher, schoolId, isOpen, onClose, onDataChange }: TeacherProfileDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Supply Requests' | 'Classes' | 'Performance'>('Overview');

  // Supply Requests State
  const [supplySummary, setSupplySummary] = useState({ requested: 0, approved: 0, fulfilled: 0, total: 0 });
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [isLoadingSupply, setIsLoadingSupply] = useState(false);

  // New Request Form State
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [isSubmitting, setIsProcessing] = useState(false);
  const [newRequest, setNewRequest] = useState({
    item_type: 'paper',
    quantity: 50,
    unit: 'pages',
    reason: ''
  });

  useEffect(() => {
    if (isOpen && teacher && schoolId) {
      loadSupplyData();
    }
  }, [isOpen, teacher, schoolId]);

  const loadSupplyData = async () => {
    if (!schoolId || !teacher?.id) return;
    setIsLoadingSupply(true);
    try {
      const [summary, requests] = await Promise.all([
        SchoolAPI.getSupplySummary(schoolId, teacher.id),
        SchoolAPI.getSupplyRequests(schoolId, teacher.id)
      ]);
      setSupplySummary(summary);
      setSupplyRequests(requests);
    } catch (error) {
      console.error('Failed to load teacher supply requests:', error);
    } finally {
      setIsLoadingSupply(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !teacher?.id) return;
    if (newRequest.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    setIsProcessing(true);
    try {
      await SchoolAPI.createSupplyRequest({
        school_id: schoolId,
        teacher_id: teacher.id,
        item_type: newRequest.item_type,
        quantity: Number(newRequest.quantity),
        unit: newRequest.unit || 'pages',
        reason: newRequest.reason
      });

      toast.success('Supply request logged successfully!');
      setIsLogFormOpen(false);
      setNewRequest({ item_type: 'paper', quantity: 50, unit: 'pages', reason: '' });
      await loadSupplyData();
      if (onDataChange) onDataChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to log supply request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!teacher) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-slate-50 shadow-2xl z-[70] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
              <div className="p-6 flex items-center justify-between">
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                 </button>
                 <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                       Edit Profile
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                       Actions
                    </button>
                 </div>
              </div>

              <div className="px-8 pb-8 flex items-end gap-6">
                 <div className="w-24 h-24 rounded-3xl bg-school-primary/10 border-4 border-white shadow-xl flex items-center justify-center text-school-primary font-black text-3xl">
                    {teacher.avatar || teacher.name.charAt(0)}
                 </div>
                 <div className="mb-2">
                    <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-2xl font-black text-slate-900">{teacher.name}</h2>
                       <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase">{teacher.status || 'Active'}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                       <Briefcase className="w-4 h-4" />
                       {teacher.role} • {teacher.department || 'Faculty'}
                    </p>
                 </div>
              </div>

              <div className="px-8 flex border-t border-slate-100">
                 {(['Overview', 'Supply Requests', 'Classes', 'Performance'] as const).map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                       activeTab === tab ? 'border-school-primary text-school-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                     }`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {activeTab === 'Overview' && (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Students</p>
                        <p className="text-xl font-black text-slate-900">{teacher.student_count || teacher.students || 0}</p>
                     </div>
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Avg Result</p>
                        <p className="text-xl font-black text-emerald-600">{teacher.performance || 'N/A'}</p>
                     </div>
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Paper Requests</p>
                        <p className="text-xl font-black text-slate-900">{supplySummary.total || 0}</p>
                     </div>
                  </div>

                  {/* Bio & Details */}
                  <DashboardSection title="Employment Details" className="bg-white">
                     <div className="grid grid-cols-2 gap-y-6">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                           <p className="text-sm font-bold text-slate-900">{teacher.email || `${teacher.name.toLowerCase().replace(' ', '.')}@school.edu`}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                           <p className="text-sm font-bold text-slate-900">EMP-{teacher.id?.slice(-6) || '2024'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                           <p className="text-sm font-bold text-slate-900">{teacher.status || 'Active'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                           <p className="text-sm font-bold text-slate-900">{teacher.role || 'Faculty Member'}</p>
                        </div>
                     </div>
                  </DashboardSection>

                  {/* Qualifications */}
                  <DashboardSection title="Qualifications & Awards" className="bg-white">
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <div className="p-2 bg-amber-50 rounded-lg">
                              <Award className="w-5 h-5 text-amber-600" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">Certified Educator</p>
                              <p className="text-xs text-slate-500 font-medium">SACE Registered Professional</p>
                           </div>
                        </div>
                     </div>
                  </DashboardSection>
                </>
              )}

              {activeTab === 'Supply Requests' && (
                <div className="space-y-6">
                  {/* Header & Log Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Supply & Paper Requisitions</h3>
                      <p className="text-xs font-semibold text-slate-500">Record and review paper/supply requests logged for {teacher.name}.</p>
                    </div>
                    <button
                      onClick={() => setIsLogFormOpen(!isLogFormOpen)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 transition-all shadow-md uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      Log Request
                    </button>
                  </div>

                  {/* Log Request Collapsible Form */}
                  <AnimatePresence>
                    {isLogFormOpen && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateRequest}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 overflow-hidden"
                      >
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">New Supply Request on behalf of Teacher</h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Item Type</label>
                            <input
                              type="text"
                              value={newRequest.item_type}
                              onChange={(e) => setNewRequest(prev => ({ ...prev, item_type: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                              placeholder="e.g. Paper / Exam Printing"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Quantity</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                required
                                min={1}
                                value={newRequest.quantity}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                className="w-2/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                              />
                              <input
                                type="text"
                                value={newRequest.unit}
                                onChange={(e) => setNewRequest(prev => ({ ...prev, unit: e.target.value }))}
                                className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                                placeholder="unit"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Reason / Notes (Optional)</label>
                          <input
                            type="text"
                            value={newRequest.reason}
                            onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                            placeholder="e.g. Term 2 Exam Answer Sheets"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsLogFormOpen(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-1 px-5 py-2 bg-school-primary text-white text-xs font-black rounded-xl hover:bg-school-primary/90 uppercase tracking-wider"
                          >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Submit Request
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Requested</p>
                      <p className="text-2xl font-black text-slate-900">{supplySummary.requested}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Approved</p>
                      <p className="text-2xl font-black text-slate-900">{supplySummary.approved}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Fulfilled</p>
                      <p className="text-2xl font-black text-slate-900">{supplySummary.fulfilled}</p>
                    </div>
                  </div>

                  {/* Requests History List */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Request History</span>
                      <button onClick={loadSupplyData} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400">
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupply ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {isLoadingSupply ? (
                        <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-school-primary" />
                          <span className="text-xs font-bold">Loading supply records...</span>
                        </div>
                      ) : supplyRequests.length > 0 ? (
                        supplyRequests.map((req) => (
                          <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-slate-900">
                                  {req.quantity} {req.unit || 'pages'}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">({req.item_type || 'paper'})</span>
                              </div>
                              {req.reason && <p className="text-xs text-slate-500 font-medium">{req.reason}</p>}
                              <p className="text-[10px] text-slate-400 mt-1">
                                Logged: {new Date(req.created_at || Date.now()).toLocaleDateString()}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                              req.status === 'fulfilled'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : req.status === 'approved'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : req.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {req.status || 'pending'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs font-medium">
                          No supply requests recorded for this teacher yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'Classes' || activeTab === 'Performance') && (
                <DashboardSection title={activeTab} className="bg-white">
                  <p className="text-xs font-medium text-slate-400">Section loaded and active.</p>
                </DashboardSection>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
