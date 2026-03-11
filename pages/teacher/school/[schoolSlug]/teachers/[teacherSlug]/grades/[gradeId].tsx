import React, { useState, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getSession } from "@auth0/nextjs-auth0";
import { toast, Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SchoolAPI, School, Teacher, Grade, Learner, LearnerInvitationDetail, GradeAssignment } from '@/lib/api/school-api';

const FrontPageLayout = dynamic(
  () => import("@/components/Layouts/FrontPageLayout"),
  { ssr: true }
);

interface GradeManagementProps {
  grade: Grade;
  learners: Learner[];
  invitations: LearnerInvitationDetail[];
  school: School;
  teacher: Teacher;
  schoolSlug: string;
  teacherSlug: string;
  error?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { schoolSlug, teacherSlug, gradeId } = context.params as { schoolSlug: string, teacherSlug: string, gradeId: string };
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
  const schoolName = decodeURIComponent(schoolSlug.replace(/\+/g, ' '));
  const slugParts = teacherSlug.split('-');
  const shortId = slugParts[slugParts.length - 1];

  try {
    const schoolResponse = await SchoolAPI.getSchools({ search: schoolName, limit: 10 });
    const school = schoolResponse.schools.find(s => s.schoolName.toLowerCase() === schoolName.toLowerCase()) || schoolResponse.schools[0];

    if (!school) {
      return { notFound: true };
    }

    const teachers = await SchoolAPI.getTeachers(school.id);
    const teacherBrief = teachers.find(t => t.id.endsWith(shortId) || t.slug === teacherSlug);

    if (!teacherBrief) {
      return { notFound: true };
    }

    // Authorization: User must be an admin OR the teacher themselves
    if (user.role !== 'admin' && user.sub !== teacherBrief.auth0_id) {
      return {
        props: { error: 'Forbidden' },
      };
    }

    // Verify grade ownership
    const assignments = await SchoolAPI.getTeacherGradeAssignments(teacherBrief.id);
    const isAssigned = assignments.some(a => a.id === gradeId);

    if (!isAssigned && user.role !== 'admin') {
      return {
        props: { error: 'Forbidden' },
      };
    }

    const [grade, learners, invitations, profileData] = await Promise.all([
      SchoolAPI.getGrade(gradeId),
      SchoolAPI.getGradeLearners(gradeId),
      SchoolAPI.getGradeInvitations(gradeId),
      SchoolAPI.getTeacherProfile(teacherBrief.id)
    ]);

    return {
      props: {
        grade,
        learners,
        invitations,
        school,
        teacher: profileData.teacher,
        schoolSlug,
        teacherSlug,
      },
    };
  } catch (err) {
    console.error('Error fetching grade data:', err);
    return { notFound: true };
  }
};

export default function GradeManagement({
  grade,
  learners,
  invitations,
  school,
  teacher,
  schoolSlug,
  teacherSlug,
  error
}: GradeManagementProps) {
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const [isBulkInviting, setIsBulkInviting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedLearnerForHistory, setSelectedLearnerForHistory] = useState<Learner | null>(null);

  if (error === 'Forbidden') {
    return (
      <FrontPageLayout userRoles={['teacher']}>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
          <p className="text-gray-600">You do not have permission to access this grade management page.</p>
        </div>
      </FrontPageLayout>
    );
  }

  const toggleLearnerSelection = (id: string) => {
    setSelectedLearners(prev =>
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedLearners.length === unlinkedLearners.length) {
      setSelectedLearners([]);
    } else {
      setSelectedLearners(unlinkedLearners.map(l => l.id));
    }
  };

  const unlinkedLearners = useMemo(() => learners.filter(l => l.status === 'Unlinked'), [learners]);

  const handleBulkInvite = async () => {
    if (selectedLearners.length === 0) return;

    setIsBulkInviting(true);
    const loadingToast = toast.loading(`Sending ${selectedLearners.length} invitations...`);
    try {
      const result = await SchoolAPI.bulkCreateInvitations(selectedLearners);
      if (result.success) {
        toast.success(`Successfully sent ${selectedLearners.length} invitations!`, { id: loadingToast });
        setSelectedLearners([]);
        // Ideally, we'd refresh the data here
        window.location.reload();
      } else {
        toast.error('Failed to send bulk invitations.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('An error occurred while sending invitations.', { id: loadingToast });
    } finally {
      setIsBulkInviting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    const loadingToast = toast.loading('Resending invitation...');
    try {
      const result = await SchoolAPI.resendInvitation(invitationId);
      if (result.success) {
        toast.success('Invitation resent successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to resend invitation.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('An error occurred while resending the invitation.', { id: loadingToast });
    }
  };

  const viewHistory = (learner: Learner) => {
    setSelectedLearnerForHistory(learner);
    setIsHistoryOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Linked':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Linked</span>;
      case 'Pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      default:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">Unlinked</span>;
    }
  };

  if (!grade || !school || !teacher) return null;

  return (
    <ErrorBoundary>
      <Head>
        <title>{`${grade.name} | ${school.schoolName} | Management`}</title>
      </Head>

      <FrontPageLayout userRoles={['teacher']}>
        <Toaster position="top-right" />
        <div className="bg-gray-50 min-h-screen pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <nav className="flex mb-8 text-sm font-medium text-gray-500 items-center gap-2">
              <Link href={`/teacher/school/${schoolSlug}/teachers/${teacherSlug}/dashboard`} className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900">{grade.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{grade.name}</h1>
                <p className="text-gray-600">{school.schoolName} • {learners.length} Learners</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkInvite}
                  disabled={selectedLearners.length === 0 || isBulkInviting}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {selectedLearners.length > 0 ? `Invite (${selectedLearners.length}) Parents` : 'Bulk Invite'}
                </button>
              </div>
            </div>

            {/* Learner Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={selectedLearners.length === unlinkedLearners.length && unlinkedLearners.length > 0}
                          onChange={toggleAllSelection}
                        />
                      </th>
                      <th className="px-6 py-4">Learner Name</th>
                      <th className="px-6 py-4">Parent Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Action</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {learners.map((learner) => {
                      const invitation = invitations.find(inv => inv.learner_id === learner.id || inv.id === learner.invitation_id);
                      return (
                        <tr key={learner.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-30"
                              disabled={learner.status !== 'Unlinked'}
                              checked={selectedLearners.includes(learner.id)}
                              onChange={() => toggleLearnerSelection(learner.id)}
                            />
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{learner.name}</td>
                          <td className="px-6 py-4 text-gray-600">{learner.parent_name || '—'}</td>
                          <td className="px-6 py-4">
                            {getStatusBadge(learner.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {invitation?.last_action || 'No action yet'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              {learner.status === 'Pending' && invitation && (
                                <button
                                  onClick={() => handleResend(invitation.id)}
                                  className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                >
                                  Resend
                                </button>
                              )}
                              <button
                                onClick={() => viewHistory(learner)}
                                className="text-gray-600 hover:text-gray-800 font-bold text-sm"
                              >
                                View History
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Communication History Slide-over/Drawer */}
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                  <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Communication Log</h2>
                      <p className="text-sm text-gray-500">{selectedLearnerForHistory?.name}</p>
                    </div>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                      {/* Mocked history for now, could be fetched from API */}
                      <div className="relative pl-8 pb-8 border-l-2 border-blue-100 last:border-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm" />
                        <p className="text-sm font-bold text-gray-900">WhatsApp Sent</p>
                        <p className="text-xs text-gray-500 mb-1">Oct 24, 2023 • 10:15 AM</p>
                        <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 border border-gray-100">
                          "Hello [Parent Name], please join our Parent Portal to track [Learner Name]'s progress..."
                        </div>
                      </div>

                      <div className="relative pl-8 pb-8 border-l-2 border-blue-100 last:border-0 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-300 rounded-full border-4 border-white shadow-sm" />
                        <p className="text-sm font-bold text-gray-900">Link Clicked</p>
                        <p className="text-xs text-gray-500 mb-1">Oct 24, 2023 • 2:30 PM</p>
                        <p className="text-xs text-gray-600 italic">Magic link was opened from a mobile device (Android/Chrome).</p>
                      </div>

                      {selectedLearnerForHistory?.status === 'Linked' && (
                        <div className="relative pl-8 pb-8 border-l-2 border-blue-100 last:border-0 last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm" />
                          <p className="text-sm font-bold text-gray-900">Account Linked</p>
                          <p className="text-xs text-gray-500 mb-1">Oct 25, 2023 • 09:45 AM</p>
                          <p className="text-xs text-gray-600">Parent successfully registered and linked to learner.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Close Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </FrontPageLayout>
    </ErrorBoundary>
  );
}
