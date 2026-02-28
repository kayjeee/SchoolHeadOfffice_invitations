// pages/parent/[school_slug]/index.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getSession } from "@auth0/nextjs-auth0";

import { ParentService } from "../../../lib/services/parent.service";
import ErrorBoundary from "../../../components/common/ErrorBoundary";
import LoadingScreen from "../../../components/common/LoadingScreen";
import ParentDashboard from "../../../components/parent/Dashboard/ParentDashboard";

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface SchoolDashboardProps {
  school_slug: string;
  isAuthenticated: boolean;
  initialProfile: any | null;
  initialLearners: any[];
  error?: string | null;
}

export const getServerSideProps: GetServerSideProps<SchoolDashboardProps> = async (context) => {
  const { school_slug } = context.params as { school_slug: string };
  const session = await getSession(context.req, context.res);

  if (!session?.user) {
    // Redirect to parent root if not authenticated
    return {
      redirect: {
        destination: `/parent?school=${encodeURIComponent(school_slug)}`,
        permanent: false,
      },
    };
  }

  try {
    const [profile, learners] = await Promise.all([
      ParentService.getProfile(session.user.sub),
      ParentService.getLearners(session.user.sub),
    ]);

    // If they haven't onboarded yet, send them back to /parent where the flow is
    // We check for needsOnboarding if available, or just presence of profile
    if (!profile) {
       return {
        redirect: {
          destination: `/parent?school=${encodeURIComponent(school_slug)}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        school_slug,
        isAuthenticated: true,
        initialProfile: profile,
        initialLearners: learners || [],
      },
    };
  } catch (err: any) {
    console.error('❌ [SchoolDashboard.getServerSideProps] Error:', err.message);
    return {
      props: {
        school_slug,
        isAuthenticated: true,
        initialProfile: null,
        initialLearners: [],
        error: "Failed to load dashboard data."
      },
    };
  }
};

export default function SchoolDashboardPage({
  school_slug,
  initialProfile,
  initialLearners,
  error
}: SchoolDashboardProps) {
  console.log('🏛️ [SchoolDashboardPage] Rendered with school_slug:', school_slug);

  const displayName = school_slug === 'School' ? 'Your School' : decodeURIComponent(school_slug);

  if (error) {
    return (
      <FrontPageLayout user={initialProfile}>
         <div className="p-8 text-center bg-red-50 text-red-700 rounded-lg m-8">
           <h2 className="text-xl font-bold mb-2">Error</h2>
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
        <title>{`${displayName} - Parent Portal Dashboard`}</title>
        <meta name="description" content={`Access student reports, attendance, and school announcements for ${displayName}.`} />
      </Head>

      <FrontPageLayout user={initialProfile} userRoles={["parent"]}>
        <ParentDashboard
          user={initialProfile} // ParentDashboard expects user object, often same as profile here
          profile={initialProfile}
          learners={initialLearners}
        />
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
