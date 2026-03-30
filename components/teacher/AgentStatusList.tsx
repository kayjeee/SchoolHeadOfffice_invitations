'use client';

import React from 'react';
import {
  Shield,
  Eye,
  Activity,
  Radio,
  Circle,
  AlertCircle,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'scanning' | 'alert' | 'error';
  lastActivity: string;
  metadata?: any;
}

interface AgentStatusListProps {
  agents: AgentStatus[];
  godMode?: boolean;
}

const AgentIcon = ({ status, godMode }: { status: AgentStatus['status'], godMode: boolean }) => {
  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';
  const accentBg = godMode ? 'bg-secondary-accent/10' : 'bg-primary-accent/10';
  const accentBorder = godMode ? 'border-secondary-accent/20' : 'border-primary-accent/20';

  switch (status) {
    case 'active':
      return (
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center p-2.5 border relative overflow-hidden group", accentBg, accentBorder)}>
          <Shield className={cn("w-full h-full relative z-10", accentColor)} />
          <div className={cn("absolute inset-0 opacity-20", godMode ? "bg-secondary-accent animate-pulse" : "bg-primary-accent animate-pulse")}></div>
        </div>
      );
    case 'scanning':
      return (
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center p-2.5 relative">
          <Eye className="w-full h-full text-indigo-400" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
        </div>
      );
    case 'alert':
      return (
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center p-2.5">
          <AlertCircle className="w-full h-full text-red-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5">
          <Activity className="w-full h-full text-white/40" />
        </div>
      );
  }
};

export default function AgentStatusList({ agents, godMode = false }: AgentStatusListProps) {
  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';

  return (
    <div className="space-y-4">
      {agents.length > 0 ? (
        agents.map((agent) => (
          <div
            key={agent.id}
            className="group relative flex items-center gap-3 p-3 rounded-2xl bg-surface-container border border-white/5 hover:border-white/10 transition-all"
          >
            <AgentIcon status={agent.status} godMode={godMode} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest truncate">{agent.name}</h4>
                {agent.status === 'active' && (
                  <div className={cn("w-1.5 h-1.5 rounded-full", godMode ? "bg-secondary-accent shadow-[0_0_8px_rgba(188,197,255,0.8)]" : "bg-primary-accent shadow-[0_0_8px_rgba(173,198,255,0.8)]")}></div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-medium uppercase tracking-tighter opacity-40", agent.status === 'alert' && "text-red-400 opacity-100")}>
                  {agent.status}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span className="text-[10px] font-medium text-white/30 truncate">{agent.lastActivity}</span>
              </div>
            </div>

            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-lg transition-all">
              <MoreVertical className="w-4 h-4 text-white/40" />
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-10 px-4 rounded-2xl bg-surface-container border border-dashed border-white/10">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">No active sentinel agents currently deployed.</p>
        </div>
      )}

      {/* Deploy Agent Button */}
      <button className={cn(
        "w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest",
        accentColor
      )}>
        <Plus className="w-4 h-4" />
        Deploy New Agent
      </button>
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
  </svg>
);
