// pages/teacher/school/[schoolSlug]/index.tsx
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getSession } from "@auth0/nextjs-auth0";
import { useRouter } from 'next/router';
import { z } from 'zod';

import ErrorBoundary from '../../../../components/common/ErrorBoundary';
import { SchoolAPI, School } from '../../../../lib/api/school-api';
import { apiClient } from '../../../../lib/api/api-client';
import SchoolHero from '../../../../components/teacher/SchoolHero';
import StatCard from '../../../../components/teacher/StatCard';
import AccessRequestModal from '../../../../components/teacher/AccessRequestModal';

const FrontPageLayout = dynamic(
  () => import("../../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface SchoolDetailPageProps {
  school: School | null;
  isAuthenticated: boolean;
  userRole: string | null;
  schoolSlug: string;
}

export const getServerSideProps: GetServerSideProps<SchoolDetailPageProps> = async (context) => {
  const { schoolSlug } = context.params as { schoolSlug: string };

  let session = null;
  try {
    session = await getSession(context.req, context.res);
  } catch (e) {
    console.warn('⚠️ [SchoolDetail.GSSP] getSession failed, likely due to missing Auth0 configuration in development.');
  }

  // Decode school name: "Far+North+Secondary" -> "Far North Secondary"
  const schoolName = decodeURIComponent(schoolSlug.replace(/\+/g, ' '));

  let school: School | null = null;
  try {
    // API Fetch: GET /api/v1/schools?search={schoolName}
    const response = await SchoolAPI.getSchools({ search: schoolName, limit: 10 });

    // Filter the array in JS to find the exact match for schoolName
    school = response.schools.find(s => s.schoolName.toLowerCase() === schoolName.toLowerCase()) || null;

    if (!school && response.schools.length > 0) {
        // Fallback to first result if exact match fails but we have results
        school = response.schools[0];
    }
  } catch (err: any) {
    console.error('❌ [SchoolDetail.GSSP] Error fetching school:', err.message);
  }

  return {
    props: {
      school,
      isAuthenticated: !!session?.user,
      userRole: (session?.user?.role as string) || null,
      schoolSlug,
    },
  };
};

export default function SchoolDetailPage({ school, isAuthenticated, userRole, schoolSlug }: SchoolDetailPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!school) {
    return (
      <FrontPageLayout userRoles={['guest']}>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">School Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the school you're looking for.</p>
          <Link href="/teacher/school" className="text-blue-600 hover:underline">
            Back to School Search
          </Link>
        </div>
      </FrontPageLayout>
    );
  }

  const handleRequestAccess = async () => {
    if (!isAuthenticated) {
      router.push(`/api/auth/login?returnTo=/teacher/school/${schoolSlug}`);
      return;
    }
    setIsModalOpen(true);
  };

  const confirmRequest = async () => {
    setIsSubmitting(true);
    setRequestStatus('idle');
    try {
      // POST /api/v1/request_accesses with school_id
      await apiClient.post('/request_accesses', { school_id: school.id }, z.any());
      setRequestStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setRequestStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Failed to request access:', err);
      setRequestStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canonicalUrl = `https://www.schoolheadoffice.com/teacher/school/${schoolSlug}`;

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${school.schoolName} | School Head Office`}</title>
        <meta name="description" content={`Connect with ${school.schoolName}. View statistics, request access as a teacher, or find the parent portal.`} />
        <link rel="canonical" href={canonicalUrl} />
        {school.logo && <meta property="og:image" content={school.logo} />}
        <meta property="og:title" content={`${school.schoolName} | School Head Office`} />
        <meta property="og:url" content={canonicalUrl} />
      </Head>

      <FrontPageLayout userRoles={['guest']}>
        <SchoolHero
          schoolName={school.schoolName}
          logo={school.logo}
          city={school.city}
          province={school.province}
        />

        {/* Stats Ribbon */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap justify-center divide-x divide-gray-200">
              <StatCard label="Teachers" value={school.teacherCount || 0} />
              <StatCard label="Learners" value={school.learnerCount || 0} />
              <StatCard label="Grades" value={school.gradeCount || 0} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card A: Teacher Access */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">I am a Teacher</h3>
              <p className="text-gray-600 mb-8 flex-grow">
                Request access to this school's dashboard to manage your classes, grades, and learner profiles.
              </p>
              <button
                onClick={handleRequestAccess}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Request Access
              </button>
            </div>

            {/* Card B: New School */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Not your school?</h3>
              <p className="text-gray-600 mb-8 flex-grow">
                If your school isn't listed or you're looking to register a new institution on our platform.
              </p>
              <Link
                href="/school/register"
                className="w-full py-3 px-4 border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold rounded-xl transition-colors text-center"
              >
                Register New School
              </Link>
            </div>

            {/* Card C: Parent Portal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">I am a Parent</h3>
              <p className="text-gray-600 mb-8 flex-grow">
                Looking for your child's progress? Head over to the Parent Portal to view reports and announcements.
              </p>
              <Link
                href={`/parent/school/${schoolSlug}`}
                className="w-full py-3 px-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold rounded-xl transition-colors text-center"
              >
                Go to Parent Portal
              </Link>
            </div>
          </div>
        </div>

        <AccessRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmRequest}
          schoolName={school.schoolName}
          isSubmitting={isSubmitting}
        />

        {/* Success/Error Toast for Request */}
        {requestStatus !== 'idle' && (
          <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom duration-300">
            {requestStatus === 'success' ? (
              <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Request sent successfully!</span>
              </div>
            ) : (
              <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Failed to send request. Please try again.</span>
              </div>
            )}
          </div>
        )}
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
