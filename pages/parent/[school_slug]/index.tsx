// pages/parent/[school_slug]/index.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getSession } from "@auth0/nextjs-auth0";

import { ParentService } from "../../../lib/services/parent.service";
import { InvitationAPI } from "../../../lib/api/invitation-api";
import AuthGate from "../../../components/auth/AuthGate";
import ParentDashboard from "../../../components/parent/Dashboard/ParentDashboard";
import ErrorBoundary from "../../../components/common/ErrorBoundary";

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface SchoolDashboardProps {
  school_slug: string;
  schoolName: string;
  token: string | null;
  invitationData: any | null;
  isAuthenticated: boolean;
  initialProfile: any | null;
  initialLearners: any[];
  error?: string | null;
}

export const getServerSideProps: GetServerSideProps<SchoolDashboardProps> = async (context) => {
  const { school_slug } = context.params as { school_slug: string };
  const session = await getSession(context.req, context.res);

  // Decode school name: "Far+North+Secondary+School" -> "Far North Secondary School"
  const schoolName = decodeURIComponent(school_slug.replace(/\+/g, ' '));

  // Extract token, handling weird glued parameters (e.g., ?token=xxx\u0026school=)
  const rawToken = context.query.token as string;
  const token = rawToken
    ? rawToken.split('&')[0].split('\\u0026')[0].trim()
    : null;

  console.log(`🏫 [SchoolDashboard.GSSP] slug: ${school_slug}, name: ${schoolName}, token: ${token?.substring(0, 8)}...`);

  // --- CASE 1: UNAUTHENTICATED ---
  if (!session?.user) {
    let invitationData = null;
    let verifyError = null;

    if (token) {
      try {
        console.log(`🔍 [SchoolDashboard.GSSP] Verifying token: ${token.substring(0, 8)}...`);
        invitationData = await InvitationAPI.verifyToken(token);
        console.log(`✅ [SchoolDashboard.GSSP] Token verified for: ${invitationData?.school_name}`);
      } catch (err: any) {
        console.error(`❌ [SchoolDashboard.GSSP] Token verification failed:`, err.message);
        verifyError = "We couldn't verify your invitation. You can still sign in below.";
      }
    }

    return {
      props: {
        school_slug,
        schoolName: invitationData?.school_name || schoolName,
        token,
        invitationData,
        isAuthenticated: false,
        initialProfile: null,
        initialLearners: [],
        error: verifyError,
      },
    };
  }

  // --- CASE 2: AUTHENTICATED ---
  try {
    const userId = session.user.sub;
    console.log(`👤 [SchoolDashboard.GSSP] Authenticated user: ${userId}`);

    const [profile, learners] = await Promise.all([
      ParentService.getProfile(userId),
      ParentService.getLearners(userId),
    ]);

    // Check if the user is onboarded. If not, redirect to the onboarding flow gateway.
    const hasProfile = !!profile;

    if (!hasProfile) {
      console.log(`⏳ [SchoolDashboard.GSSP] User profile missing. Redirecting to onboarding gateway.`);
      const onboardingPath = token
        ? `/parent?token=${encodeURIComponent(token)}&school=${encodeURIComponent(school_slug)}`
        : `/parent?school=${encodeURIComponent(school_slug)}`;

      return {
        redirect: {
          destination: onboardingPath,
          permanent: false,
        },
      };
    }

    // Fully onboarded - Show Dashboard
    console.log(`✅ [SchoolDashboard.GSSP] Showing dashboard for ${schoolName}`);
    return {
      props: {
        school_slug,
        schoolName: profile.primary_school_name || schoolName,
        token,
        invitationData: null,
        isAuthenticated: true,
        initialProfile: profile,
        initialLearners: learners,
      },
    };

  } catch (err: any) {
    console.error('❌ [SchoolDashboard.GSSP] Error loading dashboard data:', err.message);
    return {
      props: {
        school_slug,
        schoolName,
        token,
        invitationData: null,
        isAuthenticated: true,
        initialProfile: null,
        initialLearners: [],
        error: "Failed to load dashboard data."
      },
    };
  }
};

export default function SchoolDashboardPage(props: SchoolDashboardProps) {
  const {
    schoolName,
    school_slug,
    token,
    invitationData,
    isAuthenticated,
    initialProfile,
    initialLearners,
    error
  } = props;

  // --- RENDERING FOR UNAUTHENTICATED ---
  if (!isAuthenticated) {
    const authGateInvitation = {
      token: invitationData?.token || token || undefined,
      school_name: invitationData?.school_name || schoolName,
      school_logo: invitationData?.school_logo || null,
      grade_name: invitationData?.grade_name || null,
      learner_name: invitationData?.learner_number || invitationData?.learner_numbers?.[0] || null,
    };

    return (
      <>
        <Head>
          <title>{`${schoolName} - Parent Portal`}</title>
          <meta name="description" content={`You've been invited to join ${schoolName}'s parent portal. stay connected with your child's education.`} />
          <meta property="og:title" content={`${schoolName} - Parent Portal`} />
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <AuthGate
          invitationData={authGateInvitation}
          returnTo={`/parent/${encodeURIComponent(school_slug)}`}
        />
      </>
    );
  }

  // --- RENDERING FOR AUTHENTICATED (DASHBOARD) ---
  const displayName = initialProfile?.primary_school_name || schoolName || 'Your School';

  if (error && !initialProfile) {
    return (
      <FrontPageLayout user={null}>
         <div className="p-8 text-center bg-red-50 text-red-700 rounded-lg m-8">
           <h2 className="text-xl font-bold mb-2">Notice</h2>
           <p>{error}</p>
           <button
             onClick={() => window.location.href = '/parent'}
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
        <title>{`${displayName} - Dashboard | Parent Portal`}</title>
        <meta name="description" content={`Access student reports, attendance, and school announcements for ${displayName}.`} />
      </Head>

      <FrontPageLayout user={initialProfile} userRoles={["parent"]}>
        <ParentDashboard
          user={initialProfile}
          profile={initialProfile}
          learners={initialLearners}
        />
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
