// pages/parent/index.tsx
import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dynamic from "next/dynamic";
import Head from "next/head";

import ErrorBoundary from "../../components/common/ErrorBoundary";
import LoadingScreen from "../../components/common/LoadingScreen";
import ParentDashboard from "../../components/parent/Dashboard/ParentDashboard";
import AuthGate from "../../components/auth/AuthGate";

import { InvitationService } from "../../lib/services/invitation.service";
import { ParentService } from "../../lib/services/parent.service";
import { useParentOnboarding } from "../../lib/hooks/useParentOnboarding";

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
  grade_name?: string;
  parent_phone?: string;
  school?: { id: string; name: string; slug: string };
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
    console.log('📨 [getServerSideProps] Invitation token detected:', token);
    let invitationData = null;
    let error = null;

    try {
      const verified = await InvitationService.verifyToken(token);
      console.log('📨 [getServerSideProps] Token verified result:', JSON.stringify(verified, null, 2));

      if (verified.success || verified.status === 'success') {
        invitationData = { id: token, token, ...verified };
      } else {
        console.warn('📨 [getServerSideProps] Verification returned success:false');
        error = "This invitation may have already been used or expired.";
      }
    } catch (err: any) {
      console.error('❌ [getServerSideProps] Verification error:', err.message);
      error = "Could not verify your invitation. You can still sign in to check your account.";
    }

    return {
      props: {
        isAuthenticated: false,
        invitationToken: token,
        invitationData,
        school,
        error,
      },
    };
  }

  // ─── Logged in user ───────────────────────────────────────
  if (session?.user) {
    try {
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      let invitationData = null;
      if (token) {
        try {
          const verified = await InvitationService.verifyToken(token);
          invitationData = { id: token, token, ...verified };
        } catch (e) {
          console.error("Failed to verify token for logged-in user", e);
        }
      }

      return {
        props: {
          isAuthenticated: true,
          initialProfile: profile || null,
          initialLearners: learners || [],
          invitationToken: token,
          invitationData,
          school,
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
  // ✅ Initialize onboarding hook at top level (Rules of Hooks)
  // Merge school name from query param into invitation context for onboarding
  const mergedInvitationData = React.useMemo(() => {
    if (!props.invitationData && !props.school) return props.invitationData;
    return {
      ...props.invitationData,
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: props.invitationData?.school_name || props.invitationData?.school?.name || (typeof props.school === 'string' ? props.school : undefined)
    };
  }, [props.invitationData, props.school, props.invitationToken]);

  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
    invitationData: mergedInvitationData as any,
  });

  // 🚫 Logged out → SHOW LOGIN / LANDING IMMEDIATELY
  if (!props.isAuthenticated) {
    // Map invitation data to AuthGate format
    // We prioritize invitationData but fall back to the school query param
    const authGateInvitation = {
      token: props.invitationData?.token || (typeof props.invitationToken === 'string' ? props.invitationToken : undefined),
      school_name: props.invitationData?.school_name || props.invitationData?.school?.name || (typeof props.school === 'string' ? props.school : undefined),
      learner_name: props.invitationData?.learners?.[0]?.name,
    };

    return (
      <AuthGate
        invitationData={authGateInvitation}
        returnTo="/parent"
      />
    );
  }

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
            invitationData={mergedInvitationData}
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

