// components/parent/Onboarding/OnboardingFlow.tsx
import React from 'react';
import { useParentOnboarding } from '../../../lib/hooks/useParentOnboarding';
import OnboardingProgress from './OnboardingProgress';
import ProfileSetup from './steps/ProfileSetup';
import IdentityVerification from './steps/IdentityVerification';
import LinkLearners from './steps/LinkLearners';
import NotificationPreferences from './steps/NotificationPreferences';
import TermsAcceptance from './steps/TermsAcceptance';
import LoadingScreen from '../../common/LoadingScreen';

export default function OnboardingFlow({ user, invitationData, currentState }) {
  const { completeStep, currentStep, progress } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
  });

  const renderStep = () => {
    switch (currentStep) {
      case 'PROFILE_SETUP':
        return <ProfileSetup onComplete={(data) => completeStep(currentStep, data)} />;
      case 'IDENTITY_VERIFICATION':
        return <IdentityVerification onComplete={(data) => completeStep(currentStep, data)} />;
      case 'LINK_LEARNERS':
        return <LinkLearners onComplete={(data) => completeStep(currentStep, data)} />;
      case 'NOTIFICATION_PREFERENCES':
        return <NotificationPreferences onComplete={(data) => completeStep(currentStep, data)} />;
      case 'TERMS_ACCEPTANCE':
        return <TermsAcceptance onComplete={(data) => completeStep(currentStep, data)} />;
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
        <div className="mt-8">{renderStep()}</div>
      </div>
    </div>
  );
}
