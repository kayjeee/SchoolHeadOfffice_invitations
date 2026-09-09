'use client';

import React, { use, useState, useEffect } from 'react';
import { useSchool } from '@/lib/hooks/useSchool';
import { useAuth } from '@/lib/hooks/useAuth';
import { SchoolAPI } from '@/lib/api/school-api';
import {
  Package,
  Plus,
  Clock,
  CheckCircle2,
  CheckSquare,
  AlertCircle,
  Loader2,
  Send,
  X,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function TeacherSupplyRequestsPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { schoolId, isLoading: isSchoolLoading } = useSchool(schoolSlug);
  const { user } = useAuth();

  const currentTeacherId = user?.sub || 'teacher-123';

  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [summary, setSummary] = useState({ requested: 0, approved: 0, fulfilled: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemType, setItemType] = useState('paper');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('pages');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const [requests, summaryData] = await Promise.all([
        SchoolAPI.getSupplyRequests(schoolId, currentTeacherId),
        SchoolAPI.getSupplySummary(schoolId, currentTeacherId)
      ]);
      setSupplyRequests(requests || []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load supply requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId, currentTeacherId]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SchoolAPI.createSupplyRequest({
        school_id: schoolId,
        teacher_id: currentTeacherId,
        item_type: itemType,
        quantity: Number(quantity),
        unit,
        reason: reason.trim() || undefined
      });

      toast.success('Supply requisition submitted successfully!');
      setIsModalOpen(false);

      // Reset form
      setItemType('paper');
      setQuantity(100);
      setUnit('pages');
      setReason('');

      loadData();
    } catch (err: any) {
      console.error('Failed to create supply request:', err);
      toast.error(err.message || 'Failed to submit supply request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Supply Requisitions</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Log classroom material requests (paper, printing, stationery) for administrative approval.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 uppercase tracking-wider w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Total Requested</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.total || supplyRequests.length}</p>
          <p className="text-xs text-slate-500 font-medium">Requisitions logged</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Pending Triage</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.requested || 0}</p>
          <p className="text-xs text-slate-500 font-medium">Awaiting admin review</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Approved</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.approved || 0}</p>
          <p className="text-xs text-slate-500 font-medium">Ready for fulfillment</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Fulfilled</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.fulfilled || 0}</p>
          <p className="text-xs text-slate-500 font-medium">Completed materials</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Your Requisition History</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-bold">Loading supply requisitions...</span>
          </div>
        ) : supplyRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No Requisitions Logged Yet</p>
            <p className="text-xs text-slate-400">Click "New Requisition" above to log classroom supplies.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Quantity</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Notes</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Submitted</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {supplyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {req.quantity} {req.unit || 'pages'}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">
                        {req.item_type || 'paper'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {req.reason || '---'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(req.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                        req.status === 'fulfilled'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : req.status === 'approved'
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : req.status === 'rejected'
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {req.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Requisition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">New Supply Requisition</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Item Category *
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="paper">A4 Printing Paper</option>
                  <option value="stationery">Stationery & Pens</option>
                  <option value="toner">Printer Toner / Cartridges</option>
                  <option value="art">Art & Craft Supplies</option>
                  <option value="other">Other Material</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. reams, pages, boxes"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Reason / Purpose (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. End of term examination printing for Grade 8"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
