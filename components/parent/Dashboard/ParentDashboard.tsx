import React from "react";
import OverviewTab from "./tabs/OverviewTab";
import DashboardShell from "./DashboardShell";
import { useParentDashboard } from "./hooks/useParentDashboard";
import { DashboardProps } from "./types/dashboard.types";

export default function ParentDashboard({ user, profile, learners }: DashboardProps) {
  const { stats, notifications, loading } = useParentDashboard(learners);

  if (loading) {
    return (
      <DashboardShell profile={profile} learners={learners}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user} profile={profile} learners={learners}>
      <OverviewTab learners={learners} stats={stats} notifications={notifications} />
    </DashboardShell>
  );
}
