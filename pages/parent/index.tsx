// pages/parent/index.tsx - FIXED VERSION (SINGLE LAYOUT ONLY)
import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Head from "next/head";
import dynamic from "next/dynamic";

import { useParentOnboarding } from "../../lib/hooks/useParentOnboarding";
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
    ssr: true,
  }
);

const OnboardingFlow = dynamic(
  () => import("../../components/parent/Onboarding/OnboardingFlow"),
  {
    loading: () => <LoadingScreen message="Loading onboarding..." />,
    ssr: false,
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

export const getServerSideProps: GetServerSideProps<ParentPageProps> = async (
  context
) => {
  const session = await getSession(context.req, context.res);
  const rawToken = context.query.token;
  const rawSchool = context.query.school;

  const token = typeof rawToken === "string" ? rawToken : null;
  const school = typeof rawSchool === "string" ? rawSchool : null;

  // Invitation flow
  if (token) {
    try {
      const verifiedInvitation = await InvitationService.verifyToken(token);

      if (verifiedInvitation.success) {
        const invitationData = {
          id: token,
          token,
          ...verifiedInvitation,
        };

        return {
          props: {
            invitationToken: token,
            invitationData,
            school: school || null,
          },
        };
      }

      throw new Error("Invitation verification failed");
    } catch {
      return {
        props: {
          error: "Invalid or expired invitation link.",
        },
      };
    }
  }

  // Authenticated user with no token
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
    } catch {
      return {
        props: {
          error:
            "We could not load your parent profile. Please try again later.",
        },
      };
    }
  }

  return { props: {} };
};

export default function ParentPage({
  invitationToken,
  invitationData,
  initialProfile,
  initialLearners = [],
  school,
  error: serverError,
}: ParentPageProps) {
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

  // Persist invitation to sessionStorage
  useEffect(() => {
    try {
      if (invitationData) {
        sessionStorage.setItem(
          "sho_invitation",
          JSON.stringify(invitationData)
        );
        setInvitationPrefill?.(invitationData);
      } else {
        const raw = sessionStorage.getItem("sho_invitation");
        if (raw) {
          setInvitationPrefill?.(JSON.parse(raw));
        }
      }
    } catch {}
  }, [invitationData, setInvitationPrefill]);

  // Rendering logic
  const renderContent = () => {
    // Error state (no layout)
    if (serverError || clientError) {
      return (
        <>
          <SEOHead title="Parent Portal" />
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                {serverError || clientError}
              </p>
              {retrySync && (
                <button
                  onClick={retrySync}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </>
      );
    }

    // Loading state (no layout)
    if (isLoading) {
      return <LoadingScreen message="Loading parent portal..." />;
    }

    // Not authenticated (no layout)
    if (!user) {
      const returnTo = invitationToken
        ? `/parent?token=${encodeURIComponent(invitationToken)}${
            school ? `&school=${encodeURIComponent(school)}` : ""
          }`
        : "/parent";

      return (
        <>
          <SEOHead title="Parent Portal Login" />
          <AuthGate
            invitationData={
              invitationData
                ? { ...invitationData, token: invitationToken }
                : undefined
            }
            returnTo={returnTo}
          />
        </>
      );
    }

    // ✅ ALWAYS use ONE layout for authenticated users
    const pageTitle = isOnboardingComplete
      ? `${profile?.name || "Parent"}'s Dashboard`
      : "Complete Your Registration";

    return (
      <ErrorBoundary>
        <FrontPageLayout user={user} userRoles={["parent"]}>
          <SEOHead title={pageTitle} />

          {!isOnboardingComplete ? (
            <OnboardingFlow
              user={user}
              invitationData={invitationData}
            />
          ) : (
            <ParentDashboard
              user={user}
              profile={profile}
              learners={learners}
            />
          )}
        </FrontPageLayout>
      </ErrorBoundary>
    );
  };

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
