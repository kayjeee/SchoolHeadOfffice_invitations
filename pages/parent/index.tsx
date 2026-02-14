// pages/parent/index.tsx
import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  FileText,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";

import { useParentOnboarding } from "../../lib/hooks/useParentOnboarding";
import { InvitationService } from "../../lib/services/invitation.service";
import { ParentService } from "../../lib/services/parent.service";

import ErrorBoundary from "../../components/common/ErrorBoundary";
import LoadingScreen from "../../components/common/LoadingScreen";
import ParentDashboard from "../../components/parent/Dashboard/ParentDashboard";

const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { loading: () => <LoadingScreen message="Loading layout..." />, ssr: true }
);

const OnboardingFlow = dynamic(
  () => import("../../components/parent/Onboarding/OnboardingFlow"),
  { loading: () => <LoadingScreen message="Loading onboarding..." />, ssr: false }
);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               MOCK NOTICES                                 */
/* -------------------------------------------------------------------------- */

const SCHOOL_NOTICES = [
  {
    id: 1,
    title: "Grade 12 Parents Meeting",
    recipient: "Grade 12 Parents / Guardians",
    from: "Mr. Maropeng P.S. (Principal)",
    date: "31 January 2026",
    subject: "Urgent Grade 12 Parents Meeting",
    priority: "high",
    content: {
      greeting: "Dear Parent / Guardian,",
      body: [
        "You are hereby invited to an urgent Grade 12 parents meeting focused on learner performance and readiness for the 2026 NSC examinations.",
        "The meeting aims to strengthen collaboration between parents, educators, and school leadership to ensure academic excellence.",
      ],
      details: {
        circuit: "Circuit 4",
        date: "31 January 2026",
        time: "09:00",
        venue: "Sgodiphola Secondary School",
      },
      attendees: "Parents, Learners, SGB Members, Stakeholders",
      note: "Your attendance is critical to your child's academic success.",
    },
  },
  {
    id: 2,
    title: "Grade 8 & 9 Parents Meeting",
    recipient: "Grade 8 & 9 Parents / Guardians",
    from: "Mr. Maropeng S. (Principal)",
    date: "31 January 2026",
    subject: "Grade 8 & 9 Parents Meeting",
    priority: "medium",
    content: {
      greeting: "Dear Parent / Guardian,",
      body: [
        "Parents of Grade 8 and 9 learners are invited to attend a meeting regarding academic progress and learner development.",
      ],
      details: {
        date: "31 January 2026",
        time: "09:00",
        venue: "Far North Secondary School",
      },
      attendees: "All Grade 8 & 9 Parents",
      note: "Please ensure attendance.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                             SERVER SIDE LOGIC                               */
/* -------------------------------------------------------------------------- */

export const getServerSideProps: GetServerSideProps<
  ParentPageProps
> = async (context) => {
  const session = await getSession(context.req, context.res);
  const token = typeof context.query.token === "string" ? context.query.token : null;
  const school =
    typeof context.query.school === "string" ? context.query.school : null;

  if (token) {
    try {
      const verified = await InvitationService.verifyToken(token);
      if (!verified.success) throw new Error();

      return {
        props: {
          invitationToken: token,
          invitationData: { id: token, token, ...verified },
          school,
        },
      };
    } catch {
      return { props: { error: "Invalid or expired invitation link." } };
    }
  }

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
          error: "Unable to load your profile. Please try again later.",
        },
      };
    }
  }

  return { props: {} };
};

/* -------------------------------------------------------------------------- */
/*                              UI COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function NoticeCard({ notice, isActive }: any) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg border transition-all ${
        isActive ? "border-blue-500" : "border-gray-200 opacity-60"
      }`}
    >
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Bell
            className={`w-5 h-5 ${
              notice.priority === "high" ? "text-red-600" : "text-blue-600"
            }`}
          />
          <span className="text-xs font-bold uppercase">
            {notice.priority === "high" ? "Urgent" : "Notice"}
          </span>
        </div>
        <h3 className="text-xl font-bold">{notice.title}</h3>
        <p className="text-sm text-gray-600">To: {notice.recipient}</p>
      </div>

      <div className="p-6 space-y-4">
        <p className="font-semibold">{notice.content.greeting}</p>
        {notice.content.body.map((p: string, i: number) => (
          <p key={i} className="text-gray-700">
            {p}
          </p>
        ))}

        <div className="bg-blue-50 border rounded-lg p-4 grid grid-cols-2 gap-4">
          <div>
            <Calendar className="inline w-4 h-4 mr-1" />
            {notice.content.details.date}
          </div>
          <div>
            <Clock className="inline w-4 h-4 mr-1" />
            {notice.content.details.time}
          </div>
          <div className="col-span-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            {notice.content.details.venue}
          </div>
        </div>

        <div className="bg-yellow-50 border rounded-lg p-4 text-sm">
          {notice.content.note}
        </div>
      </div>
    </div>
  );
}

function AdvertPanel() {
  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase">
        Sponsored
      </div>
      <div className="p-4">
        <div className="aspect-[4/5] bg-gray-100 rounded flex items-center justify-center text-gray-400">
          Advert Image
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              LANDING PAGE                                  */
/* -------------------------------------------------------------------------- */

function LandingPage({ invitationToken, school }: any) {
  const [index, setIndex] = useState(0);

  const returnTo = invitationToken
    ? `/parent?token=${invitationToken}${school ? `&school=${school}` : ""}`
    : "/parent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <SEOHead title="Parent Portal" />

      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold">Parent Portal</h1>
          <a
            href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-600 text-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-2">📢 School Notices</h2>
          <p className="text-blue-100 text-lg">
            Keep a lookout for notices from your school by signing up.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">
                Notice {index + 1} of {SCHOOL_NOTICES.length}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setIndex((i) => Math.max(i - 1, 0))}>
                  <ChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setIndex((i) => (i + 1) % SCHOOL_NOTICES.length)
                  }
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <NoticeCard notice={SCHOOL_NOTICES[index]} isActive />
          </div>

          <AdvertPanel />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h3 className="text-2xl font-bold mb-3">
          Access Your Full Parent Dashboard
        </h3>
        <p className="mb-6 text-gray-600">
          View notices, learner progress, attendance, and more.
        </p>
        <a
          href={`/api/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Create Account
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        © 2026 Parent Portal
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                PAGE EXPORT                                  */
/* -------------------------------------------------------------------------- */

export default function ParentPage(props: ParentPageProps) {
  const onboarding = useParentOnboarding({
    initialProfile: props.initialProfile,
    initialLearners: props.initialLearners,
    invitationData: props.invitationData,
  });

  if (props.error) {
    return <div className="p-8 text-center">{props.error}</div>;
  }

  if (onboarding.isLoading) {
    return <LoadingScreen message="Loading parent portal..." />;
  }

  if (!onboarding.user) {
    return (
      <LandingPage
        invitationToken={props.invitationToken}
        school={props.school}
      />
    );
  }

  return (
    <ErrorBoundary>
      <FrontPageLayout user={onboarding.user} userRoles={["parent"]}>
        {!onboarding.isOnboardingComplete ? (
          <OnboardingFlow
            user={onboarding.user}
            invitationData={props.invitationData}
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

function SEOHead({ title }: { title: string }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
  );
}
