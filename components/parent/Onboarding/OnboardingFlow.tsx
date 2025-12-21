// components/parent/Onboarding/OnboardingFlow.tsx
import React, { useState } from 'react';
import { useParentOnboarding } from '../../../lib/hooks/useParentOnboarding';
import { ParentAPI } from '../../../lib/api/parent-api';
import { InvitationService } from '../../../lib/services/invitation.service';
import OnboardingProgress from './OnboardingProgress';
import ProfileSetup from './steps/ProfileSetup';
import IdentityVerification from './steps/IdentityVerification';
import LinkLearners from './steps/LinkLearners';
import NotificationPreferences from './steps/NotificationPreferences';
import TermsAcceptance from './steps/TermsAcceptance';
import LoadingScreen from '../../common/LoadingScreen';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function OnboardingFlow({ user, invitationData }) {
  const [isInvitationPrefillLocked, setInvitationPrefillLocked] = useState(true);
  const { completeStep, currentStep, progress, onboardingData } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
    invitationData,
  });

  const hasInvitation = !!onboardingData.invitation_id;

  const handleLinkLearner = async (data) => {
    try {
      await ParentAPI.linkLearner(data.learner_number);
      completeStep('LINK_LEARNERS', data);
    } catch (error) {
      console.error("Failed to link learner:", error);
    }
  };

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
        return <LinkLearners onComplete={handleLinkLearner} />;
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
