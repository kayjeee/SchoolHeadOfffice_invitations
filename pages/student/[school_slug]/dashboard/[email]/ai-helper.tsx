// pages/student/[school_slug]/dashboard/[email]/ai-helper.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import AuthGate from '../../../../../components/auth/AuthGate';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import StudentDashboardShell from '../../../../../components/student/StudentDashboardShell';
import AiHomeworkHelperTab from '../../../../../components/student/AiHelper/AiHomeworkHelperTab';
import {
  resolveStudentDashboardProps,
  StudentDashboardPageProps,
} from '../../../../../lib/services/resolveStudentDashboardProps';

export const getServerSideProps: GetServerSideProps<StudentDashboardPageProps> = async (context) => {
  return resolveStudentDashboardProps(context);
};

export default function StudentAiHelperPage(props: StudentDashboardPageProps) {
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
        returnTo={`/student/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}/ai-helper`}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${schoolName} - AI Homework Helper | Student Portal`}</title>
      </Head>

      <StudentDashboardShell
        user={initialProfile}
        profile={initialProfile}
        schoolName={schoolName}
      >
        <AiHomeworkHelperTab />
      </StudentDashboardShell>
    </ErrorBoundary>
  );
}
