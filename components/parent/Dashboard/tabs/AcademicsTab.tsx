import React from "react";
import { Learner } from "../../../../lib/api/parent-api";

interface AcademicsTabProps {
  learners: Learner[];
  isPremium?: boolean;
}

export default function AcademicsTab({ learners, isPremium }: AcademicsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Academic Performance</h2>
      </div>

      {!isPremium && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800 text-sm">
          <strong>Premium Tip:</strong> Upgrade to see real-time grade updates and detailed subject breakdowns.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { subject: "Mathematics", grade: "A", status: "Improving", updated: "Oct 24, 2023" },
              { subject: "English", grade: "B+", status: "Stable", updated: "Oct 22, 2023" },
              { subject: "Science", grade: "A-", status: "Improving", updated: "Oct 25, 2023" },
              { subject: "History", grade: "B", status: "Attention Needed", updated: "Oct 20, 2023" },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{row.subject}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-blue-600">{row.grade}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.status === "Improving" ? "bg-green-50 text-green-700" :
                    row.status === "Stable" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
