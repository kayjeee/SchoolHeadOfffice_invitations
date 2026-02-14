import React from "react";
import { Learner } from "../../../../lib/api/parent-api";

interface AssignmentsTabProps {
  learners: Learner[];
}

export default function AssignmentsTab({ learners }: AssignmentsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Upcoming Assignments</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { subject: "Mathematics", title: "Algebraic Equations", due: "Oct 29", status: "Pending", priority: "High" },
          { subject: "History", title: "The Industrial Revolution", due: "Nov 02", status: "In Progress", priority: "Medium" },
          { subject: "Science", title: "Photosynthesis Lab Report", due: "Oct 31", status: "Pending", priority: "High" },
        ].map((assignment, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {assignment.subject}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                assignment.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {assignment.priority} Priority
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{assignment.title}</h3>
            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
              <span className="text-gray-500">Due: <span className="font-semibold">{assignment.due}</span></span>
              <span className={`font-medium ${assignment.status === 'Pending' ? 'text-orange-600' : 'text-blue-600'}`}>
                {assignment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
