import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UpgradeBanner from './widgets/UpgradeBanner';
import { ExtendedProfile } from './types/dashboard.types';
import { Learner } from '../../../lib/api/parent-api';

export interface DashboardShellProps {
  user?: any;
  profile?: ExtendedProfile | null;
  learners?: Learner[];
  schoolName?: string;
  children: React.ReactNode;
}

const TABS = [
  { key: 'overview', label: 'overview', path: '' },
  { key: 'academics', label: 'academics', path: '/academics' },
  { key: 'attendance', label: 'attendance', path: '/attendance' },
  { key: 'behavior', label: 'behavior', path: '/behavior' },
  { key: 'assignments', label: 'assignments', path: '/assignments' },
  { key: 'messages', label: 'messages', path: '/communications' },
  { key: 'reports', label: 'reports', path: '/reports' },
  { key: 'analytics', label: 'analytics', path: '/analytics' },
  { key: 'premium', label: 'premium', path: '/premium' },
];

export default function DashboardShell({
  profile,
  schoolName,
  children,
}: DashboardShellProps) {
  const router = useRouter();

  // Extract base route params
  const { school_slug, email } = router.query;
  const schoolSlugParam = typeof school_slug === 'string' ? school_slug : '';
  const emailParam = typeof email === 'string' ? email : '';
  const basePath = `/parent/${encodeURIComponent(schoolSlugParam)}/dashboard/${encodeURIComponent(emailParam)}`;

  const isPremium = profile?.subscription === 'premium';

  // Active tab derived directly from router.pathname
  const getIsActiveTab = (tabPath: string) => {
    if (tabPath === '') {
      // Overview tab is active when pathname ends in [email] or [email]/index
      return (
        router.pathname.endsWith('/[email]') ||
        router.pathname.endsWith('/[email]/index') ||
        router.pathname.endsWith('/[email]/')
      );
    }
    return router.pathname.endsWith(tabPath);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* PERSISTENT HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              {schoolName || 'SchoolHeadOffice'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.first_name || profile?.name?.split(' ')[0] || 'Parent'}
            </h1>

            {!isPremium && (
              <div className="hidden md:block">
                <UpgradeBanner />
              </div>
            )}
          </div>

          {!isPremium && (
            <div className="mt-4 md:hidden">
              <UpgradeBanner />
            </div>
          )}

          {/* REAL NEXT.JS ROUTE-BASED NAVIGATION */}
          <div className="flex gap-4 mt-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const href = `${basePath}${tab.path}`;
              const isActive = getIsActiveTab(tab.path);

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={`capitalize px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="mt-8">{children}</div>
        </div>
      </main>

      {/* PERSISTENT FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SchoolHeadOffice. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
