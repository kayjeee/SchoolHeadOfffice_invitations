// pages/student/[school_slug]/dashboard/[email]/print-shop.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import AuthGate from '../../../../../components/auth/AuthGate';
import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import StudentDashboardShell from '../../../../../components/student/StudentDashboardShell';
import PrintShopTab from '../../../../../components/student/PrintShop/PrintShopTab';
import {
  resolveStudentDashboardProps,
  StudentDashboardPageProps,
} from '../../../../../lib/services/resolveStudentDashboardProps';

export const getServerSideProps: GetServerSideProps<StudentDashboardPageProps> = async (context) => {
  return resolveStudentDashboardProps(context);
};

export default function StudentPrintShopPage(props: StudentDashboardPageProps) {
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
        returnTo={`/student/${encodeURIComponent(school_slug)}/dashboard/${encodeURIComponent(email)}/print-shop`}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${schoolName} - Print Shop & Delivery | Student Portal`}</title>
      </Head>

      <StudentDashboardShell
        user={initialProfile}
        profile={initialProfile}
        schoolName={schoolName}
      >
        <PrintShopTab />
      </StudentDashboardShell>
    </ErrorBoundary>
  );
}
