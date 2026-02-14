import { Learner } from "../../../../lib/types/parent.types";

export const dashboardService = {
  async getDashboardStats(learners: Learner[]) {
    // Placeholder for API call
    return {
      averageAttendance: 95,
      overallGrade: "A-",
      upcomingAssignments: 3,
      recentNotifications: 5,
    };
  },

  async getNotifications() {
    // Placeholder for API call
    return [
      { id: 1, message: "New assignment in Mathematics", date: "2023-10-27" },
      { id: 2, message: "Attendance report available", date: "2023-10-26" },
    ];
  },
};
