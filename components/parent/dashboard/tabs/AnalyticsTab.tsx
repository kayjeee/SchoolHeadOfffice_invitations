import React from "react";

interface AnalyticsTabProps {
  isPremium?: boolean;
}

export default function AnalyticsTab({ isPremium }: AnalyticsTabProps) {
  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Get deep insights into your child's academic growth, performance trends, and comparative analysis with our Premium plan.
        </p>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Subject Mastery</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-100 rounded-lg">
            Radar chart placeholder (Math, Science, English, etc.)
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Growth Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-100 rounded-lg">
            Line chart placeholder (Term-over-term progress)
          </div>
        </div>
      </div>
    </div>
  );
}
