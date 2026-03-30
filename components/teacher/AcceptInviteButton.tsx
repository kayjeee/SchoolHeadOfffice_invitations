'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
      const returnTo = encodeURIComponent(window.location.href);
      window.location.href = `/api/auth/login?returnTo=${returnTo}`;
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Accepting invitation...');

    try {
      const response = await fetch('/api/teacher/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      const isAlreadyHandled =
        result.error?.toLowerCase().includes('already processed') ||
        result.error?.toLowerCase().includes('already accepted') ||
        result.error?.toLowerCase().includes('invitation not found');

      if (result.success || isAlreadyHandled) {
        toast.success(result.success ? 'Invitation accepted!' : 'Redirecting to your dashboard...', { id: loadingToast });

        let teacherSlug = result.teacherSlug;

        if (!teacherSlug) {
          const teacherName = result.teacherName || user.name || 'teacher';
          teacherSlug = teacherName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        const targetSchoolSlug = result.schoolSlug || schoolSlug;

        console.log(`🚀 [AcceptInviteButton] Redirecting to dashboard:`, { targetSchoolSlug, teacherSlug });

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
