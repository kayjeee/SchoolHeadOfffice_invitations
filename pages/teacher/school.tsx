import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import ErrorBoundary from '../../components/common/ErrorBoundary';
import LoadingScreen from '../../components/common/LoadingScreen';
import AuthGate from '../../components/auth/AuthGate';

import { InvitationAPI, InvitationData } from '../../lib/api/invitation-api';
import TeacherOnboardingFlow from '../../components/teacher/Onboarding/TeacherOnboardingFlow';
import { slugify } from '../../utils/slugify';

const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface TeacherSchoolProps {
  isAuthenticated: boolean;
  user?: any | null;
  invitationToken?: string | null;
  invitationData?: InvitationData | null;
  school?: string | null;
  schoolId?: string | null;
  error?: string | null;
}

export const getServerSideProps: GetServerSideProps<TeacherSchoolProps> = async (context) => {
  const session = await getSession(context.req, context.res);

  // Early check: If teacher is already onboarded and attached to a school, redirect to their dashboard
  if (session?.user?.sub) {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app';
      const cleanBase = apiBase.endsWith('/api/v1') ? apiBase.replace(/\/api\/v1$/, '') : apiBase;
      const res = await fetch(`${cleanBase}/api/v1/users/schools?auth0_id=${encodeURIComponent(session.user.sub)}`);

      if (res.ok) {
        const json = await res.json();
        const schoolsList = json?.data?.schools || json?.schools || (Array.isArray(json?.data) ? json.data : []);

        if (Array.isArray(schoolsList) && schoolsList.length > 0) {
          const s = schoolsList[0];
          const rawSlug = s.slug || s.school_slug || (s.schoolName || s.name ? slugify(s.schoolName || s.name) : null);

          if (rawSlug) {
            console.log(`🚀 [TeacherSchoolGSSP] Already onboarded teacher found, redirecting to /teacher/${rawSlug}`);
            return {
              redirect: {
                destination: `/teacher/${encodeURIComponent(rawSlug)}`,
                permanent: false,
              },
            };
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ [TeacherSchoolGSSP] Failed to check teacher onboarded schools:', err);
    }
  }

  const rawToken = typeof context.query.token === 'string' ? context.query.token : null;
  const token = rawToken ? rawToken.split('&')[0].split('\\u0026')[0].trim() : null;

  let school = typeof context.query.school === 'string' ? context.query.school : null;

  if (!school && rawToken && rawToken.includes('\\u0026school=')) {
    school = rawToken.split('\\u0026school=')[1].split('&')[0];
    school = decodeURIComponent(school.replace(/\+/g, ' '));
  }

  let invitationData: any = null;
  let error: string | null = null;

  if (token) {
    try {
      invitationData = await InvitationAPI.verifyToken(token);
    } catch (err: any) {
      console.error('❌ [TeacherSchoolGSSP] Verification error:', err.message);
      error = "Could not verify teacher invitation.";
    }
  }

  const resolvedSchoolId = invitationData?.school_id || null;

  if (!session?.user) {
    return {
      props: {
        isAuthenticated: false,
        invitationToken: token,
        invitationData,
        school,
        schoolId: resolvedSchoolId,
        error,
      },
    };
  }

  return {
    props: {
      isAuthenticated: true,
      user: session.user,
      invitationToken: token,
      invitationData,
      school,
      schoolId: resolvedSchoolId,
      error,
    },
  };
};

export default function TeacherSchoolPage(props: TeacherSchoolProps) {
  if (!props.isAuthenticated) {
    const schoolName = props.invitationData?.school_name || props.school || "School Head Office";
    const authGateInvitation = {
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: schoolName,
      school_logo: props.invitationData?.school_logo || null,
      teacher_name: props.invitationData?.teacher_name || null,
    };

    return (
      <AuthGate
        invitationData={authGateInvitation as any}
        returnTo="/teacher/school"
      />
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>Teacher Portal Onboarding</title>
      </Head>
      <FrontPageLayout user={props.user} userRoles={["teacher"]}>
        <TeacherOnboardingFlow
          user={props.user}
          invitationData={props.invitationData}
          schoolSlug={props.school}
          schoolId={props.schoolId}
          schoolName={props.school}
        />
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
