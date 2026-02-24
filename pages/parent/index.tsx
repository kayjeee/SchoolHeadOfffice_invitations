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
    try {
      const verified = await InvitationService.verifyToken(token);
      console.log('📨 [getServerSideProps] Token verified result:', JSON.stringify(verified, null, 2));

      if (!verified.success && verified.status !== 'success') {
         console.warn('📨 [getServerSideProps] Verification failed but didn\'t throw');
      }

      const invitationData = { id: token, token, ...verified };
      console.log('📨 [getServerSideProps] Final invitationData for props:', JSON.stringify(invitationData, null, 2));

      return {
        props: {
          isAuthenticated: false,
          invitationToken: token,
          invitationData,
          school,
        },
      };
    } catch (err: any) {
      console.error('❌ [getServerSideProps] Verification error:', err.message);
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
  // ✅ Initialize onboarding hook at top level (Rules of Hooks)
  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
    invitationData: props.invitationData,
  });

  // 🚫 Logged out → SHOW LOGIN / LANDING IMMEDIATELY
  if (!props.isAuthenticated) {
    // Map invitation data to AuthGate format
    const authGateInvitation = props.invitationData ? {
      token: props.invitationData.token,
      school_name: props.invitationData.school_name || props.invitationData.school?.name || (typeof props.school === 'string' ? props.school : undefined),
      learner_name: props.invitationData.learners?.[0]?.name,
    } : null;

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

