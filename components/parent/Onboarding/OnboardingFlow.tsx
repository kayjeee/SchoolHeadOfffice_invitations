// components/parent/Onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { useParentOnboarding } from '../../../lib/hooks/useParentOnboarding';
import { ParentAPI, Learner } from '../../../lib/api/parent-api';
import { InvitationService } from '../../../lib/services/invitation.service';
import OnboardingProgress from './OnboardingProgress';
import ProfileSetup from './steps/ProfileSetup';
import IdentityVerification from './steps/IdentityVerification';
import LinkLearners from './steps/LinkLearners';
import NotificationPreferences from './steps/NotificationPreferences';
import TermsAcceptance from './steps/TermsAcceptance';
import LoadingScreen from '../../common/LoadingScreen';
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function OnboardingFlow({ user, invitationData }) {
  const [isInvitationPrefillLocked, setInvitationPrefillLocked] = useState(true);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(true);
  const [fetchLearnersError, setFetchLearnersError] = useState<string | null>(null);

  const { completeStep, currentStep, progress, onboardingData } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
    invitationData,
  });

  const hasInvitation = !!onboardingData.invitation_id;

  const fetchLearners = async () => {
    if (!user?.sub) return;
    setIsLoadingLearners(true);
    setFetchLearnersError(null);
    try {
      const response = await ParentAPI.getMyLearners(user.sub);
      setLearners(response.learners);
    } catch (error) {
      console.error("Failed to fetch learners:", error);
      setFetchLearnersError("We couldn't load your linked learners. Please try again later.");
    } finally {
      setIsLoadingLearners(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, [user]);

  const handleFinalStepComplete = async (data) => {
    if (hasInvitation) {
      try {
        await InvitationService.claim(onboardingData.invitation_token, user.sub);
        sessionStorage.removeItem('sho_invitation');
      } catch (error) {
        console.error("Failed to claim invitation:", error);
      }
    }
    completeStep('TERMS_ACCEPTANCE', data);
  };

  const renderStep = () => {
    const isLocked = hasInvitation && isInvitationPrefillLocked;

    switch (currentStep) {
      case 'PROFILE_SETUP':
        return (
          <ProfileSetup
            onComplete={(data) => completeStep(currentStep, data)}
            prefillData={{ phone: onboardingData.parent_phone }}
            isLocked={isLocked}
          />
        );
      case 'LINK_LEARNERS':
        if (isLoadingLearners) {
          return <LoadingScreen message="Fetching your learners..." />;
        }
        if (fetchLearnersError) {
          return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700">Error</h3>
              <p className="text-gray-600 mt-2">{fetchLearnersError}</p>
            </div>
          );
        }
        return (
          <LinkLearners
            existingLearners={learners}
            onLearnerLinked={fetchLearners}
            onComplete={() => completeStep('LINK_LEARNERS')}
            user={user}
          />
        );
      case 'TERMS_ACCEPTANCE':
        return <TermsAcceptance onComplete={handleFinalStepComplete} />;
      case 'IDENTITY_VERIFICATION':
        return <IdentityVerification onComplete={(data) => completeStep(currentStep, data)} />;
      case 'NOTIFICATION_PREFERENCES':
        return <NotificationPreferences onComplete={(data) => completeStep(currentStep, data)} />;
      case 'INITIALIZING':
        return <LoadingScreen message="Initializing onboarding..." />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <OnboardingProgress currentStep={currentStep} progress={progress} />

        {hasInvitation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-3" />
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Invitation detected</span> — we've pre-filled some fields for you.
              </p>
            </div>
            {isInvitationPrefillLocked && (
              <button
                onClick={() => setInvitationPrefillLocked(false)}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
        )}

        <div className="mt-8">{renderStep()}</div>
      </div>
    </div>
  );
}
