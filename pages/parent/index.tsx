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

import { InvitationAPI, InvitationData } from "../../lib/api/invitation-api";
import { ParentService } from "../../lib/services/parent.service";
import { useParentOnboarding } from "../../lib/hooks/useParentOnboarding";
import { useRouter } from "next/router";

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
  const session = await getSession(context.req, context.res);

  // Sanitize token to handle cases where query params are accidentally glued (e.g. via \u0026)
  const rawToken = typeof context.query.token === "string" ? context.query.token : null;
  const token = rawToken ? rawToken.split('&')[0].split('\\u0026')[0].trim() : null;

  console.log('🔍 [getServerSideProps] Query params:', context.query);
  console.log('🔑 [getServerSideProps] rawToken:', rawToken);
  console.log('🔑 [getServerSideProps] sanitized token:', token);

  let school = typeof context.query.school === "string" ? context.query.school : null;

  // Extract school if it was glued to the token via \u0026
  if (!school && rawToken && rawToken.includes('\\u0026school=')) {
    school = rawToken.split('\\u0026school=')[1].split('&')[0];
    // Replace + with spaces if present
    school = decodeURIComponent(school.replace(/\+/g, ' '));
  }

  if (rawToken && rawToken !== token) {
    console.log('🧹 [getServerSideProps] Sanitized token:', { original: rawToken, sanitized: token, extractedSchool: school });
  }

  // ─── Invitation only (logged out) ─────────────────────────
  if (!session?.user && token) {
    console.log('📨 [getServerSideProps] Invitation token detected:', token);
    let invitationData = null;
    let error = null;

    try {
      const invitation = await InvitationAPI.verifyToken(token);
      console.log('📨 [getServerSideProps] Token verified result:', JSON.stringify(invitation, null, 2));
      invitationData = invitation;
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
    console.log('👤 [getServerSideProps] Logged-in user:', session.user.sub);
    try {
      // ✅ Synchronize user & assign 'parent' role on DB and Auth0
      await ParentService.syncParentRole(session.user.sub, session.user.email, session.user.name);

      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      // Check onboarding completion on server-side (Requirement 3: Redirect guard)
      const isOnboardingComplete = profile?.onboarding_status?.parent_onboarding_completed === true;

      if (isOnboardingComplete) {
        const fromLearner = learners?.[0]?.school_name;
        const fromProfile = profile?.primary_school_name;
        const fromOnboarding = profile?.onboarding_status?.client_metadata?.upload_learners_metadata?.school_id;

        let finalSchoolName = fromLearner || fromProfile || fromOnboarding || 'Far North Secondary School';
        if (!finalSchoolName || finalSchoolName === 'School') {
          finalSchoolName = 'Far North Secondary School';
        }

        const email = profile?.email || session.user.email || '';
        const emailEncoded = encodeURIComponent(email);
        const destination = `/parent/${finalSchoolName}dashboard/${emailEncoded}`;

        console.log(`🚀 [ParentGSSP] Redirecting completed parent directly to: ${destination}`);
        return {
          redirect: {
            destination,
            permanent: false,
          },
        };
      }

      let invitationData = null;
      if (token) {
        console.log('📨 [getServerSideProps] Logged-in user with token, verifying...');
        try {
          invitationData = await InvitationAPI.verifyToken(token);
        } catch (e) {
          console.error("❌ [getServerSideProps] Failed to verify token for logged-in user", e);
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
  const router = useRouter();

  console.log('🏠 [ParentPage] Render start. Props:', {
    isAuthenticated: props.isAuthenticated,
    invitationToken: props.invitationToken ? `${props.invitationToken.substring(0, 8)}...` : 'NONE',
    school: props.school,
    hasInvitationData: !!props.invitationData,
    invitationDataSchool: props.invitationData?.school_name
  });

  // ✅ Initialize onboarding hook at top level (Rules of Hooks)
  // Merge school name from query param into invitation context for onboarding
  const mergedInvitationData = React.useMemo(() => {
    if (!props.invitationData && !props.school) return props.invitationData;
    return {
      ...props.invitationData,
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: props.invitationData?.school_name || (typeof props.school === 'string' ? props.school : undefined)
    };
  }, [props.invitationData, props.school, props.invitationToken]);

  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
    invitationData: mergedInvitationData as any,
  });

  // 🚀 Redirect to school-specific dashboard if onboarding is complete
  React.useEffect(() => {
    // If we're fully logged in and onboarded, we need school context before redirecting
    const shouldRedirect = props.isAuthenticated && onboarding.isOnboardingComplete && !onboarding.isLoading;

    if (!shouldRedirect) return;

    // Prioritize the linked learner's school name, then profile, then onboarding data, then invitation props
    const fromLearner = onboarding.learners?.[0]?.school_name;
    const fromProfile = onboarding.profile?.primary_school_name;
    const fromOnboarding = onboarding.onboardingData?.school_name;
    const fromInvitation = props.invitationData?.school_name;
    const fromQuery = props.school;
    const fromMerged = mergedInvitationData?.school_name;

    let schoolName = fromLearner || fromProfile || fromOnboarding || fromInvitation || fromQuery || fromMerged || 'School';

    if (schoolName === 'School' && !onboarding.isLoading) {
       // If we are onboarded but have no learners yet, they might still be fetching via SWR/React Query
       if (onboarding.learners?.length === 0) return;
    }

    // Default to 'Far North Secondary School' if school name is 'School' or empty
    if (!schoolName || schoolName === 'School') {
      schoolName = 'Far North Secondary School';
    }

    const parentName = onboarding.profile?.name || onboarding.user?.name || 'Parent';

    // We use router.replace to avoid adding the intermediate /parent to history
    const targetPath = `/parent/${encodeURIComponent(schoolName)}/dashboard/${encodeURIComponent(parentName)}`;
    console.log('🚀 [ParentPage] Onboarding complete. Navigating to:', targetPath);
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
    router
  ]);

  // 🚫 Logged out → SHOW LOGIN / LANDING IMMEDIATELY
  if (!props.isAuthenticated) {
    // Map invitation data to AuthGate format
    // We prioritize invitationData but fall back to the school query param
    const schoolName = props.invitationData?.school_name || props.school;
    const authGateInvitation = {
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: schoolName || undefined,
      school_logo: props.invitationData?.school_logo || null,
      grade_name: props.invitationData?.grade_name || null,
      learner_name: props.invitationData?.learner_number || props.invitationData?.learner_numbers?.[0],
    };

    // Construct a dynamic returnTo path to the nested school route if a school name is present
    const dynamicReturnTo = schoolName
      ? `/parent/${encodeURIComponent(schoolName)}`
      : "/parent";

    console.log('🏠 [ParentPage] Logged out. Rendering AuthGate:', {
      hasInvitation: !!authGateInvitation.token,
      schoolName,
      dynamicReturnTo,
      invitationDetails: authGateInvitation
    });

    return (
      <AuthGate
        invitationData={authGateInvitation as any}
        returnTo={dynamicReturnTo}
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
