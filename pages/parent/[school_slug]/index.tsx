// pages/parent/[school_slug]/index.tsx
import React from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Head from "next/head";
import dynamic from "next/dynamic";

import ErrorBoundary from "../../../components/common/ErrorBoundary";
import LoadingScreen from "../../../components/common/LoadingScreen";
import { ParentService } from "../../../lib/services/parent.service";
import ParentDashboard from "../../../components/parent/Dashboard/ParentDashboard";

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface Props {
  isAuthenticated: boolean;
  user?: any;
  profile?: any;
  learners?: any[];
  school_slug: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { school_slug } = context.params as { school_slug: string };
  const session = await getSession(context.req, context.res);

  // 1. Unauthenticated case
  if (!session?.user) {
    return {
      props: {
        isAuthenticated: false,
        school_slug,
      },
    };
  }

  // 2. Authenticated case
  try {
    const [profile, learners] = await Promise.all([
      ParentService.getProfile(session.user.sub),
      ParentService.getLearners(session.user.sub),
    ]);

    const primarySchoolSlug =
      learners?.[0]?.school_slug || profile?.primary_school_slug;

    const onboardingComplete =
      !!profile && learners.length > 0 && !!primarySchoolSlug;

    // Redirect to onboarding if not complete
    if (!onboardingComplete) {
      return {
        redirect: {
          destination: "/parent",
          permanent: false,
        },
      };
    }

    // Security: Verify user has a learner at this school
    const hasAccess = learners.some((l: any) => l.school_slug === school_slug) ||
                       profile?.primary_school_slug === school_slug;

    if (!hasAccess && primarySchoolSlug) {
      console.warn(`User ${session.user.sub} attempted to access unauthorized school: ${school_slug}. Redirecting to ${primarySchoolSlug}`);
      return {
        redirect: {
          destination: `/parent/${primarySchoolSlug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        isAuthenticated: true,
        user: session.user,
        profile,
        learners,
        school_slug,
      },
    };
  } catch (error) {
    console.error("Dashboard SSR Error:", error);
    return {
      redirect: {
        destination: "/parent?error=auth_failed",
        permanent: false,
      },
    };
  }
};

export default function SchoolDashboardPage({
  isAuthenticated,
  user,
  profile,
  learners,
  school_slug,
}: Props) {
  if (!isAuthenticated) {
    return <SchoolLandingPage school_slug={school_slug} />;
  }

  const schoolName = learners?.find(l => l.school_slug === school_slug)?.school_name || "School";
  const title = `${schoolName} | Parent Dashboard`;
  const description = `Manage your child's education at ${schoolName}. View grades, attendance, and school announcements.`;

  return (
    <ErrorBoundary>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://crm.school'}/parent/${school_slug}`} />
      </Head>
      <FrontPageLayout user={user} userRoles={["parent"]}>
        <ParentDashboard
          user={user}
          profile={profile}
          learners={learners || []}
        />
      </FrontPageLayout>
    </ErrorBoundary>
  );
}

function SchoolLandingPage({ school_slug }: { school_slug: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <title>Parent Portal | {school_slug.toUpperCase()}</title>
      </Head>
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 capitalize">
          {school_slug.replace(/-/g, " ")}
        </h1>
        <h2 className="text-lg font-medium text-blue-600 mb-6">Parent Portal</h2>
        <p className="text-gray-500 mb-8">
          Welcome to our parent portal. Please sign in to access your child's
          academic records and school updates.
        </p>
        <a
          href={`/api/auth/login?returnTo=/parent/${school_slug}`}
          className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
        >
          Sign In as Parent
        </a>
      </div>
    </div>
  );
}
