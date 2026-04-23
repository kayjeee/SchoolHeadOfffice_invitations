import React from "react";
import { Learner } from "../../../../lib/api/parent-api";

interface LearnerCardProps {
  learner: Learner;
}

export default function LearnerCard({ learner }: LearnerCardProps) {
  const initials = `${learner.first_name?.[0] || ""}${learner.last_name?.[0] || ""}`;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
        {initials}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">
          {learner.first_name} {learner.last_name}
        </h3>
        <p className="text-sm text-gray-500">Grade {learner.grade}</p>
      </div>
    </div>
  );
}
