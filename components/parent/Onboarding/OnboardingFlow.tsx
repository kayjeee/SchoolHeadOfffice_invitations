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
import BackButton from './BackButton';

interface OnboardingFlowProps {
  user: any;
  invitationData: any;
}

export default function OnboardingFlow({ user, invitationData }: OnboardingFlowProps) {
  // Invitation state
  const [isInvitationPrefillLocked, setInvitationPrefillLocked] = useState(true);
  
  // Learners state
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(true);
  const [fetchLearnersError, setFetchLearnersError] = useState<string | null>(null);
  
  // User profile state
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Onboarding hook
  const { 
    completeStep, 
    goBack,
    currentStep, 
    progress, 
    onboardingData, 
    profile,
    steps // Check if this is available in your hook
  } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
    invitationData,
  });

  const hasInvitation = !!onboardingData.invitation_id;

  // Fetch existing user profile
  const fetchUserProfile = async () => {
    if (!user?.sub) {
      setIsLoadingProfile(false);
      return;
    }
    
    setIsLoadingProfile(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/users/${encodeURIComponent(user.sub)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.user) {
          console.log('📋 Existing user profile:', result.data.user);
          setExistingProfile(result.data.user);
        }
      } else {
        console.warn('Failed to fetch user profile:', response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch learners linked to this parent
  const fetchLearners = async () => {
    if (!user?.sub) {
      setIsLoadingLearners(false);
      return;
    }
    
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

  // Load initial data on mount
  useEffect(() => {
    fetchUserProfile();
    fetchLearners();
  }, [user]);

  // Handle final step completion and invitation claiming
  const handleFinalStepComplete = async (data: any) => {
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

  // Enhanced back button handler
  const handleGoBack = () => {
    console.log('🔙 Back button clicked for step:', currentStep);
    
    // Try the hook's goBack function first
    if (goBack && typeof goBack === 'function') {
      console.log('📞 Calling hook goBack function');
      goBack();
    } else {
      console.warn('⚠️ goBack function not available from hook, using manual navigation');
      
      // Manual step navigation based on current step
      const stepOrder = [
        'PROFILE_SETUP',
        'IDENTITY_VERIFICATION', 
        'LINK_LEARNERS',
        'PARENT_CONTACT_SUMMARY',
        'NOTIFICATION_PREFERENCES',
        'TERMS_ACCEPTANCE'
      ];
      
      const currentIndex = stepOrder.indexOf(currentStep);
      if (currentIndex > 0) {
        const previousStep = stepOrder[currentIndex - 1];
        console.log(`🔄 Manually navigating to previous step: ${previousStep}`);
        
        // You might need to call a different function to go back
        // This depends on your useParentOnboarding hook implementation
        // If there's a setCurrentStep or similar function, use it here
      } else {
        console.log('🏁 Already at first step, nowhere to go back');
      }
    }
  };

  // Render content with optional back button
  const renderWithBackButton = (content: React.ReactNode, showBack: boolean) => {
    if (!showBack) return content;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-start">
          <BackButton 
            onBack={handleGoBack} 
            disabled={false}
          />
        </div>
        {content}
      </div>
    );
  };

  // Render the current step
  const renderStep = () => {
    const isLocked = hasInvitation && isInvitationPrefillLocked;
    
    // Show back button on ALL steps except PROFILE_SETUP and INITIALIZING
    const showBackButton = currentStep !== 'PROFILE_SETUP' && currentStep !== 'INITIALIZING';

    // Debug info
    console.log('🔍 Current step:', currentStep);
    console.log('🔍 Show back button?', showBackButton);
    console.log('🔍 goBack function available?', typeof goBack === 'function');

    switch (currentStep) {
      case 'PROFILE_SETUP':
        if (isLoadingProfile) {
          return <LoadingScreen message="Loading your profile..." />;
        }
        
        // Extract first and last name from the combined name field
        const existingName = existingProfile?.name || '';
        const nameParts = existingName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        return (
          <ProfileSetup
            onComplete={(data) => completeStep(currentStep, data)}
            prefillData={{
              first_name: firstName,
              last_name: lastName,
              email: existingProfile?.email || user?.email || '',
              phone: hasInvitation 
                ? (onboardingData.parent_phone || existingProfile?.phone_number || '')
                : (existingProfile?.phone_number || ''),
            }}
            isLocked={isLocked}
            user={user}
          />
        );

      case 'IDENTITY_VERIFICATION':
        return renderWithBackButton(
          <IdentityVerification onComplete={(data) => completeStep(currentStep, data)} />,
          showBackButton
        );

      case 'LINK_LEARNERS':
        if (isLoadingLearners) {
          return <LoadingScreen message="Fetching your learners..." />;
        }
        
        if (fetchLearnersError) {
          return renderWithBackButton(
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700">Error</h3>
              <p className="text-gray-600 mt-2">{fetchLearnersError}</p>
            </div>,
            showBackButton
          );
        }
        
        return renderWithBackButton(
          <LinkLearners
            existingLearners={learners}
            onLearnerLinked={fetchLearners}
            onComplete={() => completeStep('LINK_LEARNERS', {})}
            user={user}
          />,
          showBackButton
        );

      case 'PARENT_CONTACT_SUMMARY':
        const parentData = {
          name: profile?.first_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : user?.name || '',
          email: profile?.email || user?.email || '',
          phone: profile?.phone || onboardingData.parent_phone || '',
        };
        
        const schoolData = {
          name: onboardingData.school_name || 'the school',
          whatsappNumber: onboardingData.school_whatsapp_number || null,
        };
        
        return renderWithBackButton(
          <ParentContactSummary
            parent={parentData}
            learners={learners}
            school={schoolData}
            onComplete={() => completeStep('PARENT_CONTACT_SUMMARY', {})}
          />,
          showBackButton
        );

      case 'NOTIFICATION_PREFERENCES':
        return renderWithBackButton(
          <NotificationPreferences 
            onComplete={(data) => completeStep(currentStep, data)} 
          />,
          showBackButton
        );

      case 'TERMS_ACCEPTANCE':
        return renderWithBackButton(
          <TermsAcceptance onComplete={handleFinalStepComplete} />,
          showBackButton
        );

      case 'INITIALIZING':
        return <LoadingScreen message="Initializing onboarding..." />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <OnboardingProgress currentStep={currentStep} progress={progress} />

        {/* Invitation banner */}
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

        {/* Debug info - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div className="font-semibold text-yellow-800">Debug Info:</div>
            <div className="text-yellow-700">
              <div>Current Step: {currentStep}</div>
              <div>Progress: {progress}%</div>
              <div>Has goBack function: {typeof goBack === 'function' ? '✅ Yes' : '❌ No'}</div>
            </div>
          </div>
        )}

        {/* Current step content */}
        <div className="mt-8">{renderStep()}</div>
      </div>
    </div>
  );
}