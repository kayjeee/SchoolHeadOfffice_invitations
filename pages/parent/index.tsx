// pages/parent/index.tsx

import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import ErrorBoundary from "../../components/common/ErrorBoundary";
import LoadingScreen from "../../components/common/LoadingScreen";
import ParentDashboard from "../../components/parent/Dashboard/ParentDashboard";
import AuthGate from "../../components/auth/AuthGate";

import { InvitationAPI, InvitationData } from "../../lib/api/invitation-api";
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
  console.log("=================================================");
  console.log("🌍 [GSSP] Parent Page Request Start");
  console.log("Query:", context.query);
  console.log("=================================================");

  const session = await getSession(context.req, context.res);

  const rawToken =
    typeof context.query.token === "string"
      ? context.query.token
      : null;

  const token = rawToken
    ? rawToken.split("&")[0].split("\\u0026")[0].trim()
    : null;

  let school =
    typeof context.query.school === "string"
      ? context.query.school
      : null;

  if (!school && rawToken?.includes("\\u0026school=")) {
    school = rawToken.split("\\u0026school=")[1].split("&")[0];
    school = decodeURIComponent(school.replace(/\+/g, " "));
  }

  console.log("🔑 [GSSP] Token Debug:", {
    rawToken,
    sanitizedToken: token,
    schoolFromQuery: school,
    isLoggedIn: !!session?.user,
  });

  /* ---------------------------- INVITATION ONLY --------------------------- */

  if (!session?.user && token) {
    console.log("📨 [GSSP] Logged OUT with invitation token");

    let invitationData = null;
    let error = null;

    try {
      invitationData = await InvitationAPI.verifyToken(token);
      console.log("✅ [GSSP] Invitation Verified:", invitationData);
    } catch (err: any) {
      console.error("❌ [GSSP] Invitation Verification Failed:", err);
      error =
        "Could not verify your invitation. You can still sign in.";
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

  /* ------------------------------ LOGGED IN ------------------------------- */

  if (session?.user) {
    console.log("👤 [GSSP] Logged-in User:", session.user.sub);

    try {
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      console.log("📦 [GSSP] Loaded Profile + Learners:", {
        profile,
        learnersCount: learners?.length,
      });

      let invitationData = null;

      if (token) {
        try {
          invitationData = await InvitationAPI.verifyToken(token);
        } catch (e) {
          console.error("❌ Token verify failed (logged-in)", e);
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
    } catch (err) {
      console.error("❌ [GSSP] Profile Load Failed:", err);
      return {
        props: {
          isAuthenticated: true,
          error: "Failed to load your profile.",
        },
      };
    }
  }

  /* ------------------------------ FULLY OUT ------------------------------- */

  console.log("🚪 [GSSP] Fully logged out, no invitation");
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
  const router = useRouter();

  console.log("🏠 [PAGE RENDER START]", {
    isAuthenticated: props.isAuthenticated,
    invitationToken: props.invitationToken,
    schoolQuery: props.school,
    hasInvitationData: !!props.invitationData,
  });

  /* ------------------------- MERGE INVITATION DATA ------------------------ */

  const mergedInvitationData = React.useMemo(() => {
    const merged = {
      ...props.invitationData,
      token:
        props.invitationData?.token ||
        props.invitationToken ||
        undefined,
      school_name:
        props.invitationData?.school_name ||
        props.school ||
        undefined,
    };

    console.log("🧩 Merged Invitation Data:", merged);

    return merged;
  }, [props.invitationData, props.school, props.invitationToken]);

  /* ---------------------------- ONBOARDING HOOK --------------------------- */

  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
    invitationData: mergedInvitationData as any,
  });

  console.log("📊 [ONBOARDING STATE]", {
    isOnboardingComplete: onboarding.isOnboardingComplete,
    isLoading: onboarding.isLoading,
    learners: onboarding.learners,
    profile: onboarding.profile,
    onboardingData: onboarding.onboardingData,
  });

  /* ------------------------------- REDIRECT ------------------------------- */

  React.useEffect(() => {
    console.log("🔄 [REDIRECT CHECK] Running...");

    const shouldRedirect =
      props.isAuthenticated &&
      onboarding.isOnboardingComplete &&
      !onboarding.isLoading;

    if (!shouldRedirect) {
      console.log("⏳ Not redirecting yet:", {
        isAuthenticated: props.isAuthenticated,
        isOnboardingComplete:
          onboarding.isOnboardingComplete,
        isLoading: onboarding.isLoading,
      });
      return;
    }

    const fromLearner =
      onboarding.learners?.[0]?.school_name;
    const fromProfile =
      onboarding.profile?.primary_school_name;
    const fromOnboarding =
      onboarding.onboardingData?.school_name;
    const fromInvitation =
      props.invitationData?.school_name;
    const fromQuery = props.school;
    const fromMerged =
      mergedInvitationData?.school_name;

    const schoolName =
      fromLearner ||
      fromProfile ||
      fromOnboarding ||
      fromInvitation ||
      fromQuery ||
      fromMerged ||
      "School";

    console.log("=================================================");
    console.log("🚀🚀🚀 FINAL SCHOOL NAME RESOLUTION 🚀🚀🚀");
    console.log("fromLearner:", fromLearner);
    console.log("fromProfile:", fromProfile);
    console.log("fromOnboarding:", fromOnboarding);
    console.log("fromInvitation:", fromInvitation);
    console.log("fromQuery:", fromQuery);
    console.log("fromMerged:", fromMerged);
    console.log("👉 FINAL schoolName:", schoolName);
    console.log("=================================================");

    if (
      schoolName === "School" &&
      onboarding.learners?.length === 0
    ) {
      console.warn(
        "⚠️ Fallback schoolName detected — waiting for learners."
      );
      return;
    }

    const targetPath = `/parent/${encodeURIComponent(
      schoolName
    )}`;

    console.log("🚀 Redirecting to:", targetPath);

    router.replace(targetPath);
  }, [
    onboarding.isOnboardingComplete,
    onboarding.isLoading,
    onboarding.learners,
    onboarding.profile,
    onboarding.onboardingData,
    props.invitationData,
    props.school,
    props.isAuthenticated,
    mergedInvitationData,
    router,
  ]);

  /* ------------------------------ LOGGED OUT ------------------------------ */

  if (!props.isAuthenticated) {
    const schoolName =
      props.invitationData?.school_name ||
      props.school;

    const dynamicReturnTo = schoolName
      ? `/parent/${encodeURIComponent(schoolName)}`
      : "/parent";

    console.log("🔐 Rendering AuthGate", {
      schoolName,
      returnTo: dynamicReturnTo,
    });

    return (
      <AuthGate
        invitationData={mergedInvitationData as any}
        returnTo={dynamicReturnTo}
      />
    );
  }

  if (onboarding.isLoading) {
    return (
      <LoadingScreen message="Loading your parent portal..." />
    );
  }

  if (props.error) {
    return (
      <div className="p-8 text-center">
        {props.error}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <FrontPageLayout
        user={onboarding.user}
        userRoles={["parent"]}
      >
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