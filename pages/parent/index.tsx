// pages/parent/index.tsx - FIXED VERSION WITH CONSISTENT LAYOUTS
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

export const getServerSideProps: GetServerSideProps<ParentPageProps> = async (context) => {
  console.log('🔍 SSR: getServerSideProps called');
  console.log('🔍 SSR Query params:', context.query);
  
  const session = await getSession(context.req, context.res);
  const rawToken = context.query.token;
  const rawSchool = context.query.school;

  const token = typeof rawToken === "string" ? rawToken : null;
  const school = typeof rawSchool === "string" ? rawSchool : null;

  console.log('👤 SSR: Session user:', session?.user?.email || 'not authenticated');
  console.log('🎟️ SSR: Token:', token ? 'present' : 'none');

  // CASE: magic link token present
  if (token) {
    console.log('🎟️ SSR: Processing invitation token...');
    try {
      const verifiedInvitation = await InvitationService.verifyToken(token);

      if (verifiedInvitation.success) {
        console.log('✅ SSR: Invitation verified successfully');
        const invitationData = {
          id: token,
          token: token,
          ...verifiedInvitation,
        };

        // If user is already authenticated, pass invitation data to client
        if (session?.user) {
          console.log('✅ SSR: User authenticated, passing invitation to client');
          return {
            props: {
              invitationToken: token,
              invitationData,
              school: school || null,
            },
          };
        }

        // Not logged in: show AuthGate
        console.log('⚠️ SSR: User not authenticated, showing AuthGate');
        return {
          props: {
            invitationToken: token,
            invitationData,
            school: school || null,
          },
        };
      } else {
        throw new Error("Invitation verification failed");
      }
    } catch (err) {
      console.error("❌ SSR: Invitation verification failed:", err);
      return {
        props: {
          error: "Invalid or expired invitation link.",
        },
      };
    }
  }

  // CASE: authenticated user with no token -> fetch profile and learners
  if (session?.user) {
    console.log('👤 SSR: Fetching profile and learners for authenticated user');
    try {
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      console.log('✅ SSR: Profile and learners fetched:', {
        hasProfile: !!profile,
        learnerCount: learners?.length || 0
      });

      return {
        props: {
          initialProfile: profile || null,
          initialLearners: learners || [],
        },
      };
    } catch (err) {
      console.error("❌ SSR: Error loading parent profile:", err);
      return {
        props: {
          error: "We could not load your parent profile. Please try again later.",
        },
      };
    }
  }

  // CASE: no token, not logged in
  console.log('ℹ️ SSR: No token, not logged in - showing login');
  return {
    props: {},
  };
};

export default function ParentPage({
  invitationToken,
  invitationData,
  initialProfile,
  initialLearners = [],
  school,
  error: serverError,
}: ParentPageProps) {
  console.log('');
  console.log('🎬 ═══════════════════════════════════════');
  console.log('🎬 ParentPage Component Rendered');
  console.log('🎬 ═══════════════════════════════════════');
  console.log('📦 Props:', {
    hasInvitationToken: !!invitationToken,
    hasInvitationData: !!invitationData,
    hasInitialProfile: !!initialProfile,
    initialLearnersCount: initialLearners?.length || 0,
    school,
    hasServerError: !!serverError
  });
  
  const { isMobile } = useResponsive();

  const {
    user,
    isLoading,
    isOnboardingComplete,
    profile,
    learners,
    currentStep,
    error: clientError,
    retrySync,
    setInvitationPrefill,
  } = useParentOnboarding({
    initialProfile,
    initialLearners,
    invitationData,
  });

  // Log state changes
  useEffect(() => {
    console.log('📊 State Update:', {
      hasUser: !!user,
      userEmail: user?.email,
      isLoading,
      isOnboardingComplete,
      currentStep,
      hasProfile: !!profile,
      learnerCount: learners?.length || 0
    });
  }, [user, isLoading, isOnboardingComplete, currentStep, profile, learners]);

  // Persist invitationData to sessionStorage
  useEffect(() => {
    try {
      if (invitationData) {
        console.log('💾 Saving invitation to sessionStorage');
        sessionStorage.setItem("sho_invitation", JSON.stringify(invitationData));
        if (typeof setInvitationPrefill === "function") {
          setInvitationPrefill(invitationData);
        }
      } else {
        const raw = sessionStorage.getItem("sho_invitation");
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log('📥 Loaded invitation from sessionStorage');
          if (typeof setInvitationPrefill === "function") {
            setInvitationPrefill(parsed);
          }
        }
      }
    } catch (err) {
      console.debug("Invitation storage error:", err);
    }
  }, [invitationData, setInvitationPrefill]);

  // Main rendering logic
  const renderContent = () => {
    console.log('');
    console.log('🎨 ═══════════════════════════════════════');
    console.log('🎨 RENDERING CONTENT');
    console.log('🎨 ═══════════════════════════════════════');
    console.log('🔍 Rendering decision factors:', {
      hasServerError: !!serverError,
      hasClientError: !!clientError,
      isLoading,
      hasUser: !!user,
      isOnboardingComplete,
      currentStep
    });

    // Error state - NO LAYOUT (global error screen)
    if (serverError || clientError) {
      console.log('❌ Rendering error state');
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

    // Loading state - NO LAYOUT (global loading screen)
    if (isLoading) {
      console.log('⏳ Rendering loading state');
      return <LoadingScreen message="Loading parent portal..." />;
    }

    // Not authenticated - NO LAYOUT (login/auth screen)
    if (!user) {
      console.log('🔐 Rendering AuthGate (user not authenticated)');
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

    // ✅ KEY FIX: ALWAYS use layout for authenticated users
    // This prevents layout switching between onboarding and dashboard
    const LayoutComponent = isMobile ? FrontPageLayoutMobileView : FrontPageLayout;
    let pageTitle = "Parent Portal";
    let innerContent = null;

    // ✅ KEY FIX: Check onboarding status INSIDE layout
    if (!isOnboardingComplete) {
      console.log('📝 Rendering OnboardingFlow (onboarding not complete)');
      console.log('   Current step:', currentStep);
      console.log('   This will render INSIDE layout wrapper');
      
      pageTitle = "Complete Your Registration";
      innerContent = (
        <OnboardingFlow 
          user={user} 
          invitationData={invitationData}
          // Optional: Pass a prop to OnboardingFlow if it needs to know it's inside a layout
          insideLayout={true}
        />
      );
    } else {
      console.log('🎉 Rendering Dashboard (onboarding complete)');
      pageTitle = `${profile?.name || "Parent"}'s Dashboard`;
      innerContent = (
        <ParentDashboard user={user} profile={profile} learners={learners} />
      );
    }

    // ✅ ALWAYS wrap authenticated content with layout
    console.log('🏗️ Wrapping content with layout:', isMobile ? 'Mobile' : 'Desktop');
    
    return (
      <ErrorBoundary>
        <LayoutComponent user={user} userRoles={["parent"]}>
          <SEOHead title={pageTitle} />
          {innerContent}
        </LayoutComponent>
      </ErrorBoundary>
    );
  };

  console.log('🎨 ═══════════════════════════════════════');
  console.log('');

  return renderContent();
}

function SEOHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{`${title} | Parent Portal`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}