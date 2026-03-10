import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getSession } from "@auth0/nextjs-auth0";
import { useRouter } from 'next/router';
import { z } from 'zod';

import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import { SchoolAPI, School, Teacher } from '../../../../../lib/api/school-api';
import { apiClient } from '../../../../../lib/api/api-client';
import TeacherCard from '../../../../../components/teacher/TeacherCard';
import JoinTeacherCTA from '../../../../../components/teacher/JoinTeacherCTA';
import AccessRequestModal from '../../../../../components/teacher/AccessRequestModal';

const FrontPageLayout = dynamic(
  () => import("../../../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface TeacherDirectoryProps {
  school: School | null;
  teachers: Teacher[];
  isAuthenticated: boolean;
  currentUserIsTeacher: boolean;
  schoolSlug: string;
}

export const getServerSideProps: GetServerSideProps<TeacherDirectoryProps> = async (context) => {
  const { schoolSlug } = context.params as { schoolSlug: string };

  let session = null;
  try {
    session = await getSession(context.req, context.res);
  } catch (e) {
    console.warn('⚠️ [TeacherDirectory.GSSP] getSession failed.');
  }

  const schoolName = decodeURIComponent(schoolSlug.replace(/\+/g, ' '));
  let school: School | null = null;
  let teachers: Teacher[] = [];

  try {
    const schoolResponse = await SchoolAPI.getSchools({ search: schoolName, limit: 10 });
    school = schoolResponse.schools.find(s => s.schoolName.toLowerCase() === schoolName.toLowerCase()) || null;

    if (!school && schoolResponse.schools.length > 0) {
      school = schoolResponse.schools[0];
    }

    if (school) {
      teachers = await SchoolAPI.getTeachers(school.id);
    }
  } catch (err: any) {
    console.error('❌ [TeacherDirectory.GSSP] Error fetching data:', err.message);
  }

  return {
    props: {
      school,
      teachers,
      isAuthenticated: !!session?.user,
      currentUserIsTeacher: session?.user?.role === 'teacher',
      schoolSlug,
    },
  };
};

export default function TeacherDirectory({
  school,
  teachers,
  isAuthenticated,
  currentUserIsTeacher,
  schoolSlug,
}: TeacherDirectoryProps) {
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

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      router.push(`/api/auth/login?returnTo=/teacher/school/${schoolSlug}/teachers`);
      return;
    }
    setIsModalOpen(true);
  };

  const confirmRequest = async () => {
    setIsSubmitting(true);
    setRequestStatus('idle');
    try {
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

  const canonicalUrl = `https://www.schoolheadoffice.com/teacher/school/${schoolSlug}/teachers`;

  return (
    <ErrorBoundary>
      <Head>
        <title>{`Teachers at ${school.schoolName} | School Head Office`}</title>
        <meta name="description" content={`Meet the teaching staff at ${school.schoolName} and view their academic contributions.`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <FrontPageLayout userRoles={['guest']}>
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/teacher/school" className="hover:text-blue-600">Schools</Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <Link href={`/teacher/school/${schoolSlug}`} className="hover:text-blue-600 truncate max-w-[150px] sm:max-w-none">
                    {school.schoolName}
                  </Link>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="font-medium text-gray-900">Teachers</li>
              </ol>
            </nav>

            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {school.schoolName} — Teaching Staff
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Browse the directory of educators dedicated to excellence at {school.schoolName}.
            </p>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-24">
          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} schoolSlug={schoolSlug} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No teachers listed yet</h3>
              <p className="text-gray-600">
                The teacher directory for this school is currently empty.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic CTA */}
        <JoinTeacherCTA
          currentUserIsTeacher={currentUserIsTeacher}
          schoolSlug={schoolSlug}
          onJoinClick={handleJoinClick}
        />

        <AccessRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmRequest}
          schoolName={school.schoolName}
          isSubmitting={isSubmitting}
        />

        {/* Success/Error Toast */}
        {requestStatus !== 'idle' && (
          <div className="fixed bottom-24 right-8 z-50 animate-in slide-in-from-bottom duration-300">
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
                <span>Failed to send request.</span>
              </div>
            )}
          </div>
        )}
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
