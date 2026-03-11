import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getSession } from "@auth0/nextjs-auth0";

import ErrorBoundary from '../../../../../components/common/ErrorBoundary';
import { SchoolAPI, School, Teacher, GradeAssignment } from '../../../../../lib/api/school-api';

const FrontPageLayout = dynamic(
  () => import("../../../../../components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface TeacherProfileProps {
  school: School | null;
  teacher: Teacher | null;
  grades: GradeAssignment[];
  isOwnProfile: boolean;
  isParent: boolean;
  schoolSlug: string;
  teacherSlug: string;
}

export const getServerSideProps: GetServerSideProps<TeacherProfileProps> = async (context) => {
  const { schoolSlug, teacherSlug } = context.params as { schoolSlug: string, teacherSlug: string };

  let session = null;
  try {
    session = await getSession(context.req, context.res);
  } catch (e) {
    console.warn('⚠️ [TeacherProfile.GSSP] getSession failed.');
  }

  const schoolName = decodeURIComponent(schoolSlug.replace(/\+/g, ' '));

  // Extract shortId from teacherSlug (last 4 chars after last '-')
  const slugParts = teacherSlug.split('-');
  const shortId = slugParts[slugParts.length - 1];

  let school: School | null = null;
  let teacher: Teacher | null = null;
  let grades: GradeAssignment[] = [];

  try {
    const schoolResponse = await SchoolAPI.getSchools({ search: schoolName, limit: 10 });
    school = schoolResponse.schools.find(s => s.schoolName.toLowerCase() === schoolName.toLowerCase()) || null;

    if (!school && schoolResponse.schools.length > 0) {
      school = schoolResponse.schools[0];
    }

    if (school) {
      const teachers = await SchoolAPI.getTeachers(school.id);
      // Find teacher where id ends with shortId OR slug matches exactly
      teacher = teachers.find(t => t.id.endsWith(shortId) || t.slug === teacherSlug) || null;

      if (teacher) {
        grades = await SchoolAPI.getTeacherGradeAssignments(teacher.id);
      }
    }
  } catch (err: any) {
    console.error('❌ [TeacherProfile.GSSP] Error fetching data:', err.message);
  }

  const user = session?.user;
  const isOwnProfile = user && teacher && (user.sub === teacher.auth0_id);
  const isParent = user?.role === 'parent';

  return {
    props: {
      school,
      teacher,
      grades,
      isOwnProfile: !!isOwnProfile,
      isParent: !!isParent,
      schoolSlug,
      teacherSlug,
    },
  };
};

export default function TeacherProfile({
  school,
  teacher,
  grades,
  isOwnProfile,
  isParent,
  schoolSlug,
  teacherSlug,
}: TeacherProfileProps) {
  if (!school || !teacher) {
    return (
      <FrontPageLayout userRoles={['guest']}>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the teacher profile you're looking for.</p>
          <Link href="/teacher/school" className="text-blue-600 hover:underline">
            Back to School Search
          </Link>
        </div>
      </FrontPageLayout>
    );
  }

  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const canonicalUrl = `https://www.schoolheadoffice.com/school/${schoolSlug}/teachers/${teacherSlug}`;

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${teacher.name} | ${school.schoolName} | School Head Office`}</title>
        <meta name="description" content={`${teacher.name} teaches at ${school.schoolName}. View their grades and contact info.`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${teacher.name} | ${school.schoolName} | School Head Office`} />
        <meta property="og:description" content={`${teacher.name} teaches at ${school.schoolName}. View their grades and contact info.`} />
        {teacher.avatar || school.logo ? (
          <meta property="og:image" content={teacher.avatar || school.logo || ''} />
        ) : null}
      </Head>

      <FrontPageLayout userRoles={['guest']}>
        <div className="bg-gray-50 min-h-screen pb-20">
          {/* Header/Hero Section */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <nav className="flex mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li><Link href="/teacher/school" className="hover:text-blue-600">Schools</Link></li>
                  <li><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
                  <li><Link href={`/teacher/school/${schoolSlug}`} className="hover:text-blue-600">{school.schoolName}</Link></li>
                  <li><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
                  <li><Link href={`/teacher/school/${schoolSlug}/teachers`} className="hover:text-blue-600">Teachers</Link></li>
                  <li><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
                  <li className="font-medium text-gray-900">{teacher.name}</li>
                </ol>
              </nav>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="w-32 h-32 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 text-4xl font-bold overflow-hidden shadow-inner">
                  {teacher.avatar ? (
                    <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{teacher.name}</h1>
                  <p className="text-xl text-blue-600 font-medium mb-4">{school.schoolName}</p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {teacher.grades.map((grade, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">
                        {grade}
                      </span>
                    ))}
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/teacher/dashboard"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Go to Dashboard
                      <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* About Section */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {teacher.bio || `${teacher.name} is a dedicated educator at ${school.schoolName}, specializing in ${teacher.grades.join(', ')}.`}
                    </p>
                  </div>
                </section>

                {/* Grades & Classes */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Grades & Classes</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {grades.length > 0 ? (
                      grades.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <span className="text-sm font-bold text-gray-400">Class Info</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{assignment.grade_name}</h3>
                          <p className="text-gray-500 font-medium">
                            {assignment.learner_count} Learners Enrolled
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 italic">No class assignments found.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Contact Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Contact Information</h3>

                  {isParent ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                          <p className="text-gray-900 font-medium truncate">{teacher.email || 'Contact via school'}</p>
                        </div>
                      </div>

                      <button className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        Send Message
                      </button>
                      <p className="text-xs text-center text-gray-400 italic">
                        Responses typically within 24-48 hours.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-8">
                        Contact details are only available to verified parents and staff members.
                      </p>
                      <Link
                        href="/api/auth/login"
                        className="inline-block w-full py-3 px-6 border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors text-center"
                      >
                        Sign In to Contact
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
