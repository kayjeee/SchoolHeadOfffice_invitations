'use client';

import React from 'react';
import {
  X, Mail, Phone, BookOpen, GraduationCap,
  TrendingUp, Star, Calendar, Clock,
  ChevronRight, ExternalLink, ShieldCheck,
  FileText, User, Award, Briefcase,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSection } from '@/components/admin/common/DashboardUI';

interface TeacherProfileDrawerProps {
  teacher: any;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherProfileDrawer = ({ teacher, isOpen, onClose }: TeacherProfileDrawerProps) => {
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
                    {teacher.avatar}
                 </div>
                 <div className="mb-2">
                    <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-2xl font-black text-slate-900">{teacher.name}</h2>
                       <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase">Active</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                       <Briefcase className="w-4 h-4" />
                       {teacher.role} • {teacher.department}
                    </p>
                 </div>
              </div>

              <div className="px-8 flex border-t border-slate-100">
                 {['Overview', 'Classes', 'Performance', 'Documents', 'Activity'].map((tab) => (
                   <button
                     key={tab}
                     className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${tab === 'Overview' ? 'border-school-primary text-school-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
            </div>

            <div className="p-8 space-y-8">
               {/* Quick Stats */}
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Students</p>
                     <p className="text-xl font-black text-slate-900">{teacher.students}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Avg Result</p>
                     <p className="text-xl font-black text-emerald-600">{teacher.performance}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Workload</p>
                     <p className="text-xl font-black text-slate-900">86%</p>
                  </div>
               </div>

               {/* Bio & Details */}
               <DashboardSection title="Employment Details" className="bg-white">
                  <div className="grid grid-cols-2 gap-y-6">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                        <p className="text-sm font-bold text-slate-900">{teacher.name.toLowerCase().replace(' ', '.')}@school.edu</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                        <p className="text-sm font-bold text-slate-900">EMP-2024-08{Math.floor(Math.random() * 90) + 10}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p className="text-sm font-bold text-slate-900">+27 82 455 90{Math.floor(Math.random() * 90) + 10}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joining Date</p>
                        <p className="text-sm font-bold text-slate-900">January 15, 2021</p>
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
                           <p className="text-sm font-bold text-slate-900">PhD in Educational Leadership</p>
                           <p className="text-xs text-slate-500 font-medium">University of Cape Town • 2018</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                           <ShieldCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900">SACE Professional Registration</p>
                           <p className="text-xs text-slate-500 font-medium">Full Status • Renewed 2024</p>
                        </div>
                     </div>
                  </div>
               </DashboardSection>

               {/* Performance Analytics */}
               <DashboardSection title="Teaching Analytics" className="bg-white">
                  <div className="aspect-[16/7] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-6 gap-3">
                     {[30, 45, 35, 60, 80, 50, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-school-primary/20 rounded-lg relative overflow-hidden" style={{ height: `${h}%` }}>
                           <div className="absolute inset-0 bg-school-primary opacity-20" />
                        </div>
                     ))}
                     <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <BarChart3 className="w-32 h-32" />
                     </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                     <p className="text-xs font-bold text-slate-400">Class Performance over Semester 1</p>
                     <span className="text-[10px] font-black text-emerald-600 uppercase">+4.2% Growth</span>
                  </div>
               </DashboardSection>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
