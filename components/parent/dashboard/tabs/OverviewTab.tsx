import React from "react";
import { Learner } from "../../../../lib/types/parent.types";
import LearnerCard from "../widgets/LearnerCard";
import StatsCard from "../widgets/StatsCard";
import NotificationList from "../widgets/NotificationList";

interface OverviewTabProps {
  learners: Learner[];
}

export default function OverviewTab({ learners }: OverviewTabProps) {
  const mockNotifications = [
    { id: 1, message: "Mathematics test results published", date: "2 hours ago" },
    { id: 2, message: "School closed for public holiday on Monday", date: "1 day ago" },
    { id: 3, message: "New assignment: History Essay", date: "2 days ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Attendance" value="95%" trend="+2%" color="blue" />
        <StatsCard title="Avg. Grade" value="A-" color="green" />
        <StatsCard title="Assignments" value="4 Pending" color="orange" />
        <StatsCard title="Behavior" value="Exemplary" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Your Children</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learners.map((learner) => (
                <LearnerCard key={learner.id} learner={learner} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Academic Snapshot</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
              Grade performance chart placeholder
            </div>
          </section>
        </div>

        <div>
          <NotificationList notifications={mockNotifications} />
        </div>
      </div>
    </div>
  );
}
