'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  MessageSquare,
  Settings,
  Menu,
  X,
  ChevronRight,
  School,
  LogOut,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { GlobalSearch } from '@/components/admin/layout/GlobalSearch';
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
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active
        ? "bg-school-primary text-white shadow-md shadow-school-primary/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = use(params);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Active Branding Tokens
  const branding = {
    primary: "#059669",
    mode: "green"
  };

  const themeVars = {
    '--school-primary': branding.primary,
    '--school-primary-hover': '#047857',
    '--school-radius': '0.75rem',
  } as React.CSSProperties;

  const navItems = [
    { href: `/admin/${schoolSlug}`, icon: LayoutDashboard, label: 'Overview' },
    { href: `/admin/${schoolSlug}/learners`, icon: Users, label: 'Learners' },
    { href: `/admin/${schoolSlug}/grades`, icon: GraduationCap, label: 'Grades' },
    { href: `/admin/${schoolSlug}/communications`, icon: MessageSquare, label: 'Communications' },
    { href: `/admin/${schoolSlug}/settings`, icon: Settings, label: 'Settings' },
  ];

  // Breadcrumb generation based on pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const displayName = schoolSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const breadcrumbs = [
    { label: displayName, href: `/admin/${schoolSlug}` },
    { label: 'Dashboard', href: `/admin/${schoolSlug}` },
    ...pathSegments.slice(2).map((segment, idx) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${pathSegments.slice(0, idx + 3).join('/')}`
    }))
  ].filter((crumb, index, self) =>
    index === self.findIndex((t) => t.label === crumb.label)
  );

  return (
    <div style={themeVars} className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
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
            <div className="w-10 h-10 rounded-xl bg-school-primary flex items-center justify-center text-white shadow-lg shadow-school-primary/20">
              <School className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-900 truncate tracking-tight">
                {displayName}
              </h1>
              <p className="text-[10px] uppercase font-bold text-school-primary tracking-widest">
                Admin Portal
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
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                active={pathname === item.href}
              />
            ))}
          </nav>

          {/* Footer Profile Segment */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-school-primary/20 flex items-center justify-center text-school-primary font-bold text-sm">
                  MM
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">Mrs Manana</p>
                  <p className="text-xs text-slate-500 truncate">700400585@gdeschools.gov.za</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                <button className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-school-primary/10 text-school-primary border border-school-primary/20 hover:bg-school-primary hover:text-white transition-colors">
                  ADMIN
                </button>
                <button className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
                  STAFF/TEACHER
                </button>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-100">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Dynamic Breadcrumb */}
            <nav className="hidden md:flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.href}-${crumb.label}`}>
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <Link
                    href={crumb.href}
                    className={cn(
                      "transition-colors",
                      idx === breadcrumbs.length - 1
                        ? "text-slate-900 font-bold"
                        : "text-slate-500 hover:text-school-primary"
                    )}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:block">
              <GlobalSearch schoolId={schoolSlug} schoolSlug={schoolSlug} />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2 pl-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-slate-900">Mrs Manana</span>
                <span className="text-[10px] text-slate-500 font-medium">System Admin</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                M
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
