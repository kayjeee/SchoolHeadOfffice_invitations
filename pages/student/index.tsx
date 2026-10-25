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

/* -------------------------------------------------------------------------- */
/*                                  DYNAMIC                                   */
/* -------------------------------------------------------------------------- */

const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { ssr: true }
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
        let finalSchoolName = fromProfile || fromInvitation || school || 'Far North Secondary School';

        if (!finalSchoolName || finalSchoolName === 'School') {
          finalSchoolName = 'Far North Secondary School';
        }

        const email = profile?.email || session.user.email || '';
        const destination = `/student/${encodeURIComponent(finalSchoolName)}/dashboard/${encodeURIComponent(email)}`;

        console.log(`🚀 [StudentGSSP] Redirecting onboarded student to: ${destination}`);
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

  const schoolName = props.invitationData?.school_name || props.school || 'School';

  // 🚫 Logged out → SHOW AuthGate LOGIN / SIGNUP
  if (!props.isAuthenticated) {
    const authGateInvitation = {
      token: props.invitationData?.token || props.invitationToken || undefined,
      school_name: props.invitationData?.school_name || props.school || undefined,
      school_logo: props.invitationData?.school_logo || null,
      grade_name: props.invitationData?.grade_name || null,
      learner_name: props.invitationData?.learner_number || props.invitationData?.learner_numbers?.[0],
    };

    const dynamicReturnTo = schoolName && schoolName !== 'School'
      ? `/student?school=${encodeURIComponent(schoolName)}`
      : "/student";

    return (
      <AuthGate
        invitationData={authGateInvitation as any}
        returnTo={dynamicReturnTo}
      />
    );
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

  const profile = props.initialProfile;
  const displayName = profile?.name || profile?.email || 'Student';

  return (
    <ErrorBoundary>
      <Head>
        <title>Student Portal - School Head Office</title>
      </Head>
      <FrontPageLayout user={profile} userRoles={profile?.roles || ["student"]}>
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {displayName}!</h1>
                <p className="text-sm text-gray-500">Student Portal • {schoolName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-1">Your Profile & Account</h3>
                <p className="text-sm text-indigo-700">Email: {profile?.email || 'N/A'}</p>
                <p className="text-sm text-indigo-700">Roles: {profile?.roles?.join(', ') || 'student'}</p>
              </div>

              <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <h3 className="font-semibold text-emerald-900 mb-1">Status</h3>
                <p className="text-sm text-emerald-700">
                  {profile?.onboarding_completed ? 'Onboarding Complete' : 'Active Account'}
                </p>
                <p className="text-sm text-emerald-700">School: {schoolName}</p>
              </div>
            </div>

            {props.invitationData && (
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-1">Verified Student Invitation</h4>
                <p className="text-xs text-blue-700">Grade: {props.invitationData.grade_name || 'N/A'}</p>
                <p className="text-xs text-blue-700">School ID: {props.invitationData.school_id || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
