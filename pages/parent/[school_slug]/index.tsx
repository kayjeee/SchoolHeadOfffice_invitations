// pages/parent/[school_slug]/index.tsx
import React, { useMemo } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";

import ErrorBoundary from "../../../components/common/ErrorBoundary";
import LoadingScreen from "../../../components/common/LoadingScreen";
import ParentDashboard from "../../../components/parent/Dashboard/ParentDashboard";

import { ParentService } from "../../../lib/services/parent.service";
import { useParentOnboarding } from "../../../lib/hooks/useParentOnboarding";
import { slugify } from "../../../lib/utils/slugify";

/* -------------------------------------------------------------------------- */
/*                                  DYNAMIC                                   */
/* -------------------------------------------------------------------------- */

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface SchoolDashboardProps {
  isAuthenticated: boolean;
  school_slug: string;
  initialProfile?: any | null;
  initialLearners?: any[];
  error?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                               SERVER SIDE                                  */
/* -------------------------------------------------------------------------- */

export const getServerSideProps: GetServerSideProps<
  SchoolDashboardProps
> = async (context) => {
  const session = await getSession(context.req, context.res);
  const { school_slug } = context.params as { school_slug: string };

  // ─── Logged in user ───────────────────────────────────────
  if (session?.user) {
    try {
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      // If onboarding is not complete, redirect to /parent
      if (profile?.needsOnboarding !== false) {
        return {
          redirect: {
            destination: "/parent",
            permanent: false,
          },
        };
      }

      return {
        props: {
          isAuthenticated: true,
          school_slug,
          initialProfile: profile || null,
          initialLearners: learners || [],
        },
      };
    } catch (error) {
      console.error("Error in School Dashboard getServerSideProps:", error);
      return {
        props: {
          isAuthenticated: true,
          school_slug,
          error: "Failed to load your profile.",
        },
      };
    }
  }

  // ─── Fully logged out ─────────────────────────────────────
  return {
    props: {
      isAuthenticated: false,
      school_slug,
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function SchoolParentDashboard(props: SchoolDashboardProps) {
  const router = useRouter();

  // 🚫 Logged out → SHOW LOGIN / LANDING IMMEDIATELY
  if (!props.isAuthenticated) {
    return <LandingPage school_slug={props.school_slug} />;
  }

  // ✅ Logged in
  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
  });

  // Filter learners by school slug
  const filteredLearners = useMemo(() => {
    if (!onboarding.learners) return [];
    return onboarding.learners.filter((learner: any) => {
      const learnerSchoolSlug = learner.school_slug || slugify(learner.school_name || "");
      return learnerSchoolSlug === props.school_slug;
    });
  }, [onboarding.learners, props.school_slug]);

  if (onboarding.isLoading) {
    return <LoadingScreen message="Loading your parent portal..." />;
  }

  if (props.error) {
    return <div className="p-8 text-center">{props.error}</div>;
  }

  // If no learners found for this school, we might want to show a message or redirect
  // But for now, let's just pass them to the dashboard which handles empty states

  const schoolName = filteredLearners.length > 0
    ? filteredLearners[0].school_name
    : props.school_slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <ErrorBoundary>
      <Head>
        <title>{schoolName} | Parent Portal</title>
      </Head>
      <FrontPageLayout user={onboarding.user} userRoles={["parent"]}>
        <ParentDashboard
          user={onboarding.user}
          profile={onboarding.profile}
          learners={filteredLearners}
        />
      </FrontPageLayout>
    </ErrorBoundary>
  );
}

/* -------------------------------------------------------------------------- */
/*                                LANDING PAGE                                */
/* -------------------------------------------------------------------------- */

function LandingPage({ school_slug }: { school_slug: string }) {
  const returnTo = `/parent/${school_slug}`;

  return (
    <>
      <Head>
        <title>Parent Portal | {school_slug}</title>
        <meta name="description" content={`Access the parent portal for ${school_slug}. View learner progress, school notices, and more.`} />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Parent Portal</h1>
          <p className="text-gray-600 mb-6">
            Sign in to view school notices, learner progress, and important updates for your school.
          </p>

          <a
            href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Sign In
          </a>
        </div>
      </div>
    </>
  );
}
