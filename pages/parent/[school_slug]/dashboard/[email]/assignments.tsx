import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import AuthGate from '../../../../../components/auth/AuthGate';
import AssignmentsTab from '../../../../../components/parent/Dashboard/tabs/AssignmentsTab';
import DashboardShell from '../../../../../components/parent/Dashboard/DashboardShell';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import {
  resolveParentDashboardProps,
  ParentDashboardPageProps,
} from '../../../../../lib/services/resolveParentDashboardProps';

export const getServerSideProps: GetServerSideProps<ParentDashboardPageProps> = async (context) => {
  return resolveParentDashboardProps(context);
};

export default function AssignmentsPage(props: ParentDashboardPageProps) {
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
        returnTo={`/parent/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}/assignments`}
      />
    );
  }

  const displayName = initialProfile?.primary_school_name || schoolName || 'Your School';

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${displayName} - Assignments | Parent Portal`}</title>
      </Head>

      <DashboardShell
        user={initialProfile}
        profile={initialProfile}
        learners={initialLearners}
        schoolName={displayName}
      >
        <AssignmentsTab learners={initialLearners} />
      </DashboardShell>
    </ErrorBoundary>
  );
}
