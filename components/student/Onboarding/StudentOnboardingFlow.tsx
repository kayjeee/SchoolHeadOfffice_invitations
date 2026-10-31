// components/student/Onboarding/StudentOnboardingFlow.tsx
import React, { useState } from 'react';
import { UserProfile } from '@auth0/nextjs-auth0/client';
import { useStudentOnboarding } from '../../../lib/hooks/useStudentOnboarding';
import LoadingScreen from '../../common/LoadingScreen';

interface StudentOnboardingFlowProps {
  user: UserProfile | null;
  invitationData?: any;
}

export default function StudentOnboardingFlow({ user, invitationData }: StudentOnboardingFlowProps) {
  const onboarding = useStudentOnboarding({
    initialProfile: null,
    invitationData,
  });

  const [firstName, setFirstName] = useState(
    user?.given_name || user?.name?.split(' ')[0] || ''
  );
  const [surname, setSurname] = useState(
    user?.family_name || user?.name?.split(' ').slice(1).join(' ') || ''
  );
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState(
    invitationData?.school_name || invitationData?.schoolName || 'Kagiso High code'
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (onboarding.isLoading) {
    return <LoadingScreen message="Setting up your student workspace..." />;
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onboarding.completeStep('PROFILE_SETUP', {
        title: 'Student',
        first_name: firstName,
        surname: surname,
        name: `${firstName} ${surname}`.trim(),
        phone: phone,
        school_name: schoolName,
        primary_school_name: schoolName,
      });
    } catch (err) {
      console.error('Error submitting profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTermsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    setIsSubmitting(true);
    try {
      await onboarding.completeStep('TERMS_ACCEPTANCE', {
        terms_accepted: true,
        accepted_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error accepting terms:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">
            Student Onboarding
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {onboarding.currentStep === 'PROFILE_SETUP' ? 'Complete Your Profile' : 'Accept Terms & Conditions'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {onboarding.currentStep === 'PROFILE_SETUP'
              ? 'Verify your personal details to personalize your student portal.'
              : 'Please review and accept the student code of conduct to proceed.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${onboarding.progress || (onboarding.currentStep === 'TERMS_ACCEPTANCE' ? 50 : 10)}%` }}
          />
        </div>

        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          {onboarding.currentStep === 'PROFILE_SETUP' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="First Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Surname / Last Name</label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Surname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. 0814296653"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="School Name"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Saving Profile...' : 'Continue to Terms'}
              </button>
            </form>
          )}

          {onboarding.currentStep === 'TERMS_ACCEPTANCE' && (
            <form onSubmit={handleTermsSubmit} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 max-h-40 overflow-y-auto border border-gray-200">
                <p className="font-semibold text-gray-800 mb-1">Student Acceptable Use Policy</p>
                <p className="mb-2">
                  By accessing the School Head Office student portal, you agree to adhere to your school&apos;s digital code of conduct, respect fellow learners and educators, and maintain academic integrity in all communications and submissions.
                </p>
                <p>
                  Your activity within the portal is associated with your student account and monitored by school administrators.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I accept the student terms of service and acceptable use policy.
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onboarding.goBack}
                  className="w-1/3 py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!termsAccepted || isSubmitting}
                  className="w-2/3 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Completing Setup...' : 'Finish & Go to Dashboard'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
