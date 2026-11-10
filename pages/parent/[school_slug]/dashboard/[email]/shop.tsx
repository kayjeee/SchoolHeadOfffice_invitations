import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import AuthGate from '../../../../../components/auth/AuthGate';
import DashboardShell from '../../../../../components/parent/Dashboard/DashboardShell';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import ShopTab from '../../../../../components/parent/Dashboard/tabs/ShopTab';
import {
  resolveParentDashboardProps,
  ParentDashboardPageProps,
} from '../../../../../lib/services/resolveParentDashboardProps';

export const getServerSideProps: GetServerSideProps<ParentDashboardPageProps> = async (context) => {
  return resolveParentDashboardProps(context);
};

export default function ShopPage(props: ParentDashboardPageProps) {
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
        invitationData={{
          school_name: schoolName,
          school_logo: undefined,
          grade_name: undefined,
          learner_name: undefined,
        }}
        returnTo={`/parent/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}/shop`}
      />
    );
  }

  const displayName = initialProfile?.primary_school_name || schoolName || 'Your School';
  const resolvedSchoolId =
    initialLearners[0]?.school_id ||
    (initialProfile as any)?.school_id ||
    (initialProfile as any)?.primary_school_id ||
    'school-default';

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${displayName} - School Shop | Parent Portal`}</title>
      </Head>

      <DashboardShell
        user={initialProfile}
        profile={initialProfile}
        learners={initialLearners}
        schoolName={displayName}
      >
        <ShopTab
          schoolId={resolvedSchoolId}
          parentProfile={initialProfile}
          learners={initialLearners}
        />
      </DashboardShell>
    </ErrorBoundary>
  );
}
