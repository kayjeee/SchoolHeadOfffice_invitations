import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import { Learner } from "../../../../lib/api/parent-api";

export function useParentDashboard(learners: Learner[]) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsData, notificationsData] = await Promise.all([
          dashboardService.getDashboardStats(learners),
          dashboardService.getNotifications(),
        ]);
        setStats(statsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (learners && learners.length > 0) {
      fetchData();
    } else if (learners) {
      setLoading(false);
    }
  }, [learners]);

  return {
    activeTab,
    setActiveTab,
    stats,
    notifications,
    loading,
  };
}
