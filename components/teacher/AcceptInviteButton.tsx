'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { acceptTeacherInviteAction } from '@/lib/actions/inviteActions';
import { toast } from 'react-hot-toast';

interface AcceptInviteButtonProps {
  schoolId: string;
  schoolSlug: string;
  email: string;
  token: string;
}

export default function AcceptInviteButton({ schoolId, schoolSlug, email, token }: AcceptInviteButtonProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (isLoading) return;

    if (!user) {
      // Redirect to login if not authenticated
      // We encode the current URL as the returnTo destination
      const returnTo = encodeURIComponent(window.location.href);
      window.location.href = `/api/auth/login?returnTo=${returnTo}`;
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Accepting invitation...');

    try {
      const result = await acceptTeacherInviteAction(token, user.sub!);

      if (result.success) {
        toast.success('Invitation accepted!', { id: loadingToast });

        // Priority for dashboard redirection slug:
        // 1. Auth0 ID (most reliable for finding the profile in GSSP fallback)
        // 2. Teacher Name (legacy/formatted)
        const teacherIdentifier = user.sub || result.teacherName || 'teacher';
        const teacherSlug = teacherIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const targetSchoolSlug = result.schoolSlug || schoolSlug;

        // Redirect to the teacher dashboard: /teacher/school/[schoolSlug]/teachers/[teacherSlug]/dashboard
        router.push(`/teacher/school/${targetSchoolSlug}/teachers/${teacherSlug}/dashboard`);
      } else {
        toast.error(result.error || 'Failed to accept invitation', { id: loadingToast });
      }
    } catch (err) {
      toast.error('An error occurred', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50"
      onClick={handleAccept}
      disabled={isSubmitting || isLoading}
    >
      {isLoading ? 'Checking session...' : user ? 'Accept & Go to Dashboard' : 'Sign in to Accept Invite'}
    </button>
  );
}
