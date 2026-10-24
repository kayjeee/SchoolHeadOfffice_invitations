import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-64 bg-slate-200 rounded-lg mb-2"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  <div className="h-3 w-48 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[300px]">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-200 rounded"></div>
                <div className="h-3 w-56 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 h-64">
            <div className="h-4 w-32 bg-slate-800 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-slate-800 rounded"></div>
                <div className="h-4 w-16 bg-slate-800 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-slate-800 rounded"></div>
                <div className="h-4 w-20 bg-slate-800 rounded"></div>
              </div>
              <div className="pt-8 border-t border-slate-800">
                <div className="h-4 w-full bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64">
            <div className="h-3 w-24 bg-slate-100 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-slate-50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
