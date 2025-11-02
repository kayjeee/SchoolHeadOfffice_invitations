// pages/parent/index.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { useParentOnboarding } from '../../lib/hooks/useParentOnboarding';
import { useResponsive } from '../../lib/hooks/useResponsive';
import { InvitationService } from '../../lib/services/invitation.service';
import { ParentService } from '../../lib/services/parent.service';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LoadingScreen from '../../components/common/LoadingScreen';
import AuthGate from '../../components/auth/AuthGate';
import ParentDashboard from '../../components/parent/Dashboard/ParentDashboard';

// Lazy load heavy components
const FrontPageLayout = dynamic(() => import("../../components/Layouts/FrontPageLayout"));
const FrontPageLayoutMobileView = dynamic(() => import("../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView"));
const OnboardingFlow = dynamic(() => import('../../components/parent/Onboarding/OnboardingFlow'));

// ========================
// TYPE DEFINITIONS
// ========================
// (These should be moved to lib/types)
interface ParentPageProps {
  invitationToken?: string;
  invitationData?: any | null;
  initialProfile?: any | null;
  initialLearners?: any[];
  error?: string;
}

// ========================
// SERVER-SIDE DATA FETCHING
// ========================
export const getServerSideProps: GetServerSideProps<ParentPageProps> = async (context) => {
  const session = await getSession(context.req, context.res);
  const { token } = context.query;

  if (token && typeof token === 'string') {
    try {
      const invitationData = await InvitationService.verifyToken(token);
      
      if (session?.user) {
        await ParentService.linkInvitation(session.user.sub, invitationData.id);
        return {
          redirect: {
            destination: '/parent?start_onboarding=true',
            permanent: false,
          },
        };
      }

      return { props: { invitationToken: token, invitationData } };
    } catch (error) {
      console.error('Invitation verification failed:', error);
      return { props: { error: 'Invalid or expired invitation link.' } };
    }
  }

  if (session?.user) {
    try {
      const [profile, learners] = await Promise.all([
        ParentService.getProfile(session.user.sub),
        ParentService.getLearners(session.user.sub),
      ]);

      return { props: { initialProfile: profile, initialLearners: learners } };
    } catch (error) {
      console.error('Error fetching user data:', error);
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
  initialLearners = [],
  error: serverError,
}: ParentPageProps) {
  const { isMobile } = useResponsive();
  const {
    user,
    isLoading,
    isOnboardingComplete,
    profile,
    learners,
    currentStep,
    error: clientError,
  } = useParentOnboarding({
    initialProfile,
    initialLearners,
  });

  if (serverError || clientError) {
    // This should be the new ErrorScreen component
    return <div>Error: {serverError || clientError}</div>;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading parent portal..." />;
  }

  if (!user) {
    return (
      <>
        <SEOHead title="Parent Portal Login" />
        <AuthGate invitationData={invitationData} returnTo="/parent" />
      </>
    );
  }

  if (!isOnboardingComplete) {
    return (
      <>
        <SEOHead title="Complete Your Registration" />
        <OnboardingFlow
          user={user}
          invitationData={invitationData}
          currentState={currentStep}
        />
      </>
    );
  }

  const LayoutComponent = isMobile ? FrontPageLayoutMobileView : FrontPageLayout;

  return (
    <ErrorBoundary>
      <LayoutComponent user={user} userRoles={['parent']}>
        <SEOHead title={`${profile?.first_name}'s Dashboard`} />
        <ParentDashboard user={user} profile={profile} learners={learners} />
      </LayoutComponent>
    </ErrorBoundary>
  );
}

// ========================
// HELPER COMPONENTS
// ========================
function SEOHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{`${title} | Parent Portal`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}
