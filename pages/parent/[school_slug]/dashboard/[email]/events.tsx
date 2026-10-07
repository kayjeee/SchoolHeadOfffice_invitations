import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import AuthGate from '../../../../../components/auth/AuthGate';
import DashboardShell from '../../../../../components/parent/Dashboard/DashboardShell';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import {
  resolveParentDashboardProps,
  ParentDashboardPageProps,
} from '../../../../../lib/services/resolveParentDashboardProps';

const FrontPageLayout = dynamic(
  () => import('../../../../../components/Layouts/FrontPageLayout'),
  { ssr: true }
);

export const getServerSideProps: GetServerSideProps<ParentDashboardPageProps> = async (context) => {
  return resolveParentDashboardProps(context);
};

export default function EventsPage(props: ParentDashboardPageProps) {
  const {
    school_slug,
    schoolName,
    email,
    isAuthenticated,
    initialProfile,
    initialLearners,
  } = props;

  if (!isAuthenticated) {
    return (
      <AuthGate
        invitationData={{ school_name: schoolName, school_logo: null, grade_name: null, learner_name: null }}
        returnTo={`/parent/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}/events`}
      />
    );
  }

  const displayName = initialProfile?.primary_school_name || schoolName || 'Your School';

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${displayName} - Calendar & Events | Parent Portal`}</title>
      </Head>

      <FrontPageLayout user={initialProfile} userRoles={['parent']}>
        <DashboardShell
          user={initialProfile}
          profile={initialProfile}
          learners={initialLearners}
          schoolName={displayName}
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
              📅
            </div>
            <h2 className="text-xl font-bold text-gray-900">Calendar & Events</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              View upcoming school events, term dates, parent-teacher meetings, and sports fixtures. This module is under active development.
            </p>
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Module Locked (Under Dev)
            </span>
          </div>
        </DashboardShell>
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
