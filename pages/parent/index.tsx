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
  learners?: { id: string; name: string; grade?: string }[];
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

      if (verifiedInvitation.success) {
        const invitationData = {
          id: token,
          token: token,
          ...verifiedInvitation,
        };

        // If user is already authenticated, link invitation immediately
        if (session?.user) {
          // Redirect to same page with start_onboarding to trigger client onboarding flow
          return {
            redirect: {
              destination: `/parent?token=${encodeURIComponent(token)}&school=${encodeURIComponent(
                school || ""
              )}&start_onboarding=true`,
              permanent: false,
            },
          };
        }

        // Not logged in: show AuthGate + pass invitation data to client
        return {
          props: {
            invitationToken: token,
            invitationData,
            school: school || null,
          },
        };
      } else {
        // If verification fails, throw an error to trigger the catch block
        throw new Error("Invitation verification failed as per API response.");
      }
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
    retrySync,
    setInvitationPrefill, // optional helper (see hook improvements below)
  } = useParentOnboarding({
    initialProfile,
    initialLearners,
    invitationData,
  });

  // Persist invitationData to sessionStorage so it survives client navigations/refreshes
  // This helps when Auth0 redirects back and URL params might be lost client-side.
  useEffect(() => {
    try {
      if (invitationData) {
        sessionStorage.setItem("sho_invitation", JSON.stringify(invitationData));
        if (typeof setInvitationPrefill === "function") {
          setInvitationPrefill(invitationData);
        }
      } else {
        const raw = sessionStorage.getItem("sho_invitation");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof setInvitationPrefill === "function") {
            setInvitationPrefill(parsed);
          }
        }
      }
    } catch (err) {
      console.debug("invitation storage error", err);
    }
  }, [invitationData, setInvitationPrefill]);

  // 🧭 Main rendering logic - FIXED VERSION
  // ALL content paths go through the layout wrapper
  const renderContent = () => {
    // Early returns for error and loading states - NO LAYOUT
    if (serverError || clientError) {
      return (
        <>
          <SEOHead title="Parent Portal" />
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg text-center bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">{serverError || clientError}</p>
              {retrySync && (
                <button
                  onClick={() => retrySync()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              )}
              <p className="text-sm text-gray-500 mt-4">If this continues, please contact support.</p>
            </div>
          </div>
        </>
      );
    }

    if (isLoading) {
      return <LoadingScreen message="Loading parent portal..." />;
    }

    // Determine inner content based on state
    let innerContent;
    let pageTitle = "Parent Portal";

    if (!user) {
      // Not authenticated → show AuthGate (NO LAYOUT)
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
            returnTo={returnTo}
          />
        </>
      );
    }

    if (!isOnboardingComplete) {
      // Onboarding flow
      innerContent = <OnboardingFlow user={user} invitationData={invitationData} />;
      pageTitle = "Complete Your Registration";
    } else {
      // Fully onboarded → show dashboard
      innerContent = <ParentDashboard user={user} profile={profile} learners={learners} />;
      pageTitle = `${profile?.first_name || "Parent"}'s Dashboard`;
    }

    // ✅ ALWAYS wrap authenticated content with layout
    const LayoutComponent = isMobile ? FrontPageLayoutMobileView : FrontPageLayout;

    // Optional: Add debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Layout Debug Info:', {
        isMobile,
        selectedLayout: isMobile ? 'Mobile' : 'Desktop',
        hasLayoutComponent: !!LayoutComponent,
        user: user?.email,
        profile: profile?.first_name,
        isOnboardingComplete
      });
    }

    return (
      <ErrorBoundary>
        <LayoutComponent user={user} userRoles={["parent"]}>
          <SEOHead title={pageTitle} />
          {innerContent}
        </LayoutComponent>
      </ErrorBoundary>
    );
  };

  // Simple return - all logic in renderContent
  return renderContent();
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