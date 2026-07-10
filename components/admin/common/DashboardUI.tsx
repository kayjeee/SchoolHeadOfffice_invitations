'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: LucideIcon;
}

export const PageHeader = ({ title, description, actions, icon: Icon }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-school-primary/10 text-school-primary items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-1">
            {!Icon && <div className="w-2 h-8 bg-school-primary rounded-full hidden md:block"></div>}
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{title}</h2>
          </div>
          {description && (
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  subtext?: string;
  loading?: boolean;
}

export const StatsCard = ({ label, value, change, icon: Icon, subtext, loading }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-school-primary/30 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-school-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-[10px] font-black ${change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-tighter`}>
            {change}
          </span>
        )}
      </div>
      <h4 className="text-2xl font-black text-slate-900">
        {loading ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" /> : value}
      </h4>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
      {subtext && <p className="text-[10px] text-slate-500 mt-2 font-medium">{subtext}</p>}
      <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        <Icon className="w-20 h-20 rotate-12" />
      </div>
    </motion.div>
  );
};

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSection = ({ title, subtitle, actions, children, className }: DashboardSectionProps) => {
  return (
    <div className={cn("bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="font-black text-slate-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
