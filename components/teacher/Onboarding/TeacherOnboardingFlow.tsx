'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Search
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
  const [step, setStep] = useState<'verify' | 'profile'>('verify');
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone_number || invitationData?.recipient_phone_number || ''
  );

  // Profile Step State
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState(user?.given_name || user?.first_name || '');
  const [surname, setSurname] = useState(user?.family_name || user?.surname || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // School picker state when token has no schoolId
  const initialSchoolId = schoolId || invitationData?.school_id || null;
  const [schoolSearchQuery, setSchoolSearchQuery] = useState(schoolName || '');
  const [schoolSuggestions, setSchoolSuggestions] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);

  const isSchoolLocked = Boolean(initialSchoolId);

  const resolvedSchoolName =
    selectedSchool?.name ||
    schoolName ||
    invitationData?.school_name ||
    invitationData?.school ||
    'School';

  const finalSchoolId =
    initialSchoolId ||
    selectedSchool?.id ||
    '';

  const resolvedSlug =
    schoolSlug ||
    invitationData?.school_slug ||
    (resolvedSchoolName !== 'School' ? resolvedSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'school');

  // Debounced school search
  useEffect(() => {
    if (isSchoolLocked) return;
    if (!schoolSearchQuery.trim()) {
      setSchoolSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSchools(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const cleanBase = apiBase.endsWith('/api/v1') ? apiBase : `${apiBase}/api/v1`;
        const res = await fetch(`${cleanBase}/schools?search=${encodeURIComponent(schoolSearchQuery.trim())}`);
        if (res.ok) {
          const json = await res.json();
          const list = json.schools || json.data?.schools || json.data || [];
          setSchoolSuggestions(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Error searching schools:', err);
      } finally {
        setIsSearchingSchools(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [schoolSearchQuery, isSchoolLocked]);

  const handleSchoolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSchoolSearchQuery(val);
    setShowSchoolSuggestions(true);
    if (selectedSchool && selectedSchool.name !== val) {
      setSelectedSchool(null);
    }
  };

  const handleSelectSchool = (schoolItem: any) => {
    const id = schoolItem.id || schoolItem._id;
    const name = schoolItem.schoolName || schoolItem.name || 'School';
    setSelectedSchool({ id, name });
    setSchoolSearchQuery(name);
    setShowSchoolSuggestions(false);
  };

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

      if (!finalSchoolId) {
        setErrorMessage('Please select your school from the list before proceeding.');
        setIsSubmitting(false);
        return;
      }

      // 2. Call InvitationAPI.matchByPhone
      const matchResult = await InvitationAPI.matchByPhone(
        cleanPhone,
        user?.sub || 'system',
        finalSchoolId
      );

      if (matchResult.success && matchResult.matched_count > 0) {
        setSuccessMessage('Invitation matched! Please enter your profile details.');
        setTimeout(() => {
          setSuccessMessage(null);
          setStep('profile');
        }, 800);
      } else {
        // Fallback: If token was present, or school slug is known, proceed to profile step
        if (invitationData?.token) {
          setSuccessMessage('Invitation accepted! Please enter your profile details.');
          setTimeout(() => {
            setSuccessMessage(null);
            setStep('profile');
          }, 800);
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
        setSuccessMessage('Proceeding to profile setup...');
        setTimeout(() => {
          setSuccessMessage(null);
          setStep('profile');
        }, 800);
      } else {
        setErrorMessage(
          err.message || 'Verification failed. Please check your phone number and try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !surname.trim()) {
      setErrorMessage('First name and surname are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app';
      const cleanBase = apiBase.endsWith('/api/v1') ? apiBase.replace(/\/api\/v1$/, '') : apiBase;
      const auth0Id = user?.sub;

      if (!auth0Id) {
        throw new Error('User session not found.');
      }

      const res = await fetch(
        `${cleanBase}/api/v1/users/update_profile?auth0_id=${encodeURIComponent(auth0Id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || undefined,
            first_name: firstName.trim(),
            surname: surname.trim()
          })
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Profile update failed: ${errorText}`);
      }

      setSuccessMessage('Profile updated successfully! Redirecting to teacher portal...');
      setTimeout(() => {
        router.push(`/teacher/${encodeURIComponent(resolvedSlug)}`);
      }, 1000);
    } catch (err: any) {
      console.error('Teacher profile update error:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
        {step === 'profile' ? (
          <>
            {/* Header Block */}
            <div className="p-8 bg-slate-900 text-white text-center relative overflow-hidden">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-1">Faculty Profile Setup</h2>
              <p className="text-xs text-slate-400 font-medium">
                Personal details for <span className="text-white font-bold">{resolvedSchoolName}</span>
              </p>
            </div>

            {/* Profile Details Form */}
            <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                  Please enter your full name and title to complete your faculty profile registration.
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

              {/* Title Select */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Title
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Title (Optional)</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                  <option value="Rev">Rev</option>
                </select>
              </div>

              {/* First Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Kagiso"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Surname Input */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="e.g. Sebogodi"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !firstName.trim() || !surname.trim()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
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

          {/* School Selection Field */}
          <div className="space-y-2 relative">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              School
            </label>
            {isSchoolLocked ? (
              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm flex items-center gap-2">
                <School className="w-5 h-5 text-slate-400" />
                <span>{resolvedSchoolName}</span>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={schoolSearchQuery}
                  onChange={handleSchoolInputChange}
                  onFocus={() => setShowSchoolSuggestions(true)}
                  placeholder="Search your school e.g. Kagiso High School..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                />

                {/* Dropdown Suggestions */}
                {showSchoolSuggestions && (schoolSuggestions.length > 0 || isSearchingSchools) && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {isSearchingSchools ? (
                      <div className="p-4 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching schools...</span>
                      </div>
                    ) : (
                      schoolSuggestions.map((schoolItem) => (
                        <button
                          key={schoolItem.id || schoolItem._id}
                          type="button"
                          onClick={() => handleSelectSchool(schoolItem)}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-xs font-bold text-slate-800 transition-colors flex items-center justify-between"
                        >
                          <span>{schoolItem.schoolName || schoolItem.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{schoolItem.city || schoolItem.province || 'School'}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {schoolSearchQuery && !selectedSchool && !isSearchingSchools && (
                  <p className="text-[11px] text-amber-600 font-extrabold mt-1">Please select a school from the suggestions dropdown above</p>
                )}
              </div>
            )}
          </div>

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
            disabled={isSubmitting || !phoneNumber.trim() || !finalSchoolId}
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
          </>
        )}
      </div>
    </div>
  );
}
