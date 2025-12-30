// components/parent/Onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { useParentOnboarding } from '../../../lib/hooks/useParentOnboarding';
import { ParentAPI, Learner } from '../../../lib/api/parent-api';
import { InvitationService } from '../../../lib/services/invitation.service';
import OnboardingProgress from './OnboardingProgress';
import ProfileSetup from './steps/ProfileSetup';
import IdentityVerification from './steps/IdentityVerification';
import LinkLearners from './steps/LinkLearners';
import ParentContactSummary from './steps/ParentContactSummary';
import NotificationPreferences from './steps/NotificationPreferences';
import TermsAcceptance from './steps/TermsAcceptance';
import LoadingScreen from '../../common/LoadingScreen';
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function OnboardingFlow({ user, invitationData }) {
  const [isInvitationPrefillLocked, setInvitationPrefillLocked] = useState(true);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(true);
  const [fetchLearnersError, setFetchLearnersError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const { completeStep, currentStep, progress, onboardingData, profile } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
    invitationData,
  });

  const hasInvitation = !!onboardingData.invitation_id;

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    if (!user?.sub) return;
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/users/${encodeURIComponent(user.sub)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUserProfile(data.data.user);
          console.log('✅ User profile loaded:', data.data.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch learners
  const fetchLearners = async () => {
    if (!user?.sub) return;
    setIsLoadingLearners(true);
    setFetchLearnersError(null);
    try {
      const response = await ParentAPI.getMyLearners(user.sub);
      setLearners(response.learners);
      console.log('✅ Learners loaded:', response.learners);
    } catch (error) {
      console.error("Failed to fetch learners:", error);
      setFetchLearnersError("We couldn't load your linked learners. Please try again later.");
    } finally {
      setIsLoadingLearners(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
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
        // Prepare prefill data from backend user profile
        const profilePrefillData = {
          first_name: userProfile?.name?.split(' ')[0] || '',
          last_name: userProfile?.name?.split(' ').slice(1).join(' ') || '',
          phone: userProfile?.phone_number || onboardingData.parent_phone || '',
          email: userProfile?.email || user?.email || '',
        };

        if (isLoadingProfile) {
          return <LoadingScreen message="Loading your profile..." />;
        }

        return (
          <ProfileSetup
            onComplete={(data) => completeStep(currentStep, data)}
            prefillData={profilePrefillData}
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
              <button
                onClick={fetchLearners}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          );
        }
        return (
          <LinkLearners
            existingLearners={learners}
            onLearnerLinked={fetchLearners}
            onComplete={() => completeStep('LINK_LEARNERS', {})}
            user={user}
          />
        );

      case 'PARENT_CONTACT_SUMMARY':
        const parentData = {
          name: userProfile?.name || 
                (profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.name || ''),
          email: userProfile?.email || profile?.email || user?.email || '',
          phone: userProfile?.phone_number || profile?.phone || onboardingData.parent_phone || '',
        };
        const schoolData = {
          name: onboardingData.school_name || 'the school',
          whatsappNumber: onboardingData.school_whatsapp_number || null,
        };
        return (
          <ParentContactSummary
            parent={parentData}
            learners={learners}
            school={schoolData}
            onComplete={() => completeStep('PARENT_CONTACT_SUMMARY', {})}
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