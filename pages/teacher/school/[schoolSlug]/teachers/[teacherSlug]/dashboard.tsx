import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getSession } from "@auth0/nextjs-auth0";
import { toast, Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SchoolAPI, School, Teacher, TeacherStats, GradeAssignment, LearnerInvitation } from '@/lib/api/school-api';
import StatCard from '@/components/teacher/StatCard';

const FrontPageLayout = dynamic(
  () => import("@/components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface TeacherDashboardProps {
  teacher: Teacher;
  school: School;
  grades: GradeAssignment[];
  stats: TeacherStats;
  activity: LearnerInvitation[];
  schoolSlug: string;
  teacherSlug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { schoolSlug, teacherSlug } = context.params as { schoolSlug: string, teacherSlug: string };
  const session = await getSession(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/login?returnTo=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const user = session.user;

  console.log(`🔍 [Dashboard.GSSP] Params:`, { schoolSlug, teacherSlug, auth0Id: user.sub });

  // Decode school name and teacher slug
  const decodedSchoolSlug = decodeURIComponent(schoolSlug);
  const schoolSearchName = decodedSchoolSlug.replace(/-/g, ' ').replace(/\+/g, ' ');

  const slugParts = teacherSlug.split('-');
  const shortId = slugParts[slugParts.length - 1];

  try {
    console.log(`🏫 [Dashboard.GSSP] Looking up school for: "${schoolSearchName}" (slug: ${decodedSchoolSlug})`);

    // 1. Try fetching school
    const schoolResponse = await SchoolAPI.getSchools({ search: schoolSearchName, limit: 10 });
    console.log(`🏫 [Dashboard.GSSP] API Schools found:`, schoolResponse.schools.map(s => ({ id: s.id, name: s.schoolName })));

    let school = schoolResponse.schools.find(s =>
      s.schoolName.toLowerCase() === schoolSearchName.toLowerCase() ||
      s.id === decodedSchoolSlug
    ) || (schoolResponse.schools.length > 0 ? schoolResponse.schools[0] : null);

    // Fallback search with raw slug if no results
    if (!school && decodedSchoolSlug !== schoolSearchName) {
      console.log(`🏫 [Dashboard.GSSP] No initial results, trying search with raw slug: "${decodedSchoolSlug}"`);
      const fallbackResponse = await SchoolAPI.getSchools({ search: decodedSchoolSlug, limit: 10 });
      school = fallbackResponse.schools[0];
    }

    if (!school) {
      console.error(`❌ [Dashboard.GSSP] School not found for ${schoolSlug}`);
      return { notFound: true };
    }

    console.log(`✅ [Dashboard.GSSP] Found school: ${school.schoolName} (${school.id})`);

    // 2. Fetch teachers and find the right one
    const teachers = await SchoolAPI.getTeachers(school.id);
    console.log(`👨‍🏫 [Dashboard.GSSP] Teachers in school ${school.schoolName}:`, teachers.map(t => ({ id: t.id, name: t.name, slug: t.slug, auth0_id: t.auth0_id })));

    // Priority for finding the teacher:
    // 1. Exact Auth0 ID match (most secure)
    // 2. Exact slug match
    // 3. Short ID match (legacy/fallback)
    // 4. Email match (if available in session)
    // 5. Name match (last resort fallback)
    const teacherBrief = teachers.find(t => {
      const auth0Match = t.auth0_id === user.sub;
      const slugMatch = t.slug === teacherSlug;
      const idMatch = (shortId && t.id.endsWith(shortId));
      const emailMatch = user.email && t.email && t.email.toLowerCase() === user.email.toLowerCase();

      // For name match, we compare the normalized teacher name with the normalized slug
      const normalizedSlugName = teacherSlug.split('-').slice(0, -1).join(' ') || teacherSlug.replace(/-/g, ' ');
      const nameMatch = t.name.toLowerCase() === normalizedSlugName.toLowerCase();

      if (auth0Match || slugMatch || idMatch || emailMatch || nameMatch) {
        console.log(`✅ [Dashboard.GSSP] Teacher found! Match reasons:`, { auth0Match, slugMatch, idMatch, emailMatch, nameMatch });
        return true;
      }
      return false;
    });

    if (!teacherBrief) {
      console.warn(`⚠️ [Dashboard.GSSP] Teacher not found. Search criteria: auth0_id=${user.sub}, slug=${teacherSlug}, shortId=${shortId}`);
      return { notFound: true };
    }

    // Authorization check
    if (user.role !== 'admin' && user.sub !== teacherBrief.auth0_id) {
        return {
            props: { error: 'Forbidden' },
            notFound: false, // We'll handle 403 in the component or via a custom error page
        };
    }

    const [profileData, grades, activity] = await Promise.all([
      SchoolAPI.getTeacherProfile(teacherBrief.id),
      SchoolAPI.getTeacherGradeAssignments(teacherBrief.id),
      SchoolAPI.getPendingInvitations(teacherBrief.id)
    ]);

    return {
      props: {
        teacher: profileData.teacher,
        school,
        grades,
        stats: profileData.stats,
        activity,
        schoolSlug,
        teacherSlug,
      },
    };
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return { notFound: true };
  }
};

export default function TeacherDashboard({
  teacher,
  school,
  grades,
  stats,
  activity,
  schoolSlug,
  teacherSlug,
  error
}: TeacherDashboardProps & { error?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeAssignment | null>(null);
  const [inviteForm, setInviteForm] = useState({ parent_name: '', parent_phone: '', learner_name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localActivity, setLocalActivity] = useState(activity || []);

  if (error === 'Forbidden') {
    return (
      <FrontPageLayout userRoles={['teacher']}>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
          <p className="text-gray-600">You do not have permission to access this dashboard.</p>
        </div>
      </FrontPageLayout>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Sending invitation...');
    try {
      const result = await SchoolAPI.inviteParent(selectedGrade.id, inviteForm);
      if (result.success && result.invitation) {
        setLocalActivity([result.invitation, ...localActivity]);
        setIsModalOpen(false);
        setInviteForm({ parent_name: '', parent_phone: '', learner_name: '' });
        toast.success('Invitation sent successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to send invitation.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Failed to send invitation. Please try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!teacher || !school) return null;

  return (
    <ErrorBoundary>
      <Head>
        <title>{`Dashboard | ${teacher.name} | ${school.schoolName}`}</title>
      </Head>

      <FrontPageLayout userRoles={['teacher']}>
        <Toaster position="top-right" />
        <div className="bg-gray-50 min-h-screen pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">{teacher.name} • {school.schoolName}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedGrade(grades?.[0] || null); setIsModalOpen(true); }}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Invitation
                </button>
              </div>
            </div>

            {/* Stats Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
                <StatCard label="Total Learners" value={stats?.total_learners || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
              </div>
              <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
                <StatCard label="Active Grades" value={stats?.active_grades || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
              </div>
              <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
                <StatCard label="Pending Invites" value={stats?.pending_invites || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
              </div>
              <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
                <StatCard label="Parent Connection" value={`${stats?.parent_connection_rate || 0}%`} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Grade Management Table */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Grade Management</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                          <th className="px-6 py-4">Grade Name</th>
                          <th className="px-6 py-4">Learners</th>
                          <th className="px-6 py-4">Connection Rate</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {grades?.map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{grade.grade_name}</td>
                            <td className="px-6 py-4 text-gray-600">{grade.learner_count}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${grade.connection_rate || 0}%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{grade.connection_rate || 0}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/teacher/school/${schoolSlug}/teachers/${teacherSlug}/grades/${grade.id}`}
                                  className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                >
                                  View Class
                                </Link>
                                <button
                                  onClick={() => { setSelectedGrade(grade); setIsModalOpen(true); }}
                                  className="text-green-600 hover:text-green-800 font-bold text-sm"
                                >
                                  Invite Parent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {localActivity.length > 0 ? (
                        localActivity.map((inv) => (
                          <div key={inv.id} className="flex gap-4">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              inv.status === 'Accepted' ? 'bg-green-500' :
                              inv.status === 'Delivered' ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-grow">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-bold text-gray-900">{inv.parent_name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  inv.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                  inv.status === 'Delivered' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Invited for <span className="font-medium text-gray-700">{inv.learner_name}</span>
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(inv.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 text-sm italic">No recent invitations.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invitation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Invite Parent</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleInvite} className="p-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Grade</label>
                  <select
                    value={selectedGrade?.id}
                    onChange={(e) => setSelectedGrade(grades?.find(g => g.id === e.target.value) || null)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  >
                    {grades?.map(g => <option key={g.id} value={g.id}>{g.grade_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.parent_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, parent_name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    required
                    value={inviteForm.parent_phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, parent_phone: e.target.value })}
                    placeholder="e.g. +27 12 345 6789"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Learner Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.learner_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, learner_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                    ) : 'Send WhatsApp Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
