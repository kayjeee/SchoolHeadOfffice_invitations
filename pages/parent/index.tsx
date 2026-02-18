// pages/parent/index.tsx
import React, { useEffect } from "react";
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
import { useAppTheme } from "../../components/Layouts/context/ThemeContext";
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
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      // If onboarding is complete, redirect to the school-specific dashboard
      if (profile?.needsOnboarding === false && learners && learners.length > 0) {
        const primaryLearner = learners[0];
        const schoolSlug = primaryLearner.school_slug || slugify(primaryLearner.school_name || "school");

        return {
          redirect: {
            destination: `/parent/${schoolSlug}`,
            permanent: false,
          },
        };
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

  const { currentSchool } = useAppTheme();

  // Client-side redirect if onboarding is complete
  useEffect(() => {
    if (onboarding.isOnboardingComplete && !onboarding.isLoading) {
      console.log("🔄 Onboarding complete, checking for school slug for redirect...");
      const primaryLearner = onboarding.learners?.[0];
      let schoolSlug = primaryLearner?.school_slug || (primaryLearner?.school_name ? slugify(primaryLearner.school_name) : null);

      if (!schoolSlug && props.invitationData?.school_slug) {
        schoolSlug = props.invitationData.school_slug;
        console.log("🔄 Using school slug from invitation data:", schoolSlug);
      } else if (!schoolSlug && props.invitationData?.school_name) {
        schoolSlug = slugify(props.invitationData.school_name);
        console.log("🔄 Slugified school name from invitation data:", schoolSlug);
      } else if (!schoolSlug && props.school) {
        schoolSlug = slugify(props.school);
        console.log("🔄 Using school from props:", schoolSlug);
      } else if (!schoolSlug && currentSchool?.schoolName) {
        schoolSlug = slugify(currentSchool.schoolName);
        console.log("🔄 Using school name from ThemeContext:", schoolSlug);
      } else if (!schoolSlug && currentSchool?.name) {
        schoolSlug = slugify(currentSchool.name);
        console.log("🔄 Using school name (alt) from ThemeContext:", schoolSlug);
      }

      // If we STILL don't have a slug but onboarding is complete, use a default fallback
      // to ensure we get off the /parent URL as requested.
      if (!schoolSlug && onboarding.isOnboardingComplete) {
        schoolSlug = "dashboard";
        console.log("🔄 No school slug found, using default fallback: dashboard");
      }

      if (schoolSlug) {
        console.log(`🚀 Redirecting to school dashboard: /parent/${schoolSlug}`);
        window.location.href = `/parent/${schoolSlug}`;
      } else {
        console.warn("⚠️ Onboarding complete but no school slug found for redirect.");
      }
    }
  }, [onboarding.isOnboardingComplete, onboarding.isLoading, onboarding.learners, props.invitationData]);

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
          // If we are here, it means redirection is either in progress or failed to find a slug
          // We show a loading screen but provide a manual fallback if it takes too long
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <LoadingScreen message="Redirecting to your school dashboard..." />
            {onboarding.learners?.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 mb-4">Taking too long? Click below to access your dashboard directly.</p>
                <button
                  onClick={() => {
                    const primaryLearner = onboarding.learners?.[0];
                    const schoolSlug = primaryLearner?.school_slug ||
                                     (primaryLearner?.school_name ? slugify(primaryLearner.school_name) :
                                     (props.school ? slugify(props.school) :
                                     (currentSchool?.schoolName ? slugify(currentSchool.schoolName) :
                                     (currentSchool?.name ? slugify(currentSchool.name) : "dashboard"))));
                    window.location.href = `/parent/${schoolSlug}`;
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
            {onboarding.learners?.length === 0 && !onboarding.isLoading && (
              <div className="mt-8 text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200 max-w-md">
                <p className="text-yellow-800 font-semibold mb-2">No linked learners found</p>
                <p className="text-yellow-700 text-sm mb-4">
                  We couldn't find any learners linked to your account. You may need to link a learner to see your dashboard.
                </p>
                <ParentDashboard
                  user={onboarding.user}
                  profile={onboarding.profile}
                  learners={[]}
                />
              </div>
            )}
          </div>
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
