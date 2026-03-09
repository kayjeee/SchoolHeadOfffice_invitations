import React, { useState, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import ErrorBoundary from '../../components/common/ErrorBoundary';
import { SchoolAPI, School } from '../../lib/api/school-api';
import SchoolCard from '../../components/school/SchoolCard';
import SchoolSearchBar from '../../components/school/SchoolSearchBar';
import EmptyState from '../../components/school/EmptyState';

// Lazy load layout
const FrontPageLayout = dynamic(
  () => import("../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface SchoolBrowserProps {
  schools: School[];
  totalCount: number;
  page: number;
  error?: string | null;
}

export const getServerSideProps: GetServerSideProps<SchoolBrowserProps> = async (context) => {
  try {
    const page = typeof context.query.page === 'string' ? parseInt(context.query.page) : 1;
    const response = await SchoolAPI.getSchools({ page, limit: 20 });

    return {
      props: {
        schools: response.schools,
        totalCount: response.totalCount,
        page: response.page,
      },
    };
  } catch (err: any) {
    console.error('❌ [SchoolBrowser] Error fetching schools:', err.message);
    return {
      props: {
        schools: [],
        totalCount: 0,
        page: 1,
        error: "Failed to load schools. Please try again later.",
      },
    };
  }
};

export default function SchoolBrowser({ schools, totalCount, page, error }: SchoolBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side filtering
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;

    const query = searchQuery.toLowerCase().trim();
    return schools.filter((school) =>
      school.schoolName.toLowerCase().includes(query) ||
      school.city.toLowerCase().includes(query) ||
      school.province.toLowerCase().includes(query)
    );
  }, [searchQuery, schools]);

  return (
    <ErrorBoundary>
      <Head>
        <title>Find Your School | School Head Office</title>
        <meta name="description" content="Browse and connect with schools on School Head Office" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.schoolheadoffice.com/school" />
      </Head>

      <FrontPageLayout userRoles={['guest']}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Find Your School
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl">
              Connect with your school's online community to stay updated on your student's progress and achievements.
            </p>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <SchoolSearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100 self-start md:self-auto">
              Showing {filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {filteredSchools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          ) : (
            <EmptyState hasQuery={searchQuery.length > 0} />
          )}

          {/* Pagination Placeholder */}
          {totalCount > 20 && !searchQuery && (
            <div className="mt-12 flex justify-center">
              <p className="text-gray-400 text-sm">Scroll for more results</p>
            </div>
          )}
        </div>
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
