// pages/parent/index.tsx
import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Head from "next/head";
import dynamic from "next/dynamic";

import { useParentOnboarding } from "../../lib/hooks/useParentOnboarding";
import { useResponsive } from "../../lib/hooks/useResponsive";
import { InvitationService } from "../../lib/services/invitation.service";
import { ParentService } from "../../lib/services/parent.service";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import LoadingScreen from "../../components/common/LoadingScreen";
import AuthGate from "../../components/auth/AuthGate";
import ParentDashboard from "../../components/parent/Dashboard/ParentDashboard";

// ✅ ONLY dynamic imports - removed conflicting static imports
const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { 
    loading: () => <LoadingScreen message="Loading layout..." />,
    ssr: true
  }
);

const FrontPageLayoutMobileView = dynamic(
  () => import("../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView"),
  { 
    loading: () => <LoadingScreen message="Loading mobile layout..." />,
    ssr: true
  }
);

const OnboardingFlow = dynamic(
  () => import("../../components/parent/Onboarding/OnboardingFlow"),
  { 
    loading: () => <LoadingScreen message="Loading onboarding..." />,
    ssr: false
  }
);

// -----------------------
// Types
// -----------------------
interface InvitationData {
  id: string;
  token?: string;
  school_slug?: string;
  school_name?: string;
  parent_phone?: string;
  learner_name?: string;
  [key: string]: any;
}

interface ParentPageProps {
  invitationToken?: string | null;
  invitationData?: InvitationData | null;
  initialProfile?: any | null;
  initialLearners?: any[];
  school?: string | null;
  error?: string | null;
}

// -----------------------
// SERVER-SIDE
// -----------------------
export const getServerSideProps: GetServerSideProps<ParentPageProps> = async (context) => {
  const session = await getSession(context.req, context.res);
  const rawToken = context.query.token;
  const rawSchool = context.query.school;

  const token = typeof rawToken === "string" ? rawToken : null;
  const school = typeof rawSchool === "string" ? rawSchool : null;

  // CASE: magic link token present
  if (token) {
    try {
      // Verify token and fetch invitation payload
      const verifiedInvitation = await InvitationService.verifyToken(token);
      let invitationData: any = null;

      if (verifiedInvitation.success) {
        // Create a new object that conforms to the InvitationData interface
        invitationData = {
          token: token,
          school_slug: school || undefined,
        };

        // If user is already authenticated, link invitation immediately
        if (session?.user) {
          // Since we don't have an invitation ID, we can't link it.
          // We can proceed to the onboarding flow directly.
          // Redirect to same page with start_onboarding to trigger client onboarding flow
          return {
            redirect: {
              destination: `/parent?token=${encodeURIComponent(token)}&school=${encodeURIComponent(
                invitationData.school_slug || school || ""
              )}&start_onboarding=true`,
              permanent: false,
            },
          };
        }
      } else {
        // If verification fails, throw an error to trigger the catch block
        throw new Error("Invitation verification failed as per API response.");
      }

      // Not logged in: show AuthGate + pass invitation data to client
      return {
        props: {
          invitationToken: token,
          invitationData,
          school: invitationData.school_slug || school || null,
        },
      };
    } catch (err) {
      console.error("Invitation verification failed:", err);
      return {
        props: {
          error: "Invalid or expired invitation link.",
        },
      };
    }
  }

  // CASE: authenticated user with no token -> fetch profile and learners
  if (session?.user) {
    try {
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      return {
        props: {
          initialProfile: profile || null,
          initialLearners: learners || [],
        },
      };
    } catch (err) {
      console.error("Error loading parent profile:", err);
      return {
        props: {
          error: "We could not load your parent profile. Please try again later.",
        },
      };
    }
  }

  // CASE: no token, not logged in -> show login screen with no invitation
  return {
    props: {},
  };
};

// -----------------------
// CLIENT-SIDE
// -----------------------
export default function ParentPage({
  invitationToken,
  invitationData,
  initialProfile,
  initialLearners = [],
  school,
  error: serverError,
}: ParentPageProps) {
  const { isMobile } = useResponsive();

  // Centralized onboarding hook receives any initial data
  const {
    user,
    isLoading,
    isOnboardingComplete,
    profile,
    learners,
    currentStep,
    error: clientError,
    setInvitationPrefill, // optional helper (see hook improvements below)
  } = useParentOnboarding({
    initialProfile,
    initialLearners,
  });

  // Persist invitationData to sessionStorage so it survives client navigations/refreshes
  // This helps when Auth0 redirects back and URL params might be lost client-side.
  useEffect(() => {
    try {
      if (invitationData) {
        // store a minimal safe payload (avoid storing secrets)
        const safe = {
          token: invitationData.token,
          school_slug: invitationData.school_slug,
        };
        sessionStorage.setItem("sho_invitation", JSON.stringify(safe));
        // optionally set into onboarding state immediately if hook exposes setter
        if (typeof setInvitationPrefill === "function") {
          setInvitationPrefill(safe);
        }
      } else {
        // If not passed down, try to read from storage (useful after redirect + auth)
        const raw = sessionStorage.getItem("sho_invitation");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof setInvitationPrefill === "function") {
            setInvitationPrefill(parsed);
          }
        }
      }
    } catch (err) {
      // no-op - sessionStorage might be unavailable in SSR contexts
      // We swallow errors to avoid breaking render.
      console.debug("invitation storage error", err);
    }
  }, [invitationData, setInvitationPrefill]);

  // Render error screens early
  if (serverError || clientError) {
    return (
      <>
        <SEOHead title="Parent Portal" />
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg text-center bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{serverError || clientError}</p>
            <p className="text-sm text-gray-500">If this continues, please contact support.</p>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Loading parent portal..." />;
  }

  // Not authenticated → show AuthGate which will preserve token/school in returnTo
  if (!user) {
    // Build a returnTo that keeps token & school so Auth0 returns with them
    const returnTo = invitationToken
      ? `/parent?token=${encodeURIComponent(invitationToken)}${school ? `&school=${encodeURIComponent(school)}` : ""}`
      : "/parent";

    return (
      <>
        <SEOHead title="Parent Portal Login" />
        <AuthGate
          invitationData={
            invitationData
              ? {
                  ...invitationData,
                  token: invitationToken,
                }
              : undefined
          }
          // pass returnTo string — AuthGate will encode it
          returnTo={returnTo}
        />
      </>
    );
  }

  // Authenticated but onboarding not complete -> show onboarding flow
  if (!isOnboardingComplete) {
    // Ensure onboarding flow has the invitation data (read from storage if necessary inside the flow)
    return (
      <>
        <SEOHead title="Complete Your Registration" />
        <OnboardingFlow user={user} />
      </>
    );
  }

  // ✅ FIXED: Properly select layout component with debugging
  const LayoutComponent = isMobile ? FrontPageLayoutMobileView : FrontPageLayout;

  // Optional: Add debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Layout Debug Info:', {
      isMobile,
      selectedLayout: isMobile ? 'Mobile' : 'Desktop',
      hasLayoutComponent: !!LayoutComponent,
      user: user?.email,
      profile: profile?.first_name
    });
  }

  // fully onboarded -> show dashboard
  return (
    <ErrorBoundary>
      <LayoutComponent user={user} userRoles={["parent"]}>
        <SEOHead title={`${profile?.first_name || "Parent"}'s Dashboard`} />
        <ParentDashboard user={user} profile={profile} learners={learners} />
      </LayoutComponent>
    </ErrorBoundary>
  );
}

// -----------------------
// Small SEO helper
// -----------------------
function SEOHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{`${title} | Parent Portal`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}