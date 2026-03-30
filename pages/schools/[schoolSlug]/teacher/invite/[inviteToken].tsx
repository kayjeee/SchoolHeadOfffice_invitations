import React from 'react';
import { useRouter } from 'next/router';
import { validateInviteClient } from '@/lib/api/invite-utils';
import AcceptTeacherInvite from '@/components/teacher/AcceptTeacherInvite';
import AcceptInviteButton from '@/components/teacher/AcceptInviteButton';
import FrontPageLayout from '@/components/Layouts/FrontPageLayout';

export default function InvitePage() {
  const router = useRouter();
  const { schoolSlug, inviteToken } = router.query;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!router.isReady) return;

    const fetchData = async () => {
      try {
        const result = await validateInviteClient(schoolSlug as string, inviteToken as string);
        if (result.valid) {
          setData(result);
        } else {
          setError(result.error || 'Invalid invitation');
        }
      } catch (err) {
        setError('Failed to validate invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, schoolSlug, inviteToken]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">{error || "The invite link is invalid."}</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-md">Go Home</button>
        </div>
      </div>
    );
  }

  const { invite, school } = data;
  const isEmail = invite.email && invite.email.includes('@');

  return (
    <FrontPageLayout userRoles={['guest']}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Welcome to {school.name}</h1>
            <p className="opacity-90">Teacher Onboarding</p>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>{isEmail ? 'Email' : 'Phone'}:</strong> {invite.email}
                </p>
              </div>

              <AcceptTeacherInvite
                schoolSlug={schoolSlug as string}
                inviteToken={inviteToken as string}
              />

              <div className="mt-8 pt-8 border-t border-gray-100 opacity-50">
                 <AcceptInviteButton
                   schoolId={invite.schoolId || ""}
                   schoolSlug={schoolSlug as string}
                   email={invite.email}
                   token={inviteToken as string}
                 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FrontPageLayout>
  );
}
