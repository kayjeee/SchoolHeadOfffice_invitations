import React from "react";

interface ReportsTabProps {
  isPremium?: boolean;
}

export default function ReportsTab({ isPremium }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Progress Reports</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold">Available Reports</h3>
          <p className="text-sm text-gray-500">Download and view your child's periodic progress reports.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: "Term 3 Progress Report", date: "Oct 15, 2023", type: "PDF" },
            { name: "Monthly Behavior Summary", date: "Sep 30, 2023", type: "PDF", premiumOnly: true },
            { name: "Term 2 Final Results", date: "Jul 10, 2023", type: "PDF" },
          ].map((report, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.date} • {report.type}</p>
                </div>
              </div>

              {report.premiumOnly && !isPremium ? (
                <button disabled className="text-gray-400 text-sm font-medium flex items-center gap-1 cursor-not-allowed">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Premium
                </button>
              ) : (
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
