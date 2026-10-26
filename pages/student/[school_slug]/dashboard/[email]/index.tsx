// pages/student/[school_slug]/dashboard/[email]/index.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import AuthGate from '../../../../../components/auth/AuthGate';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import StudentDashboardShell from '../../../../../components/student/StudentDashboardShell';
import {
  resolveStudentDashboardProps,
  StudentDashboardPageProps,
} from '../../../../../lib/services/resolveStudentDashboardProps';

export const getServerSideProps: GetServerSideProps<StudentDashboardPageProps> = async (context) => {
  return resolveStudentDashboardProps(context);
};

export default function StudentDashboardOverviewPage(props: StudentDashboardPageProps) {
  const {
    school_slug,
    schoolName,
    email,
    isAuthenticated,
    initialProfile,
    error,
  } = props;

  // --- RENDERING FOR UNAUTHENTICATED ---
  if (!isAuthenticated) {
    const authGateInvitation = {
      school_name: schoolName,
      school_logo: null,
      grade_name: null,
      learner_name: null,
    };

    return (
      <>
        <Head>
          <title>{`${schoolName} - Student Portal`}</title>
          <meta name="description" content={`Access the student portal for ${schoolName}.`} />
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <AuthGate
          invitationData={authGateInvitation as any}
          returnTo={`/student/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}`}
        />
      </>
    );
  }

  const displayName = initialProfile?.name || initialProfile?.first_name || email || 'Student';
  const basePath = `/student/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}`;

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${schoolName} - Student Dashboard`}</title>
      </Head>
      <StudentDashboardShell
        user={initialProfile}
        profile={initialProfile}
        schoolName={schoolName}
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">School Entity</h3>
              <p className="text-lg font-bold text-gray-900">{schoolName}</p>
              <p className="text-xs text-gray-500 mt-1">Slug: {school_slug}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Student Account</h3>
              <p className="text-lg font-bold text-gray-900 truncate">{email}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Verified Profile</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned Roles</h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(initialProfile?.roles || ['student']).map((role) => (
                  <span key={role} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Feature Cards */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Student Platform Feature Portals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`${basePath}/print-shop`}
                className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🖨️</span>
                  <span className="text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                    Open Print Shop &rarr;
                  </span>
                </div>
                <h3 className="font-bold text-blue-900 text-base">Learner Print Shop & Delivery</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Order printed revision packs, worksheets, and study guides with school pickup or local delivery.
                </p>
              </Link>

              <Link
                href={`${basePath}/opportunities`}
                className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-300 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🎓</span>
                  <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    Explore Opportunities &rarr;
                  </span>
                </div>
                <h3 className="font-bold text-emerald-900 text-base">Peer Tutoring & Opportunities</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Apply for approved peer tutoring, homework support, and content assistant work with weekly stipends.
                </p>
              </Link>

              <Link
                href={`${basePath}/ai-helper`}
                className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-300 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                    Launch AI Helper &rarr;
                  </span>
                </div>
                <h3 className="font-bold text-purple-900 text-base">AI Homework & Concept Helper</h3>
                <p className="text-xs text-purple-700 mt-1">
                  Step-by-step problem breakdown, practice questions, and CAPS curriculum hints.
                </p>
              </Link>

              <Link
                href={`${basePath}/projects`}
                className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-300 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">💻</span>
                  <span className="text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">
                    Browse Projects &rarr;
                  </span>
                </div>
                <h3 className="font-bold text-indigo-900 text-base">Open-Source School Project Hub</h3>
                <p className="text-xs text-indigo-700 mt-1">
                  Collaborate on real-world school IT problems under educator mentorship to build software skills.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </StudentDashboardShell>
    </ErrorBoundary>
  );
}
