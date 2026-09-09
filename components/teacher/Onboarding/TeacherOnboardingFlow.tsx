'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { InvitationAPI, InvitationData } from '../../../lib/api/invitation-api';
import {
  Phone,
  School,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

interface TeacherOnboardingFlowProps {
  user: any;
  invitationData?: InvitationData | null;
  schoolSlug?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
}

export default function TeacherOnboardingFlow({
  user,
  invitationData,
  schoolSlug,
  schoolId,
  schoolName
}: TeacherOnboardingFlowProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone_number || invitationData?.recipient_phone_number || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resolvedSchoolName =
    schoolName ||
    invitationData?.school_name ||
    invitationData?.school ||
    'School';

  const resolvedSchoolId =
    schoolId ||
    invitationData?.school_id ||
    '';

  const resolvedSlug =
    schoolSlug ||
    invitationData?.school_slug ||
    (resolvedSchoolName !== 'School' ? resolvedSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'school');

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
      return '27' + digits.slice(1);
    }
    return digits || phone.trim();
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = normalizePhone(phoneNumber);
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid South African phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. If token is present on invitationData, accept it
      if (invitationData?.token && user?.sub) {
        try {
          await InvitationAPI.acceptInvitation(invitationData.token, user.sub);
        } catch (acceptErr) {
          console.warn('Accept invitation by token failed, proceeding to phone match:', acceptErr);
        }
      }

      // 2. Call InvitationAPI.matchByPhone
      const matchResult = await InvitationAPI.matchByPhone(
        cleanPhone,
        user?.sub || 'system',
        resolvedSchoolId
      );

      if (matchResult.success && matchResult.matched_count > 0) {
        setSuccessMessage('Invitation matched! Redirecting to your teacher portal...');
        setTimeout(() => {
          router.push(`/teacher/${encodeURIComponent(resolvedSlug)}`);
        }, 1200);
      } else {
        // Fallback: If token was present, or school slug is known, navigate directly if match returned success
        if (invitationData?.token) {
          setSuccessMessage('Invitation accepted! Redirecting to teacher dashboard...');
          setTimeout(() => {
            router.push(`/teacher/${encodeURIComponent(resolvedSlug)}`);
          }, 1200);
        } else {
          setErrorMessage(
            `No pending teacher invitation found for ${phoneNumber}. Please ensure your administrator sent an invitation to this exact phone number.`
          );
        }
      }
    } catch (err: any) {
      console.error('Teacher phone verification error:', err);
      if (invitationData?.token) {
        // Handle token fallback gracefully
        setSuccessMessage('Redirecting to your school dashboard...');
        setTimeout(() => {
          router.push(`/teacher/${encodeURIComponent(resolvedSlug)}`);
        }, 1200);
      } else {
        setErrorMessage(
          err.message || 'Verification failed. Please check your phone number and try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
        {/* Header Block */}
        <div className="p-8 bg-slate-900 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1">Faculty Verification</h2>
          <p className="text-xs text-slate-400 font-medium">
            Connect to <span className="text-white font-bold">{resolvedSchoolName}</span>
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerifyPhone} className="p-8 space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              Enter the mobile / WhatsApp number where you received your teacher invitation to link your account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              Mobile / WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0821234567 or +2782..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !phoneNumber.trim()}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Invitation...</span>
              </>
            ) : (
              <>
                <span>Verify & Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <a
              href="/api/auth/logout"
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign out and try another account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
