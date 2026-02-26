import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface SchoolOverviewProps {
  school_slug: string;
}

export const getServerSideProps: GetServerSideProps<SchoolOverviewProps> = async (context) => {
  const { school_slug } = context.params as { school_slug: string };

  return {
    props: {
      school_slug,
    },
  };
};

export default function SchoolOverviewPage({ school_slug }: SchoolOverviewProps) {
  console.log('🏛️ [SchoolOverviewPage] Rendered with school_slug:', school_slug);

  if (school_slug === 'School') {
    console.warn('⚠️ [SchoolOverviewPage] Received fallback "School" as slug. This usually means the redirection source had no valid school name.');

    // In development, show a warning or redirect back to root if it's annoying
    // For now, let's just make it look better
  }

  // Directly use the school_slug as the display name to strictly match the school name
  // But make it pretty if it's 'School'
  const displayName = school_slug === 'School' ? 'Your School' : (school_slug || 'School');

  return (
    <FrontPageLayout>
      <Head>
        <title>{`${displayName} | Parent Portal Overview`}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-white">
              <h3 className="text-2xl leading-6 font-bold text-gray-900">
                Welcome to {displayName}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                School Dashboard & Overview
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mock Statistics for Test Overview */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Learners</p>
                <p className="mt-2 text-3xl font-extrabold text-blue-900">2</p>
                <p className="mt-1 text-sm text-blue-500 italic">Linked to your account</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Avg. Attendance</p>
                <p className="mt-2 text-3xl font-extrabold text-green-900">94%</p>
                <p className="mt-1 text-sm text-green-500 italic">This academic term</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">Reports</p>
                <p className="mt-2 text-3xl font-extrabold text-purple-900">3</p>
                <p className="mt-1 text-sm text-purple-500 italic">Pending review</p>
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-lg font-semibold text-gray-900">Latest Announcements</h4>
              </div>
              <ul className="divide-y divide-gray-200">
                <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">Upcoming Parent-Teacher Meeting</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Urgent
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Scheduled for Friday, October 25th at 3:00 PM.
                      </p>
                    </div>
                  </div>
                </li>
                <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">School Sports Day 2024</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Notice
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        The annual sports day has been moved to November 5th.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go to Full Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </FrontPageLayout>
  );
}
