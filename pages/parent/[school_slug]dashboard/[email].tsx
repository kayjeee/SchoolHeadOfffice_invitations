// pages/parent/[school_slug]dashboard/[email].tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getSession } from "@auth0/nextjs-auth0";

import { ParentService } from "../../../lib/services/parent.service";
import AuthGate from "../../../components/auth/AuthGate";
import ParentDashboard from "../../../components/parent/Dashboard/ParentDashboard";
import ErrorBoundary from "../../../components/common/ErrorBoundary";

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface ParentDashboardProps {
  school_slug: string;
  schoolName: string;
  email: string;
  isAuthenticated: boolean;
  initialProfile: any | null;
  initialLearners: any[];
  error?: string | null;
}

export const getServerSideProps: GetServerSideProps<ParentDashboardProps> = async (context) => {
  const { school_slug, email } = context.params as { school_slug: string; email: string };
  const session = await getSession(context.req, context.res);

  // Extract school name from the concatenated segment if needed, e.g. "Far North Secondary Schooldashboard" -> "Far North Secondary School"
  let schoolName = school_slug;
  if (schoolName && schoolName.endsWith('dashboard')) {
    schoolName = schoolName.substring(0, schoolName.length - 'dashboard'.length);
  }

  // schoolName is unencoded so spaces appear literally, but we decode just in case
  schoolName = decodeURIComponent(schoolName.replace(/\+/g, ' '));
  const decodedEmail = decodeURIComponent(email.replace(/\+/g, ' '));

  console.log(`🏫 [ParentDashboardPage.GSSP] slug: ${school_slug}, school: ${schoolName}, email: ${decodedEmail}`);

  // --- CASE 1: UNAUTHENTICATED ---
  if (!session?.user) {
    return {
      props: {
        school_slug,
        schoolName,
        email: decodedEmail,
        isAuthenticated: false,
        initialProfile: null,
        initialLearners: [],
      },
    };
  }

  // --- CASE 2: AUTHENTICATED ---
  try {
    const userId = session.user.sub;
    console.log(`👤 [ParentDashboardPage.GSSP] Authenticated user: ${userId}`);

    // Synchronize parent user & role first
    await ParentService.syncParentRole(userId, session.user.email, session.user.name);

    const [profile, learners] = await Promise.all([
      ParentService.getProfile(userId),
      ParentService.getLearners(userId),
    ]);

    // Check if the user is onboarded. If not, redirect to the onboarding flow gateway.
    const isOnboardingComplete = profile?.onboarding_status?.parent_onboarding_completed === true;

    if (!profile || !isOnboardingComplete) {
      console.log(`⏳ [ParentDashboardPage.GSSP] Onboarding incomplete for ${userId}. Redirecting to gateway.`);
      const onboardingPath = `/parent?school=${encodeURIComponent(schoolName)}`;
      return {
        redirect: {
          destination: onboardingPath,
          permanent: false,
        },
      };
    }

    // Fully onboarded - Show Dashboard
    console.log(`✅ [ParentDashboardPage.GSSP] Showing dashboard for ${schoolName}`);
    return {
      props: {
        school_slug,
        schoolName: profile.primary_school_name || schoolName,
        email: decodedEmail,
        isAuthenticated: true,
        initialProfile: profile,
        initialLearners: learners,
      },
    };

  } catch (err: any) {
    console.error('❌ [ParentDashboardPage.GSSP] Error loading dashboard data:', err.message);
    return {
      props: {
        school_slug,
        schoolName,
        email: decodedEmail,
        isAuthenticated: true,
        initialProfile: null,
        initialLearners: [],
        error: "Failed to load dashboard data."
      },
    };
  }
};

export default function ParentDashboardPage(props: ParentDashboardProps) {
  const {
    school_slug,
    schoolName,
    email,
    isAuthenticated,
    initialProfile,
    initialLearners,
    error
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
          <title>{`${schoolName} - Parent Portal`}</title>
          <meta name="description" content={`Access the parent portal for ${schoolName}.`} />
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <AuthGate
          invitationData={authGateInvitation}
          returnTo={`/parent/${encodeURIComponent(school_slug)}dashboard/${encodeURIComponent(email)}`}
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
