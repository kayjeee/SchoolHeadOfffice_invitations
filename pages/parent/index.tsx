// pages/parent/index.tsx
import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Head from "next/head";
import dynamic from "next/dynamic";

import { useParentOnboarding } from "../../components/parent/hooks/useParentOnboarding";
import { useResponsive } from "../../components/parent/hooks/useResponsive";
import { InvitationService } from "../../components/parent/services/invitation.service";
import { ParentService } from "../../components/parent/services/parent.service";
import ErrorBoundary from "../../components/parent/utils/error-handler";
import LoadingScreen from "../../components/parent/utils/LoadingScreen";

// Lazy load heavy components
const FrontPageLayout = dynamic(() => import("../../components/Layouts/FrontPageLayout"));
const FrontPageLayoutMobileView = dynamic(() => import("../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView"));
const OnboardingFlow = dynamic(() => import("../../components/parent/Onboarding/OnboardingFlow"));
const ParentDashboard = dynamic(() => import("../../components/parent/Dashboard/ParentDashboard"));
const AuthGate = dynamic(() => import("../../components/auth/AuthGate"));

// ========================
// TYPE DEFINITIONS
// ========================
interface ParentPageProps {
  invitationToken?: string;
  invitationData?: InvitationData | null;
  initialProfile?: ParentProfile | null;
  initialChildren?: Child[];
  error?: string;
}

interface InvitationData {
  id: string;
  school_id: string;
  school_name: string;
  phone_number: string;
  learner_ids: string[];
  expires_at: string;
}

interface ParentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  school_id: string;
}

// ========================
// SERVER-SIDE DATA FETCHING
// ========================
export const getServerSideProps: GetServerSideProps<ParentPageProps> = async (context) => {
  const session = await getSession(context.req, context.res);
  const { token } = context.query;

  // Handle magic link invitation (server-side for security)
  if (token && typeof token === "string") {
    try {
      const invitationData = await InvitationService.verifyToken(token);
      
      // If user is already logged in, redirect to start onboarding
      if (session?.user) {
        await ParentService.linkInvitation(session.user.sub, invitationData.id);
        return {
          redirect: {
            destination: "/parent?start_onboarding=true",
            permanent: false,
          },
        };
      }

      // Return invitation data for login prompt
      return {
        props: {
          invitationToken: token,
          invitationData,
        },
      };
    } catch (error) {
      console.error("❌ Invitation verification failed:", error);
      return {
        props: {
          error: "Invalid or expired invitation link.",
        },
      };
    }
  }

  // If user is logged in, prefetch their data
  if (session?.user) {
    try {
      const [profile, children] = await Promise.all([
        ParentService.getProfile(session.user.sub).catch(() => null),
        ParentService.getChildren(session.user.sub).catch(() => []),
      ]);

      return {
        props: {
          initialProfile: profile,
          initialChildren: children,
        },
      };
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    }
  }

  return { props: {} };
};

// ========================
// MAIN COMPONENT
// ========================
export default function ParentPage({
  invitationToken,
  invitationData,
  initialProfile,
  initialChildren = [],
  error: serverError,
}: ParentPageProps) {
  const { isMobile } = useResponsive();
  const {
    user,
    isLoading,
    isOnboardingComplete,
    profile,
    children,
    onboardingState,
    error: clientError,
  } = useParentOnboarding({
    initialProfile,
    initialChildren,
  });

  // ========================
  // ERROR STATES
  // ========================
  if (serverError || clientError) {
    return (
      <ErrorScreen
        title="Something went wrong"
        message={serverError || clientError}
        action={{
          label: "Go to Homepage",
          href: "/",
        }}
      />
    );
  }

  // ========================
  // LOADING STATE
  // ========================
  if (isLoading) {
    return <LoadingScreen message="Loading parent portal..." />;
  }

  // ========================
  // AUTHENTICATION GATE
  // ========================
  if (!user) {
    return (
      <>
        <SEOHead title="Parent Portal Login" />
        <AuthGate
          invitationData={invitationData}
          returnTo="/parent"
        />
      </>
    );
  }

  // ========================
  // ONBOARDING FLOW
  // ========================
  if (!isOnboardingComplete) {
    return (
      <>
        <SEOHead title="Complete Your Registration" />
        <OnboardingFlow
          user={user}
          invitationData={invitationData}
          currentState={onboardingState}
        />
      </>
    );
  }

  // ========================
  // PARENT DASHBOARD
  // ========================
  const DashboardContent = (
    <>
      <SEOHead 
        title={`${profile?.first_name}'s Dashboard`}
        description="Manage your children's education and stay connected with their school"
      />
      <ParentDashboard
        user={user}
        profile={profile}
        children={children}
      />
    </>
  );

  // Wrap in appropriate layout
  const LayoutComponent = isMobile ? FrontPageLayoutMobileView : FrontPageLayout;

  return (
    <ErrorBoundary>
      <LayoutComponent user={user} userRoles={["parent"]}>
        {DashboardContent}
      </LayoutComponent>
    </ErrorBoundary>
  );
}

// ========================
// HELPER COMPONENTS
// ========================
interface SEOHeadProps {
  title: string;
  description?: string;
}

function SEOHead({ title, description }: SEOHeadProps) {
  const fullTitle = `${title} | Parent Portal`;
  const defaultDescription = "Secure parent portal for managing your child's education";

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
      
      {/* PWA */}
      <meta name="theme-color" content="#16a34a" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
}

interface ErrorScreenProps {
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

function ErrorScreen({ title, message, action }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        {action && (
          <a
            href={action.href}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
          >
            {action.label}
          </a>
        )}
      </div>
    </div>
  );
}