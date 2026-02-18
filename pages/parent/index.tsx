// pages/parent/index.tsx
import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dynamic from "next/dynamic";
import Head from "next/head";

import ErrorBoundary from "../../components/common/ErrorBoundary";
import LoadingScreen from "../../components/common/LoadingScreen";
import ParentDashboard from "../../components/parent/Dashboard/ParentDashboard";

import { InvitationService } from "../../lib/services/invitation.service";
import { ParentService } from "../../lib/services/parent.service";
import { useParentOnboarding } from "../../lib/hooks/useParentOnboarding";
import { slugify } from "../../lib/utils/slugify";

/* -------------------------------------------------------------------------- */
/*                                  DYNAMIC                                   */
/* -------------------------------------------------------------------------- */

const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

const OnboardingFlow = dynamic(
  () => import("../../components/parent/Onboarding/OnboardingFlow"),
  { ssr: false }
);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface InvitationData {
  id: string;
  token?: string;
  school_slug?: string;
  school_name?: string;
  parent_phone?: string;
  learners?: { id: string; name: string; grade?: string }[];
}

interface ParentPageProps {
  isAuthenticated: boolean;
  invitationToken?: string | null;
  invitationData?: InvitationData | null;
  initialProfile?: any | null;
  initialLearners?: any[];
  school?: string | null;
  error?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                               SERVER SIDE                                  */
/* -------------------------------------------------------------------------- */

export const getServerSideProps: GetServerSideProps<
  ParentPageProps
> = async (context) => {
  const session = await getSession(context.req, context.res);
  const token =
    typeof context.query.token === "string" ? context.query.token : null;
  const school =
    typeof context.query.school === "string" ? context.query.school : null;

  // ─── Invitation only (logged out) ─────────────────────────
  if (!session?.user && token) {
    try {
      const verified = await InvitationService.verifyToken(token);
      if (!verified.success) throw new Error();

      return {
        props: {
          isAuthenticated: false,
          invitationToken: token,
          invitationData: { id: token, token, ...verified },
          school,
        },
      };
    } catch {
      return {
        props: {
          isAuthenticated: false,
          error: "Invalid or expired invitation link.",
        },
      };
    }
  }

  // ─── Logged in user ───────────────────────────────────────
  if (session?.user) {
    try {
      const [profile, learners] = (await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ])) as [any, any[]];

      // Fix 3: Treat missing needsOnboarding as "complete" if learners exist
      const onboardingDone =
        profile?.needsOnboarding === false ||
        profile?.onboarding_completed === true ||
        profile?.parent_onboarding_completed === true ||
        (!profile?.needsOnboarding && learners && learners.length > 0);

      if (onboardingDone && learners && learners.length > 0) {
        const firstLearner = learners[0];
        const schoolSlug = firstLearner.school_slug ||
                          (firstLearner.school_name ? slugify(firstLearner.school_name) : null);

        if (schoolSlug) {
          return {
            redirect: {
              destination: `/parent/${schoolSlug}`,
              permanent: false,
            },
          };
        }
      }

      return {
        props: {
          isAuthenticated: true,
          initialProfile: profile || null,
          initialLearners: learners || [],
        },
      };
    } catch {
      return {
        props: {
          isAuthenticated: true,
          error: "Failed to load your profile.",
        },
      };
    }
  }

  // ─── Fully logged out ─────────────────────────────────────
  return {
    props: {
      isAuthenticated: false,
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function ParentPage(props: ParentPageProps) {
  // 🚫 Logged out → SHOW LOGIN / LANDING IMMEDIATELY
  if (!props.isAuthenticated) {
    return <LandingPage invitationToken={props.invitationToken} school={props.school} />;
  }

  // ✅ Logged in → now onboarding hook is safe to run
  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
    invitationData: props.invitationData,
  });

  if (onboarding.isLoading) {
    return <LoadingScreen message="Loading your parent portal..." />;
  }

  if (props.error) {
    return <div className="p-8 text-center">{props.error}</div>;
  }

  return (
    <ErrorBoundary>
      <FrontPageLayout user={onboarding.user} userRoles={["parent"]}>
        {!onboarding.isOnboardingComplete ? (
          <OnboardingFlow
            user={onboarding.user}
            invitationData={props.invitationData}
          />
        ) : (
          <ParentDashboard
            user={onboarding.user}
            profile={onboarding.profile}
            learners={onboarding.learners}
          />
        )}
      </FrontPageLayout>
    </ErrorBoundary>
  );
}

/* -------------------------------------------------------------------------- */
/*                                LANDING PAGE                                */
/* -------------------------------------------------------------------------- */

function LandingPage({ invitationToken, school }: any) {
  const returnTo = invitationToken
    ? `/parent?token=${invitationToken}${school ? `&school=${school}` : ""}`
    : "/parent";

  return (
    <>
      <Head>
        <title>Parent Portal</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Parent Portal</h1>
          <p className="text-gray-600 mb-6">
            Sign in to view school notices, learner progress, and important updates.
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
