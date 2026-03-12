import { validateInvite } from '@/lib/actions/inviteActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AcceptInviteButton from '@/components/teacher/AcceptInviteButton';

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
                <strong>Email:</strong> {invite.email}
              </p>
            </div>

            <AcceptInviteButton
              schoolId={school._id.toString()}
              email={invite.email}
            />
          </div>

          <p className="mt-6 text-xs text-gray-400 text-center" suppressHydrationWarning>
            Invite expires on {new Date(invite.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
