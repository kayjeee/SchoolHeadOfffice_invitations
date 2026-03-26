'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { InvitationAPI } from '@/lib/api/invitation-api';
import { toast } from 'react-hot-toast';

interface AcceptTeacherInviteProps {
  schoolSlug: string;
  inviteToken: string;
}

export default function AcceptTeacherInvite({ schoolSlug, inviteToken }: AcceptTeacherInviteProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [teacherSlug, setTeacherSlug] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>('your school');

  const verifyInvitation = useCallback(async () => {
    if (!user?.sub) return;

    setStatus('verifying');
    try {
      // Direct API call via InvitationAPI
      const result = await InvitationAPI.acceptInvitation(inviteToken, user.sub);

      if (result.success) {
        setStatus('success');
        const slug = result.invitation?.teacher_slug ||
                     result.invitation?.teacher_name?.toLowerCase().replace(/ /g, '-') ||
                     user.nickname ||
                     'teacher';
        setTeacherSlug(slug);
        if (result.invitation?.school_name) setSchoolName(result.invitation.school_name);
      } else {
        setStatus('error');
        setError('Your invitation link could not be verified.');
      }
    } catch (err: any) {
      // Handle the "already processed" case as a success for the UI
      if (err.message?.toLowerCase().includes('already processed') ||
          err.message?.toLowerCase().includes('already accepted')) {
        setStatus('success');
        // We'll need to rely on fallbacks for the slug if the API doesn't return it in the error response
        setTeacherSlug(user.nickname || 'teacher');
      } else {
        setStatus('error');
        setError(err.message || 'Verification failed. The link might be expired or invalid.');
      }
    }
  }, [inviteToken, user?.sub, user?.nickname]);

  useEffect(() => {
    if (!isUserLoading && user) {
      verifyInvitation();
    }
  }, [isUserLoading, user, verifyInvitation]);

  if (isUserLoading || status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Verifying your invitation...</h2>
          <p className="text-gray-500 mt-1">Please wait while we link your account.</p>
        </div>
        <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full animate-progress-indeterminate"></div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-10 bg-white rounded-3xl shadow-xl border border-green-50/50 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Invitation Accepted!</h2>
          <p className="text-gray-600">
            You are now linked to <span className="font-semibold text-gray-900">{schoolName}</span>.
          </p>
        </div>
        <button
          onClick={() => router.push(`/teacher/school/${schoolSlug}/teachers/${teacherSlug}/dashboard`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          Go to Teacher Dashboard
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-10 bg-white rounded-3xl shadow-xl border border-red-50 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Link Expired</h2>
          <p className="text-gray-600 max-w-xs mx-auto">
            {error || 'This invitation link is no longer valid or has already been used.'}
          </p>
        </div>
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => window.location.href = 'mailto:admin@schoolheadoffice.com'}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Contact Admin
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-white hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-2xl transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {!user && !isUserLoading && (
        <button
          onClick={() => {
            const returnTo = encodeURIComponent(window.location.href);
            window.location.href = `/api/auth/login?returnTo=${returnTo}`;
          }}
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:bg-blue-700 transition"
        >
          Sign in to Accept Invite
        </button>
      )}
    </div>
  );
}
