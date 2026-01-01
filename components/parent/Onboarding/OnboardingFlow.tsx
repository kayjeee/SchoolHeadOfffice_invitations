// components/parent/Onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { useParentOnboarding } from '../../../lib/hooks/useParentOnboarding';
import { ParentAPI, Learner } from '../../../lib/api/parent-api';
import { InvitationService } from '../../../lib/services/invitation.service';
import OnboardingProgress from './OnboardingProgress';
import ProfileSetup from './steps/ProfileSetup';
import IdentityVerification from './steps/IdentityVerification';
import LinkLearners from './steps/LinkLearners';
import SubscriptionChoice from './steps/SubscriptionChoice';
import PaymentSetup from './steps/PaymentSetup';
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
  console.log('');
  console.log('🎬 ═══════════════════════════════════════');
  console.log('🎬 OnboardingFlow Component Rendered');
  console.log('🎬 ═══════════════════════════════════════');
  console.log('👤 User:', user?.email || user?.sub);
  console.log('📨 Has invitation:', !!invitationData);
  
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
    completedSteps,
    profile,
    steps,
    isOnboardingComplete,
    _debug
  } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
    invitationData,
  });

  const hasInvitation = !!onboardingData.invitation_id;

  // Log hook state
  useEffect(() => {
    console.log('🔄 Hook State Update:', {
      currentStep,
      progress: `${progress.toFixed(1)}%`,
      completedSteps,
      isOnboardingComplete,
      totalSteps: steps?.length,
      goBackAvailable: typeof goBack === 'function'
    });
  }, [currentStep, progress, completedSteps, isOnboardingComplete, steps, goBack]);

  // Fetch existing user profile
  const fetchUserProfile = async () => {
    console.log('📥 Fetching user profile...', { userId: user?.sub });
    
    if (!user?.sub) {
      console.log('⏭️ Skipping profile fetch: no user ID');
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
          console.log('✅ User profile fetched:', result.data.user);
          setExistingProfile(result.data.user);
        } else {
          console.log('⚠️ Profile fetch succeeded but no user data');
        }
      } else {
        console.warn('❌ Failed to fetch user profile:', response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch learners linked to this parent
  const fetchLearners = async () => {
    console.log('📥 Fetching learners...', { userId: user?.sub });
    
    if (!user?.sub) {
      console.log('⏭️ Skipping learners fetch: no user ID');
      setIsLoadingLearners(false);
      return;
    }
    
    setIsLoadingLearners(true);
    setFetchLearnersError(null);
    try {
      const response = await ParentAPI.getMyLearners(user.sub);
      console.log('✅ Learners fetched:', {
        count: response.learners?.length || 0,
        learners: response.learners
      });
      setLearners(response.learners);
    } catch (error) {
      console.error("❌ Error fetching learners:", error);
      setFetchLearnersError("We couldn't load your linked learners. Please try again later.");
    } finally {
      setIsLoadingLearners(false);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    console.log('🚀 OnboardingFlow mounted, loading initial data...');
    fetchUserProfile();
    fetchLearners();
  }, [user]);

  // Handle final step completion and invitation claiming
  const handleFinalStepComplete = async (data: any) => {
    console.log('');
    console.log('🎊 ═══════════════════════════════════════');
    console.log('🎊 FINAL STEP COMPLETION');
    console.log('🎊 ═══════════════════════════════════════');
    console.log('📦 Final step data:', data);
    console.log('📨 Has invitation to claim:', hasInvitation);
    
    if (hasInvitation) {
      try {
        console.log('🔗 Claiming invitation...', onboardingData.invitation_token);
        await InvitationService.claim(onboardingData.invitation_token, user.sub);
        console.log('✅ Invitation claimed successfully');
        sessionStorage.removeItem('sho_invitation');
        console.log('🧹 Cleared invitation from sessionStorage');
      } catch (error) {
        console.error("❌ Failed to claim invitation:", error);
      }
    }
    
    console.log('➡️ Completing TERMS_ACCEPTANCE step...');
    completeStep('TERMS_ACCEPTANCE', data);
    console.log('🎊 ═══════════════════════════════════════');
    console.log('');
  };

  // Enhanced back button handler
  const handleGoBack = () => {
    console.log('');
    console.log('🔙 ═══════════════════════════════════════');
    console.log('🔙 BACK BUTTON CLICKED');
    console.log('🔙 ═══════════════════════════════════════');
    console.log('📍 Current step:', currentStep);
    console.log('🔍 goBack function available:', typeof goBack === 'function');
    
    if (goBack && typeof goBack === 'function') {
      console.log('✅ Calling hook goBack function');
      goBack();
    } else {
      console.error('❌ goBack function not available from hook!');
      console.error('⚠️ This should not happen - check useParentOnboarding hook');
    }
    
    console.log('🔙 ═══════════════════════════════════════');
    console.log('');
  };

  // Render content with optional back button
  const renderWithBackButton = (content: React.ReactNode, showBack: boolean) => {
    if (!showBack) {
      console.log('ℹ️ Not showing back button for this step');
      return content;
    }
    
    console.log('✅ Showing back button for this step');
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
    console.log('');
    console.log('🎨 ═══════════════════════════════════════');
    console.log('🎨 RENDERING STEP:', currentStep);
    console.log('🎨 ═══════════════════════════════════════');
    
    const isLocked = hasInvitation && isInvitationPrefillLocked;
    const showBackButton = currentStep !== 'PROFILE_SETUP' && currentStep !== 'INITIALIZING';

    console.log('🔒 Invitation locked:', isLocked);
    console.log('⬅️ Show back button:', showBackButton);
    console.log('🎨 ═══════════════════════════════════════');
    console.log('');

    switch (currentStep) {
      case 'PROFILE_SETUP':
        console.log('📝 Rendering PROFILE_SETUP step');
        
        if (isLoadingProfile) {
          return <LoadingScreen message="Loading your profile..." />;
        }
        
        const existingName = existingProfile?.name || '';
        const nameParts = existingName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        console.log('📋 Profile prefill data:', {
          firstName,
          lastName,
          email: existingProfile?.email || user?.email,
          phone: hasInvitation ? onboardingData.parent_phone : existingProfile?.phone_number
        });
        
        return (
          <ProfileSetup
            onComplete={(data) => {
              console.log('✅ ProfileSetup onComplete called with data:', data);
              completeStep(currentStep, data);
            }}
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
        console.log('🆔 Rendering IDENTITY_VERIFICATION step');
        return renderWithBackButton(
          <IdentityVerification 
            onComplete={(data) => {
              console.log('✅ IdentityVerification onComplete called with data:', data);
              completeStep(currentStep, data);
            }} 
          />,
          showBackButton
        );

      case 'LINK_LEARNERS':
        console.log('👨‍👩‍👧‍👦 Rendering LINK_LEARNERS step');
        
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
        
        console.log('👥 Existing learners count:', learners.length);
        return renderWithBackButton(
          <LinkLearners
            existingLearners={learners}
            onLearnerLinked={() => {
              console.log('🔄 Learner linked, refreshing learner list...');
              fetchLearners();
            }}
            onComplete={() => {
              console.log('✅ LinkLearners onComplete called');
              completeStep('LINK_LEARNERS', {});
            }}
            user={user}
          />,
          showBackButton
        );

      case 'SUBSCRIPTION_CHOICE':
        console.log('💳 Rendering SUBSCRIPTION_CHOICE step');
        return renderWithBackButton(
          <SubscriptionChoice
            onComplete={(data) => {
              console.log('✅ SubscriptionChoice onComplete called with data:', data);
              completeStep(currentStep, data);
            }}
            initialSelection={onboardingData.SUBSCRIPTION_CHOICE?.tier}
          />,
          showBackButton
        );

      case 'PAYMENT_SETUP':
        console.log('💰 Rendering PAYMENT_SETUP step');
        
        // Get billing amount from subscription choice
        const subscriptionData = onboardingData.SUBSCRIPTION_CHOICE || {};
        const billingCycle = subscriptionData.billingCycle || 'monthly';
        const baseAmount = 99; // Base premium price
        const billingAmount = billingCycle === 'monthly' 
          ? baseAmount 
          : Math.round((baseAmount * 12) * 0.85); // 15% discount for annual
        
        console.log('💰 Payment details:', {
          billingCycle,
          billingAmount,
          currency: 'ZAR'
        });
        
        return renderWithBackButton(
          <PaymentSetup
            onComplete={(data) => {
              console.log('✅ PaymentSetup onComplete called with data:', data);
              completeStep(currentStep, data);
            }}
            selectedTier="premium"
            billingAmount={billingCycle === 'monthly' ? billingAmount : Math.round(billingAmount / 12)}
            currency="ZAR"
          />,
          showBackButton
        );

      case 'PARENT_CONTACT_SUMMARY':
        console.log('📋 Rendering PARENT_CONTACT_SUMMARY step');
        
        const parentData = {
          name: profile?.name || user?.name || '',
          email: profile?.email || user?.email || '',
          phone: profile?.phone_number || onboardingData.parent_phone || '',
        };
        
        const schoolData = {
          name: onboardingData.school_name || 'the school',
          whatsappNumber: onboardingData.school_whatsapp_number || null,
        };
        
        console.log('👤 Parent data:', parentData);
        console.log('🏫 School data:', schoolData);
        console.log('👥 Learners:', learners.length);
        
        return renderWithBackButton(
          <ParentContactSummary
            parent={parentData}
            learners={learners}
            school={schoolData}
            onComplete={() => {
              console.log('✅ ParentContactSummary onComplete called');
              completeStep('PARENT_CONTACT_SUMMARY', {});
            }}
          />,
          showBackButton
        );

      case 'NOTIFICATION_PREFERENCES':
        console.log('🔔 Rendering NOTIFICATION_PREFERENCES step');
        return renderWithBackButton(
          <NotificationPreferences 
            onComplete={(data) => {
              console.log('✅ NotificationPreferences onComplete called with data:', data);
              completeStep(currentStep, data);
            }} 
          />,
          showBackButton
        );

      case 'TERMS_ACCEPTANCE':
        console.log('📜 Rendering TERMS_ACCEPTANCE step (FINAL STEP)');
        return renderWithBackButton(
          <TermsAcceptance 
            onComplete={(data) => {
              console.log('✅ TermsAcceptance onComplete called (FINAL!)');
              handleFinalStepComplete(data);
            }} 
          />,
          showBackButton
        );

      case 'INITIALIZING':
        console.log('⏳ Rendering INITIALIZING state');
        return <LoadingScreen message="Initializing onboarding..." />;

      case 'COMPLETE':
        console.log('🎉 Onboarding marked as COMPLETE - should not render this');
        return (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Onboarding Complete!</h2>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        );

      default:
        console.error('❌ Unknown step:', currentStep);
        return (
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-700">Unknown Step</h3>
            <p className="text-gray-600 mt-2">Step: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <OnboardingProgress 
          currentStep={currentStep} 
          progress={progress}
          completedSteps={completedSteps}
          steps={steps}
        />

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
                onClick={() => {
                  console.log('🔓 Unlocking invitation prefill');
                  setInvitationPrefillLocked(false);
                }}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
        )}

        {/* Debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-semibold text-yellow-800 mb-1">OnboardingFlow Debug:</div>
            <div className="text-yellow-700 space-y-1">
              <div>Current Step: <span className="font-mono font-semibold">{currentStep}</span></div>
              <div>Progress: <span className="font-mono">{progress.toFixed(1)}%</span></div>
              <div>Completed: <span className="font-mono">[{completedSteps.join(', ')}]</span></div>
              <div>Total Steps: <span className="font-mono">{steps?.length || 0}</span></div>
              <div>Is Complete: <span className="font-mono">{isOnboardingComplete ? '✅ Yes' : '❌ No'}</span></div>
              <div>goBack Available: <span className="font-mono">{typeof goBack === 'function' ? '✅ Yes' : '❌ No'}</span></div>
              <div>Has Invitation: <span className="font-mono">{hasInvitation ? '✅ Yes' : '❌ No'}</span></div>
            </div>
          </div>
        )}

        {/* Current step content */}
        <div className="mt-8">{renderStep()}</div>
      </div>
    </div>
  );
}