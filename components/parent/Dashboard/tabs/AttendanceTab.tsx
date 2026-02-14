import React from "react";
import { Learner } from "../../../../lib/types/parent.types";

interface AttendanceTabProps {
  learners: Learner[];
}

export default function AttendanceTab({ learners }: AttendanceTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Attendance Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500 uppercase font-semibold">Overall Attendance</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">96.5%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500 uppercase font-semibold">Days Absent</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500 uppercase font-semibold">Late Arrivals</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">1</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4">Monthly Attendance Trend</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
          Attendance chart placeholder
        </div>
      </div>
    </div>
  );
}
