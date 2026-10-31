// pages/student/index.tsx
import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import ErrorBoundary from "../../components/common/ErrorBoundary";
import LoadingScreen from "../../components/common/LoadingScreen";
import AuthGate from "../../components/auth/AuthGate";

import { InvitationAPI, InvitationData } from "../../lib/api/invitation-api";
import { StudentService, StudentProfile } from "../../lib/services/student.service";
import { useStudentOnboarding } from "../../lib/hooks/useStudentOnboarding";

/* -------------------------------------------------------------------------- */
/*                                  DYNAMIC                                   */
/* -------------------------------------------------------------------------- */

const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

const StudentOnboardingFlow = dynamic(
  () => import("../../components/student/Onboarding/StudentOnboardingFlow"),
  { ssr: false }
);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface StudentPageProps {
  isAuthenticated: boolean;
  invitationToken?: string | null;
  invitationData?: InvitationData | null;
  initialProfile?: StudentProfile | null;
  school?: string | null;
  error?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                               SERVER SIDE                                  */
/* -------------------------------------------------------------------------- */

export const getServerSideProps: GetServerSideProps<StudentPageProps> = async (context) => {
  const { req, res, query } = context;

  console.log('📡 [StudentGSSP] Request query:', query);

  const token = typeof query.token === "string" ? query.token : null;
  const school = typeof query.school === "string" ? query.school : null;

  let invitationData: InvitationData | null = null;
  let error: string | null = null;

  // Obtain Auth0 session using existing authentication setup
  const session = await getSession(req, res);

  // 1. Token Verification if invitation token present
  if (token) {
    try {
      console.log('📨 [StudentGSSP] Invitation token detected:', token);
      invitationData = await InvitationAPI.verifyToken(token);
      console.log('📨 [StudentGSSP] Token verified result:', JSON.stringify(invitationData, null, 2));
    } catch (err: any) {
      console.error('❌ [StudentGSSP] Verification error:', err.message);
      error = "Could not verify your student invitation. You can still sign in to check your account.";
    }
  }

  // 2. Server-side School Lookup fallback
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const cleanBase = apiBase.endsWith('/api/v1') ? apiBase : `${apiBase}/api/v1`;

  let schoolIdFromLookup: string | null = null;
  if (school && (!invitationData || !invitationData.school_id)) {
    try {
      const schoolLookupUrl = `${cleanBase}/schools?search=${encodeURIComponent(school)}`;
      console.log(`📡 [StudentGSSP] Resolving school ID server-side: ${schoolLookupUrl}`);
      const schoolRes = await fetch(schoolLookupUrl);
      if (schoolRes.ok) {
        const schoolJson = await schoolRes.json();
        const schoolsList = schoolJson.schools || schoolJson.data?.schools || schoolJson.data || [];
        if (Array.isArray(schoolsList) && schoolsList.length > 0) {
          const matchedSchool = schoolsList.find((s: any) => s.slug === school || s.schoolName === school || s.name === school) || schoolsList[0];
          schoolIdFromLookup = matchedSchool.id || matchedSchool._id;
          console.log(`✅ [StudentGSSP] Resolved school ID: ${schoolIdFromLookup} for ${school}`);
        }
      }
    } catch (err: any) {
      console.error(`⚠️ [StudentGSSP] School ID lookup failed:`, err.message);
    }
  }

  if (schoolIdFromLookup) {
    if (invitationData) {
      invitationData = {
        ...invitationData,
        school_id: invitationData.school_id || schoolIdFromLookup
      };
    } else {
      invitationData = {
        school_id: schoolIdFromLookup,
        school_name: school
      };
    }
  }

  // --- CASE 1: NOT LOGGED IN WITH TOKEN ---
  if (!session?.user && token) {
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

  // --- CASE 2: LOGGED IN USER ---
  if (session?.user) {
    console.log('👤 [StudentGSSP] Logged-in user:', session.user.sub);
    try {
      // ✅ Synchronize user & ensure 'student' role on DB without overwriting existing roles
      await StudentService.syncStudentRole(session.user.sub, session.user.email, session.user.name);

      const profile = await StudentService.getProfile(session.user.sub);

      const isOnboardingComplete = profile?.onboarding_completed === true || profile?.onboarding_status?.student_onboarding_completed === true;

      if (isOnboardingComplete) {
        const fromProfile = profile?.primary_school_name || profile?.school_name;
        const fromInvitation = invitationData?.school_name;
        let finalSchoolName = fromProfile || fromInvitation || school || 'Kagiso High code';

        if (!finalSchoolName || finalSchoolName === 'School') {
          finalSchoolName = 'Kagiso High code';
        }

        const email = profile?.email || session.user.email || 'kagiso.killagram@gmail.com';
        const destination = `/student/${encodeURIComponent(finalSchoolName)}/dashboard/${encodeURIComponent(email)}`;

        console.log(`🚀 [StudentGSSP] Redirecting onboarded student directly to: ${destination}`);
        return {
          redirect: {
            destination,
            permanent: false,
          },
        };
      }

      return {
        props: {
          isAuthenticated: true,
          initialProfile: profile || null,
          invitationToken: token,
          invitationData,
          school,
        },
      };
    } catch (err: any) {
      console.error(`❌ [StudentGSSP] Error processing logged in student:`, err);
      return {
        props: {
          isAuthenticated: true,
          error: "Failed to load your profile.",
        },
      };
    }
  }

  // --- CASE 3: FULLY LOGGED OUT ---
  return {
    props: {
      isAuthenticated: false,
      school,
      invitationData,
      invitationToken: token,
      error,
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function StudentPage(props: StudentPageProps) {
  const router = useRouter();

  console.log('🎓 [StudentPage] Render start. Props:', {
    isAuthenticated: props.isAuthenticated,
    invitationToken: props.invitationToken ? `${props.invitationToken.substring(0, 8)}...` : 'NONE',
    school: props.school,
    hasInvitationData: !!props.invitationData,
  });

  const mergedInvitationData = React.useMemo(() => {
    if (!props.invitationData && !props.school) return props.invitationData;
    return {
      ...props.invitationData,
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: props.invitationData?.school_name || (typeof props.school === 'string' ? props.school : undefined)
    };
  }, [props.invitationData, props.school, props.invitationToken]);

  const onboarding = useStudentOnboarding({
    initialProfile: props.initialProfile,
    invitationData: mergedInvitationData as any,
  });

  // 🚀 Redirect to student dashboard if onboarding is complete
  React.useEffect(() => {
    const shouldRedirect = props.isAuthenticated && onboarding.isOnboardingComplete && !onboarding.isLoading;

    if (!shouldRedirect) return;

    const fromProfile = onboarding.profile?.primary_school_name || onboarding.profile?.school_name;
    const fromOnboarding = onboarding.onboardingData?.school_name;
    const fromInvitation = props.invitationData?.school_name;
    const fromQuery = props.school;

    let schoolName = fromProfile || fromOnboarding || fromInvitation || fromQuery || 'Kagiso High code';

    if (!schoolName || schoolName === 'School') {
      schoolName = 'Kagiso High code';
    }

    const email = onboarding.profile?.email || onboarding.user?.email || 'kagiso.killagram@gmail.com';

    const targetPath = `/student/${encodeURIComponent(schoolName)}/dashboard/${encodeURIComponent(email)}`;
    console.log('🚀 [StudentPage] Student onboarding complete. Navigating to:', targetPath);
    router.replace(targetPath);
  }, [
    onboarding.isOnboardingComplete,
    onboarding.isLoading,
    onboarding.profile,
    onboarding.onboardingData,
    onboarding.user,
    props.invitationData,
    props.school,
    props.isAuthenticated,
    router
  ]);

  // 🚫 Logged out → SHOW AuthGate LOGIN / SIGNUP
  if (!props.isAuthenticated) {
    const schoolName = props.invitationData?.school_name || props.school;
    const authGateInvitation = {
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: schoolName || undefined,
      school_logo: props.invitationData?.school_logo || null,
      grade_name: props.invitationData?.grade_name || null,
      learner_name: props.invitationData?.learner_number || props.invitationData?.learner_numbers?.[0],
    };

    const dynamicReturnTo = schoolName
      ? `/student?school=${encodeURIComponent(schoolName)}`
      : "/student";

    return (
      <AuthGate
        invitationData={authGateInvitation as any}
        returnTo={dynamicReturnTo}
      />
    );
  }

  if (onboarding.isLoading) {
    return <LoadingScreen message="Loading student portal..." />;
  }

  if (props.error) {
    return (
      <FrontPageLayout user={null} userRoles={["student"]}>
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center border border-red-100">
            <h2 className="text-xl font-bold text-red-600 mb-2">Student Portal Access Error</h2>
            <p className="text-gray-600 mb-4">{props.error}</p>
            <Link
              href="/api/auth/login?returnTo=/student"
              className="inline-block bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Try Signing In Again
            </Link>
          </div>
        </div>
      </FrontPageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>Student Portal - School Head Office</title>
      </Head>
      <FrontPageLayout user={onboarding.user} userRoles={onboarding.profile?.roles || ["student"]}>
        {!onboarding.isOnboardingComplete ? (
          <StudentOnboardingFlow
            user={onboarding.user}
            invitationData={mergedInvitationData}
          />
        ) : (
          <LoadingScreen message="Redirecting to your student dashboard..." />
        )}
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
