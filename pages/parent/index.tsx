// pages/parent/index.tsx - Professional Landing Page with School Notices
import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import Head from "next/head";
import dynamic from "next/dynamic";
import { FileText, Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, Bell } from "lucide-react";

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

// School Notices Data
const SCHOOL_NOTICES = [
  {
    id: 1,
    title: "Grade 12 Parents Meeting",
    recipient: "Grade 12 Parents/Guardians",
    from: "Mr. Maropeng P.S. (Principal)",
    date: "31 January 2026",
    subject: "Grade 12 Parents Meeting - Urgent",
    content: {
      greeting: "Dear Parent/Guardian,",
      body: [
        "In pursuit of academic excellence and the optimization of learner performance for the upcoming 2026 National Senior Certificate Examination, you are hereby cordially invited to an urgent meeting on strategic academic enhancement.",
        "This meeting aims to align our collective efforts in fostering a culture of quality learning and teaching, strengthening the partnership between home and school, and addressing necessary interventions for the academic year.",
        "All Grade 12 Parents/Guardians/Caregivers are cordially invited to attend the parents meeting."
      ],
      details: {
        circuit: "Circuit 4",
        date: "31 January 2026",
        time: "09:00",
        venue: "Sgodiphola Secondary School"
      },
      attendees: "Grade 12 Learners, SGB Members, Stakeholders, and QLTC",
      note: "Your attendance is crucial for the success of your child's academic journey."
    },
    priority: "high"
  },
  {
    id: 2,
    title: "Grade 8 & 9 Parents Meeting",
    recipient: "Grade 8 & 9 Parents/Guardians",
    from: "Mr. Maropeng S. (Principal)",
    date: "31 January 2026",
    subject: "Parents Meeting - Grade 8 & 9",
    content: {
      greeting: "Dear Parents/Guardians,",
      body: [
        "You are kindly invited to the Grade 8 & 9 Parents Meeting. This important gathering will focus on your child's academic progress, behavioral development, and partnership opportunities between home and school.",
        "Your participation is essential in ensuring the continued success and well-being of our learners."
      ],
      details: {
        date: "31 January 2026",
        time: "09:00",
        venue: "Far North Secondary School"
      },
      attendees: "All Grade 8 & 9 Parents/Guardians",
      note: "Please make every effort to attend this important meeting."
    },
    priority: "medium"
  }
];

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

// Notice Card Component
function NoticeCard({ notice, isActive }: { notice: typeof SCHOOL_NOTICES[0], isActive: boolean }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 transition-all duration-300 ${
      isActive ? 'border-blue-500 scale-100' : 'border-gray-200 scale-95 opacity-50'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b-2 ${
        notice.priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className={`w-5 h-5 ${
                notice.priority === 'high' ? 'text-red-600' : 'text-blue-600'
              }`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                notice.priority === 'high' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {notice.priority === 'high' ? 'Urgent Notice' : 'Important Notice'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{notice.title}</h3>
            <p className="text-sm text-gray-600">To: {notice.recipient}</p>
          </div>
        </div>
      </div>

      {/* Notice Details */}
      <div className="p-6 space-y-4">
        {/* From & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">From</p>
            <p className="font-semibold text-gray-900">{notice.from}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
            <p className="font-semibold text-gray-900">{notice.date}</p>
          </div>
        </div>

        {/* Subject */}
        <div className="pb-4 border-b border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subject</p>
          <p className="font-semibold text-gray-900">{notice.subject}</p>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-gray-900 font-medium">{notice.content.greeting}</p>
          {notice.content.body.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 leading-relaxed">{paragraph}</p>
          ))}
        </div>

        {/* Meeting Details */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Meeting Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notice.content.details.circuit && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Circuit</p>
                  <p className="font-semibold text-gray-900">{notice.content.details.circuit}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Date</p>
                <p className="font-semibold text-gray-900">{notice.content.details.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Time</p>
                <p className="font-semibold text-gray-900">{notice.content.details.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Venue</p>
                <p className="font-semibold text-gray-900">{notice.content.details.venue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-gray-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Expected Attendees</p>
            <p className="text-gray-900">{notice.content.attendees}</p>
          </div>
        </div>

        {/* Important Note */}
        <div className={`p-4 rounded-lg border-2 ${
          notice.priority === 'high' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`font-bold text-sm uppercase tracking-wide mb-2 ${
            notice.priority === 'high' ? 'text-red-700' : 'text-amber-700'
          }`}>
            ⚠️ Important Note
          </p>
          <p className={`text-sm ${
            notice.priority === 'high' ? 'text-red-900' : 'text-amber-900'
          }`}>
            {notice.content.note}
          </p>
        </div>

        {/* Signature */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-gray-700">Yours in Education,</p>
          <p className="font-bold text-gray-900 mt-2">{notice.from}</p>
        </div>
      </div>
    </div>
  );
}

// Landing Page Component (for unauthenticated users)
function LandingPage({ 
  invitationToken, 
  invitationData, 
  school 
}: { 
  invitationToken?: string | null;
  invitationData?: InvitationData | null;
  school?: string | null;
}) {
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);

  const nextNotice = () => {
    setActiveNoticeIndex((prev) => (prev + 1) % SCHOOL_NOTICES.length);
  };

  const prevNotice = () => {
    setActiveNoticeIndex((prev) => (prev - 1 + SCHOOL_NOTICES.length) % SCHOOL_NOTICES.length);
  };

  const returnTo = invitationToken
    ? `/parent?token=${encodeURIComponent(invitationToken)}${
        school ? `&school=${encodeURIComponent(school)}` : ""
      }`
    : "/parent";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <SEOHead title="Parent Portal - School Notices" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
              <p className="text-sm text-gray-600">Stay connected with your child's education</p>
            </div>
            <a
              href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-3">📢 Important School Notices</h2>
          <p className="text-blue-100 mb-4">
            View official communications from the school. Sign in to access more features and stay updated on your child's progress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">📱 Real-time Updates</h3>
              <p className="text-sm text-blue-100">Receive instant notifications about school events and announcements</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Academic Progress</h3>
              <p className="text-sm text-blue-100">Track your child's grades, attendance, and overall performance</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">💬 Direct Communication</h3>
              <p className="text-sm text-blue-100">Connect directly with teachers and school administration</p>
            </div>
          </div>
        </div>

        {/* Notice Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Viewing Notice {activeNoticeIndex + 1} of {SCHOOL_NOTICES.length}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={prevNotice}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Previous notice"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextNotice}
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Next notice"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Notice Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeNoticeIndex * 100}%)` }}
            >
              {SCHOOL_NOTICES.map((notice, index) => (
                <div key={notice.id} className="w-full flex-shrink-0 px-2">
                  <NoticeCard notice={notice} isActive={index === activeNoticeIndex} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {SCHOOL_NOTICES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveNoticeIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeNoticeIndex 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to notice ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Get Full Access to the Parent Portal
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Sign in to access your personalized dashboard, view your child's academic progress, 
            communicate with teachers, and receive important updates instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Sign In Now
            </a>
            <a
              href={`/api/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Account
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">© 2026 School Parent Portal. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-2">
              For support, contact your school administration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
    // Error state
    if (serverError || clientError) {
      return (
        <>
          <SEOHead title="Parent Portal" />
          <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="max-w-lg bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                {serverError || clientError}
              </p>
              {retrySync && (
                <button
                  onClick={retrySync}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </>
      );
    }

    // Loading state
    if (isLoading) {
      return <LoadingScreen message="Loading parent portal..." />;
    }

    // Not authenticated - Show landing page with notices
    if (!user) {
      return (
        <LandingPage 
          invitationToken={invitationToken}
          invitationData={invitationData}
          school={school}
        />
      );
    }

    // Authenticated user - Show dashboard or onboarding
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
      <meta name="description" content="Stay connected with your child's education through our parent portal" />
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}