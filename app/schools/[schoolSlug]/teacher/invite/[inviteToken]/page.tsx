import { validateInvite } from '@/lib/actions/inviteActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AcceptInviteButton from '@/components/teacher/AcceptInviteButton';
import AcceptTeacherInvite from '@/components/teacher/AcceptTeacherInvite';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    schoolSlug: string;
    inviteToken: string;
  }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { schoolSlug, inviteToken } = await params;

  const result = await validateInvite(schoolSlug, inviteToken);

  if (!result.valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">
            {result.error || "The invite link you followed is invalid or has expired."}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { invite, school } = result;

  console.log('📨 [InvitePage] Rendering invite:', {
    id: invite._id,
    email: invite.email,
    school: school.name,
    status: invite.status
  });

  const isEmail = invite.email && invite.email.includes('@');
  const isAccepted = invite.status === 'accepted';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Welcome to {school.name}</h1>
          <p className="opacity-90">Teacher Onboarding</p>
        </div>

        <div className="p-8">
          <p className="text-gray-700 mb-6">
            Hello! You've been invited to join <strong>{school.name}</strong> as a teacher.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>{isEmail ? 'Email' : 'Phone'}:</strong> {invite.email}
              </p>
            </div>

            {isAccepted ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-green-900">Invitation Accepted</p>
                      <p className="text-xs text-green-700">You are already a member of this school.</p>
                   </div>
                </div>

                <Link
                  href={`/teacher/school/${schoolSlug}/teachers/${invite.teacherName?.toLowerCase().replace(/ /g, '-') || 'dashboard'}/dashboard`}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Go to Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <AcceptTeacherInvite
                schoolSlug={schoolSlug}
                inviteToken={inviteToken}
              />
            )}

            <div className={cn("mt-8 pt-8 border-t border-gray-100", isAccepted ? "opacity-20 pointer-events-none" : "opacity-50")}>
               <p className="text-xs text-gray-400 text-center uppercase tracking-widest mb-4">Alternative Option</p>
               <AcceptInviteButton
                 schoolId={school._id.toString()}
                 schoolSlug={schoolSlug}
                 email={invite.email}
                 token={inviteToken}
               />
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-400 text-center" suppressHydrationWarning>
            Invite expires on {new Date(invite.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
