'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Package,
  Menu,
  X,
  School,
  LogOut,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useSchool } from '@/lib/hooks/useSchool';
import { useAuth } from '@/lib/hooks/useAuth';
import { SchoolProvider } from '@/components/context/SchoolContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
      active
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="text-sm tracking-tight">{label}</span>
  </Link>
);

export default function TeacherDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = use(params);
  const pathname = usePathname();

  const { schoolId, schoolData, isLoading: isSchoolLoading } = useSchool(schoolSlug);
  const { user, isLoading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoading = isSchoolLoading || authLoading;

  const userName =
    user?.name ||
    (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null) ||
    user?.nickname ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Faculty Member';

  const userEmail = user?.email || '';

  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'T';

  const navItems = [
    { href: `/teacher/${schoolSlug}`, icon: LayoutDashboard, label: 'Dashboard' },
    { href: `/teacher/${schoolSlug}/learners`, icon: Users, label: 'Learners' },
    { href: `/teacher/${schoolSlug}/teachers`, icon: Briefcase, label: 'Teachers' },
    { href: `/teacher/${schoolSlug}/communications`, icon: MessageSquare, label: 'Communications' },
    { href: `/teacher/${schoolSlug}/supply-requests`, icon: Package, label: 'Supply Requisitions' },
  ];

  const displayName =
    schoolData?.schoolName ||
    schoolData?.name ||
    schoolSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold tracking-tight">Resolving Teacher Portal Context...</p>
        </div>
      </div>
    );
  }

  return (
    <SchoolProvider initialSchool={schoolData}>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Header Block */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <School className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-bold text-slate-900 truncate tracking-tight">
                  {displayName}
                </h1>
                <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest">
                  Teacher Portal
                </p>
              </div>
              <button
                className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Faculty Menu
              </div>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                />
              ))}
            </nav>

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-600/20 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {userInitials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail || 'Faculty Member'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    TEACHER
                  </span>
                </div>

                <a
                  href="/api/auth/logout"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <School className="w-4 h-4 text-emerald-600" />
                <span>{displayName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-slate-900">{userName}</span>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Faculty Portal</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
            </div>
          </header>

          {/* Viewport */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SchoolProvider>
  );
}
