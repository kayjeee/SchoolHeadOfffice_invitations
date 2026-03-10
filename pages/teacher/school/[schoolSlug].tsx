import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

const FrontPageLayout = dynamic(
  () => import("../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

const TeacherSchoolPage = () => {
  const router = useRouter();
  const { schoolSlug } = router.query;
  const schoolName = schoolSlug ? decodeURIComponent((schoolSlug as string).replace(/\+/g, ' ')) : '';

  return (
    <ErrorBoundary>
      <Head>
        <title>{schoolName} | Teacher Portal</title>
      </Head>
      <FrontPageLayout userRoles={['guest']}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{schoolName}</h1>
          <p className="text-xl text-gray-600 mb-8">Welcome to the Teacher Portal for {schoolName}.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-2xl mx-auto text-left">
            <p className="text-sm text-yellow-700">
              Teacher features for this school are coming soon. Please check back later or contact your administrator.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-10 text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2"
          >
            ← Back to School Search
          </button>
        </div>
      </FrontPageLayout>
    </ErrorBoundary>
  );
};

export default TeacherSchoolPage;
