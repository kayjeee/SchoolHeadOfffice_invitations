// pages/student/[school_slug]/dashboard/[email]/projects.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import AuthGate from '../../../../../components/auth/AuthGate';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import StudentDashboardShell from '../../../../../components/student/StudentDashboardShell';
import ProjectHubTab from '../../../../../components/student/Projects/ProjectHubTab';
import {
  resolveStudentDashboardProps,
  StudentDashboardPageProps,
} from '../../../../../lib/services/resolveStudentDashboardProps';

export const getServerSideProps: GetServerSideProps<StudentDashboardPageProps> = async (context) => {
  return resolveStudentDashboardProps(context);
};

export default function StudentProjectsPage(props: StudentDashboardPageProps) {
  const {
    school_slug,
    schoolName,
    email,
    isAuthenticated,
    initialProfile,
  } = props;

  if (!isAuthenticated) {
    return (
      <AuthGate
        invitationData={{ school_name: schoolName, school_logo: null, grade_name: null, learner_name: null }}
        returnTo={`/student/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}/projects`}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${schoolName} - Open-Source Project Hub | Student Portal`}</title>
      </Head>

      <StudentDashboardShell
        user={initialProfile}
        profile={initialProfile}
        schoolName={schoolName}
      >
        <ProjectHubTab />
      </StudentDashboardShell>
    </ErrorBoundary>
  );
}
