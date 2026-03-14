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

        // Redirect to dashboard
        // We need a teacher slug. For now, we'll try to use a generic dashboard path or
        // redirect to the school detail page where they can see their status.
        // The most direct dashboard is /teacher/school/[schoolSlug]/teachers/[teacherSlug]/dashboard
        // Since we don't have the teacher slug here yet, we'll redirect to the school browser
        // or a loading page that resolves their profile.

        // Based on memory, there is a school detail page at /teacher/school/[schoolSlug]
        router.push(`/teacher/school/${schoolSlug}`);
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
