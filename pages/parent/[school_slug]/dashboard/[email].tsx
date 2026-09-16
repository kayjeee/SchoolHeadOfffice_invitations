import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import AuthGate from '../../../../components/auth/AuthGate';
import OverviewTab from '../../../../components/parent/Dashboard/tabs/OverviewTab';
import DashboardShell from '../../../../components/parent/Dashboard/DashboardShell';
import ErrorBoundary from '../../../../components/common/ErrorBoundary';
import { useParentDashboard } from '../../../../components/parent/Dashboard/hooks/useParentDashboard';
import {
  resolveParentDashboardProps,
  ParentDashboardPageProps,
} from '../../../../lib/services/resolveParentDashboardProps';

const FrontPageLayout = dynamic(
  () => import('../../../../components/Layouts/FrontPageLayout'),
  { ssr: true }
);

export const getServerSideProps: GetServerSideProps<ParentDashboardPageProps> = async (context) => {
  return resolveParentDashboardProps(context);
};

export default function ParentDashboardOverviewPage(props: ParentDashboardPageProps) {
  const {
    school_slug,
    schoolName,
    email,
    isAuthenticated,
    initialProfile,
    initialLearners,
    error,
  } = props;

  const { stats, notifications } = useParentDashboard(initialLearners || []);

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
          <title>{`${schoolName} - Parent Portal`}</title>
          <meta name="description" content={`Access the parent portal for ${schoolName}.`} />
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <AuthGate
          invitationData={authGateInvitation}
          returnTo={`/parent/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}`}
        />
      </>
    );
  }

  const displayName = initialProfile?.primary_school_name || schoolName || 'Your School';

  if (error && !initialProfile) {
    return (
      <FrontPageLayout user={null}>
        <div className="p-8 text-center bg-red-50 text-red-700 rounded-lg m-8">
          <h2 className="text-xl font-bold mb-2">Notice</h2>
          <p>{error}</p>
          <button
            onClick={() => (window.location.href = '/parent')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Portal
          </button>
        </div>
      </FrontPageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${displayName} - Overview | Parent Portal`}</title>
        <meta
          name="description"
          content={`Access student reports, attendance, and school announcements for ${displayName}.`}
        />
      </Head>

      <FrontPageLayout user={initialProfile} userRoles={['parent']}>
        <DashboardShell
          user={initialProfile}
          profile={initialProfile}
          learners={initialLearners}
          schoolName={displayName}
        >
          <OverviewTab learners={initialLearners} stats={stats} notifications={notifications} />
        </DashboardShell>
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
