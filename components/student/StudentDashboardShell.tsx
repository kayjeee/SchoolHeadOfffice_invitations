// components/student/StudentDashboardShell.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export interface StudentDashboardShellProps {
  user?: any;
  profile?: any;
  schoolName?: string;
  children: React.ReactNode;
}

const STUDENT_TABS = [
  { key: 'overview', label: 'Overview', path: '' },
  { key: 'print-shop', label: 'Print Shop & Delivery', path: '/print-shop' },
  { key: 'opportunities', label: 'Tutoring & Opportunities', path: '/opportunities' },
  { key: 'ai-helper', label: 'AI Homework Helper', path: '/ai-helper' },
  { key: 'projects', label: 'Open-Source Project Hub', path: '/projects' },
];

export default function StudentDashboardShell({
  profile,
  schoolName,
  children,
}: StudentDashboardShellProps) {
  const router = useRouter();

  const { school_slug, email } = router.query;
  const schoolSlugParam = typeof school_slug === 'string' ? school_slug : '';
  const emailParam = typeof email === 'string' ? email : '';
  const basePath = `/student/${encodeURIComponent(schoolSlugParam)}/dashboard/${encodeURIComponent(emailParam)}`;

  const getIsActiveTab = (tabPath: string) => {
    if (tabPath === '') {
      return (
        router.pathname.endsWith('/[email]') ||
        router.pathname.endsWith('/[email]/index') ||
        router.pathname.endsWith('/[email]/')
      );
    }
    return router.pathname.endsWith(tabPath);
  };

  const displayName = profile?.first_name || profile?.name || 'Student';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      {/* PERSISTENT HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
              S
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight block leading-none">
                {schoolName || 'SchoolHeadOffice'}
              </span>
              <span className="text-xs text-indigo-600 font-medium">Student Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900">{displayName}</span>
              <span className="text-xs text-gray-500">{emailParam}</span>
            </div>
            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {displayName}!
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your printing, tutoring opportunities, AI study tools, and IT projects.
              </p>
            </div>
          </div>

          {/* STUDENT ROUTE NAVIGATION TABS */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
            {STUDENT_TABS.map((tab) => {
              const href = `${basePath}${tab.path}`;
              const isActive = getIsActiveTab(tab.path);

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={`px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 rounded-t-lg ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100/50'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="mt-6">{children}</div>
        </div>
      </main>

      {/* PERSISTENT FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} SchoolHeadOffice Educational Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
