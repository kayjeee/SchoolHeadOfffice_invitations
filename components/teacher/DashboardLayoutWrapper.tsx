'use client';

import React, { useState, useEffect } from 'react';
import { GodmodeProvider, useGodmode } from '@/context/GodmodeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import {
  Home,
  Users,
  MessageSquare,
  Bell,
  Search,
  Zap,
  Menu,
  X,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourierProvider } from '@trycourier/react-provider';
import { Inbox } from '@trycourier/react-inbox';
import { Toast } from '@trycourier/react-toast';
import { useUser } from '@auth0/nextjs-auth0/client';
import { usePresence } from '@/lib/hooks/usePresence';
import NotificationBanner from './NotificationBanner';
import OneSignal from 'react-onesignal';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  schoolSlug: string;
  teacherSlug: string;
  userId?: string;
  courierClientKey?: string;
}

function InnerLayout(props: DashboardLayoutWrapperProps) {
  const { children, schoolSlug, teacherSlug, userId, courierClientKey } = props;
  // Support both App Router and Pages Router
  const nextPathname = usePathname();
  const pagesRouter = useRouter();
  const pathname = nextPathname || pagesRouter?.asPath || '';

  const { godMode } = useGodmode();
  const { user } = useUser();

  // Wire up the "Heartbeat" presence tracker with periodic updates
  usePresence(user?.sub);

  useEffect(() => {
    const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const courierClientKey = process.env.NEXT_PUBLIC_COURIER_CLIENT_KEY;

    if (oneSignalAppId) {
      OneSignal.init({
        appId: oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false, // We use our own NotificationBanner
        }
      }).then(() => {
        console.log('✅ [OneSignal] Initialized');

        // Use the database ID as the external ID for both Courier and OneSignal
        if (userId) {
          OneSignal.setExternalUserId(userId);
          console.log(`🔗 [OneSignal] External User ID set to: ${userId}`);
        }
      });
    }

    // Register Courier service worker for background push notifications
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('✅ [ServiceWorker] Registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('❌ [ServiceWorker] Registration failed: ', err);
          }
        );
      });
    }
  }, [user]);

  const navItems = [
    { name: 'Home', href: `/teacher/school/${schoolSlug}/teachers/${teacherSlug}/dashboard`, icon: Home },
    { name: 'Classes', href: `/teacher/school/${schoolSlug}/teachers/${teacherSlug}/classes`, icon: Users },
    { name: 'Messages', href: `/teacher/school/${schoolSlug}/teachers/${teacherSlug}/messages`, icon: MessageSquare },
    { name: 'Insights', href: `/teacher/school/${schoolSlug}/teachers/${teacherSlug}/insights`, icon: Zap },
  ];

  const accentColor = godMode ? 'text-secondary-accent' : 'text-primary-accent';

  return (
    <div className="min-h-screen bg-surface text-white font-sans selection:bg-primary-accent/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl tracking-tighter"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", godMode ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-primary-fixed text-on-primary-fixed")}>
                S
              </div>
              <span className="hidden md:inline">SchoolHeadOffice</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-surface-container rounded-full px-3 py-1.5 border border-white/5">
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-white/20"
            />
            <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/40">⌘K</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {courierClientKey && (
              <div className="relative pt-1">
                <Inbox
                  theme={{
                    container: {
                      background: '#121212',
                      color: 'white',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    header: {
                      background: '#1A1A1A',
                      color: 'white',
                    },
                    footer: {
                      background: '#1A1A1A',
                      color: 'white',
                    },
                    icon: {
                      color: 'white',
                    },
                    unvisited: {
                      background: 'rgba(173, 198, 255, 0.1)',
                    },
                  }}
                />
              </div>
            )}
            {!courierClientKey && (
              <button className="p-2 hover:bg-white/5 rounded-full relative">
                <Bell className="w-5 h-5 text-white/70" />
              </button>
            )}
            <div className="h-8 w-px bg-white/10 mx-1 hidden md:block"></div>
            <button className="flex items-center gap-2 p-1 pr-3 hover:bg-white/5 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-accent to-secondary-accent p-px">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xs font-bold">
                  TR
                </div>
              </div>
              <span className="text-sm font-medium hidden md:inline text-white/80">Teacher</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {courierClientKey && <Toast />}
      <NotificationBanner />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? accentColor : "text-white/40 hover:text-white/60"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function DashboardLayoutWrapper(props: DashboardLayoutWrapperProps) {
  const { user } = useUser();
  const courierClientKey = process.env.NEXT_PUBLIC_COURIER_CLIENT_KEY;

  // Prioritize the passed userId (database ID) over the Auth0 sub
  const finalUserId = props.userId || user?.sub || '';

  return (
    <GodmodeProvider>
      {courierClientKey ? (
        <CourierProvider userId={finalUserId} clientKey={courierClientKey}>
          <InnerLayout {...props} courierClientKey={courierClientKey} />
        </CourierProvider>
      ) : (
        <InnerLayout {...props} />
      )}
    </GodmodeProvider>
  );
}
