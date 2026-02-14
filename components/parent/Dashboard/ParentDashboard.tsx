import React from "react";
import OverviewTab from "./tabs/OverviewTab";
import AcademicsTab from "./tabs/AcademicsTab";
import AttendanceTab from "./tabs/AttendanceTab";
import BehaviorTab from "./tabs/BehaviorTab";
import MessagesTab from "./tabs/MessagesTab";
import AssignmentsTab from "./tabs/AssignmentsTab";
import ReportsTab from "./tabs/ReportsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import PremiumTab from "./tabs/PremiumTab";
import UpgradeBanner from "./widgets/UpgradeBanner";
import DashboardLayout from "./DashboardLayout";
import { useParentDashboard } from "./hooks/useParentDashboard";

export default function ParentDashboard({ user, profile, learners }) {
  const { activeTab, setActiveTab, stats, notifications, loading } = useParentDashboard(learners);

  const isPremium = profile?.subscription === "premium";

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab learners={learners} stats={stats} notifications={notifications} />;
      case "academics":
        return <AcademicsTab learners={learners} isPremium={isPremium} />;
      case "attendance":
        return <AttendanceTab learners={learners} />;
      case "behavior":
        return <BehaviorTab learners={learners} isPremium={isPremium} />;
      case "messages":
        return <MessagesTab />;
      case "assignments":
        return <AssignmentsTab learners={learners} />;
      case "reports":
        return <ReportsTab isPremium={isPremium} />;
      case "analytics":
        return <AnalyticsTab isPremium={isPremium} />;
      case "premium":
        return <PremiumTab />;
      default:
        return <OverviewTab learners={learners} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || 'Parent'}
        </h1>

        {!isPremium && <div className="hidden md:block"><UpgradeBanner /></div>}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || 'Parent'}
        </h1>

        {!isPremium && <div className="hidden md:block"><UpgradeBanner /></div>}
      </div>

      {/* Mobile Upgrade Banner */}
      {!isPremium && <div className="mt-4 md:hidden"><UpgradeBanner /></div>}

      {/* Tabs */}
      <div className="flex gap-4 mt-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          "overview",
          "academics",
          "attendance",
          "behavior",
          "assignments",
          "messages",
          "reports",
          "analytics",
          "premium",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="mt-8">{renderTab()}</div>
    </DashboardLayout>

      {/* Mobile Upgrade Banner */}
      {!isPremium && <div className="mt-4 md:hidden"><UpgradeBanner /></div>}

      {/* Tabs */}
      <div className="flex gap-4 mt-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          "overview",
          "academics",
          "attendance",
          "behavior",
          "assignments",
          "messages",
          "reports",
          "analytics",
          "premium",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="mt-8">{renderTab()}</div>
    </DashboardLayout>
  );
}
