// pages/student/[school_slug]/dashboard/[email]/index.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import AuthGate from '../../../../../components/auth/AuthGate';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import {
  resolveStudentDashboardProps,
  StudentDashboardPageProps,
} from '../../../../../lib/services/resolveStudentDashboardProps';

const FrontPageLayout = dynamic(
  () => import('../../../../../components/Layouts/FrontPageLayout'),
  { ssr: true }
);

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

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${schoolName} - Student Dashboard`}</title>
      </Head>
      <FrontPageLayout user={initialProfile} userRoles={initialProfile?.roles || ['student']}>
        <div className="min-h-[80vh] bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, <span className="font-medium text-gray-700">{displayName}</span> • {schoolName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 text-xs font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Student Account
              </div>
            </div>

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

            {/* Main Content Modules */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Academic Overview & Portal Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">My Timetable</h4>
                  <p className="text-xs text-gray-500">View weekly class schedules and period allocations.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Attendance Record</h4>
                  <p className="text-xs text-gray-500">Track daily class presence and summary statistics.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Report Cards & Marks</h4>
                  <p className="text-xs text-gray-500">Access term assessment results and subject marks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
