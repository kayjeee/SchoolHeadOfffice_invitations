// components/parent/Onboarding/OnboardingFlow.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useParentOnboarding } from '../../../lib/hooks/useParentOnboarding';
import { ParentAPI, Learner } from '../../../lib/api/parent-api';
import { InvitationAPI } from '../../../lib/api/invitation-api';
import OnboardingProgress from './OnboardingProgress';
import ProfileSetup from './steps/ProfileSetup';
import IdentityVerification from './steps/IdentityVerification';
import LinkLearners from './steps/LinkLearners';
import SubscriptionChoice from './steps/SubscriptionChoice';
import PaymentSetup from './steps/PaymentSetup';
import PaymentSuccess from './steps/PaymentSuccess';
import SocialShareGate from './steps/SocialShareGate';
import ParentContactSummary from './steps/ParentContactSummary';
import NotificationPreferences from './steps/NotificationPreferences';
import TermsAcceptance from './steps/TermsAcceptance';
import LoadingScreen from '../../common/LoadingScreen';
import { 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import BackButton from './BackButton';

interface OnboardingFlowProps {
  user: any;
  invitationData: any;
}

// Price configuration
const PRICE_CONFIG = {
  premium: {
    monthly: 90, // ✅ NEW PRICE: R90/month
    annualDiscount: 0.15, // 15% discount
  }
};

// Safe helper functions
const safeUserEmail = (user: any): string => {
  if (!user) return '';
  if (typeof user === 'object' && user.email) {
    return String(user.email) || '';
  }
  return '';
};

const safeUserId = (user: any): string => {
  if (!user) return '';
  if (typeof user === 'object' && user.sub) {
    return String(user.sub) || '';
  }
  return '';
};

const safeUserName = (user: any): string => {
  if (!user) return '';
  if (typeof user === 'object' && user.name) {
    return String(user.name) || '';
  }
  return '';
};

export default function OnboardingFlow({ user, invitationData }: OnboardingFlowProps) {
  const router = useRouter();

  // State management
  const [isInvitationPrefillLocked, setInvitationPrefillLocked] = useState(true);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState(true);
  const [fetchLearnersError, setFetchLearnersError] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [paymentSuccessShown, setPaymentSuccessShown] = useState(false);

  // Onboarding hook - with safe user data
  const safeUser = useMemo(() => {
    if (!user) return null;
    return {
      sub: safeUserId(user),
      email: safeUserEmail(user),
      name: safeUserName(user),
      ...user
    };
  }, [user]);

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
  } = useParentOnboarding({
    initialProfile: null,
    initialLearners: [],
    invitationData,
  });

  // Calculate the robust school name at the top level
  const resolvedSchoolName = useMemo(() => {
    const name = (learners && learners[0]?.school_name) ||
                 onboardingData?.school_name ||
                 onboardingData?.school?.name ||
                 invitationData?.school_name ||
                 invitationData?.school ||
                 'School';
    console.log('🏛️ [OnboardingFlow] resolvedSchoolName:', name);
    return name;
  }, [learners, onboardingData, invitationData]);

  console.log('🎬 [OnboardingFlow] Rendered with invitationData:', JSON.stringify(invitationData, null, 2));

  // Logging initialization with EXTREME null safety
  useEffect(() => {
    console.log('');
    console.log('🎬 ═══════════════════════════════════════');
    console.log('🎬 OnboardingFlow Component Mounted');
    console.log('🎬 ═══════════════════════════════════════');

    // SAFE logging - no string concatenation that could cause toString() errors
    const userEmail = safeUserEmail(user);
    const userId = safeUserId(user);

    console.log('👤 User exists:', !!user);
    console.log('👤 User email:', userEmail || '(no email)');
    console.log('👤 User ID:', userId || '(no ID)');
    console.log('📨 Has invitation:', !!invitationData);

    // Safe query params logging
    try {
      console.log('🔍 Query params:', router.query || {});
    } catch (error) {
      console.log('🔍 Query params: [Error reading query params]');
    }
  }, []);


  const hasInvitation = !!onboardingData?.invitation_id;
  const subscriptionChoice = onboardingData?.SUBSCRIPTION_CHOICE || {};
  const selectedTier = subscriptionChoice?.tier || 'standard';
  const billingCycle = subscriptionChoice?.billingCycle || 'monthly';
  const paymentData = onboardingData?.PAYMENT_SETUP;

  // Calculate premium price based on billing cycle
  const getPremiumPrice = useCallback(() => {
    const { monthly, annualDiscount } = PRICE_CONFIG.premium;
    
    if (billingCycle === 'annual') {
      const annualPrice = monthly * 12;
      const discount = annualPrice * annualDiscount;
      return {
        monthly: Math.round((annualPrice - discount) / 12),
        annual: Math.round(annualPrice - discount),
        savings: Math.round(discount),
      };
    }
    
    return {
      monthly: monthly,
      annual: monthly * 12,
      savings: 0,
    };
  }, [billingCycle]);

  const premiumPrice = getPremiumPrice();

  // Check if returning from PayFast - safely
  const returningFromPayment = useMemo(() => {
    try {
      const transactionId = router.query?.transaction_id;
      const cancelled = router.query?.cancelled === 'true';
      const pendingTransaction = localStorage.getItem('pending_transaction_id');
      
      return !!(transactionId || cancelled || pendingTransaction);
    } catch (error) {
      console.error('Error checking payment return:', error);
      return false;
    }
  }, [router.query]);

  // Determine if we should show PaymentSuccess
  const shouldShowPaymentSuccess = useCallback(() => {
    const isPremium = selectedTier === 'premium';
    
    return (
      isPremium && 
      returningFromPayment && 
      paymentData?.status === 'completed' &&
      !paymentSuccessShown
    );
  }, [selectedTier, returningFromPayment, paymentData, paymentSuccessShown]);

  // Handle payment completion return from PayFast
  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const transactionId = router.query?.transaction_id as string || 
                             localStorage.getItem('pending_transaction_id');
        
        if (!transactionId) return;

        console.log('💰 Checking payment status for transaction:', transactionId);

        // Fetch transaction status
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const cleanBase = apiBase.endsWith('/api/v1') ? apiBase : `${apiBase}/api/v1`;
        const response = await fetch(`${cleanBase}/transactions/${transactionId}`);
        const result = await response.json();

        if (result.success && result.data) {
          console.log('📦 Transaction status:', result.data.status);

          if (result.data.status === 'completed') {
            console.log('✅ Payment completed! Completing PAYMENT_SETUP step');
            
            // Complete the payment step
            completeStep('PAYMENT_SETUP', {
              transaction_id: transactionId,
              status: 'completed',
              subscription_tier: result.data.subscription_tier,
              subscription_billing_cycle: result.data.subscription_billing_cycle,
              amount: result.data.amount,
            });

            // Clear from localStorage
            localStorage.removeItem('pending_transaction_id');
            setPaymentSuccessShown(true);
            
            // Clear query params
            router.replace('/parent/onboarding', undefined, { shallow: true });
          } else if (result.data.status === 'failed' || result.data.status === 'cancelled') {
            console.log('❌ Payment failed or cancelled');
            setOnboardingError('Payment was not completed. Please try again or choose the free plan.');
          }
        }
      } catch (error) {
        console.error('❌ Error checking payment status:', error);
        setOnboardingError('Unable to verify payment status. Please contact support.');
      }
    };

    if (returningFromPayment && currentStep === 'PAYMENT_SETUP') {
      handlePaymentReturn();
    }
  }, [router.query, currentStep, completeStep, returningFromPayment, router]);

  // Fetch existing user profile
// In OnboardingFlow.tsx, update the fetchUserProfile function
// Update the fetchUserProfile function in OnboardingFlow.tsx
const fetchUserProfile = async () => {
  const userId = safeUserId(safeUser);
  if (!userId) {
    console.log('⏭️ [OnboardingFlow] Skipping profile fetch: no user ID');
    setIsLoadingProfile(false);
    return;
  }
  
  console.log('📥 [OnboardingFlow] fetchUserProfile TRIGGERED', { userId });
  
  setIsLoadingProfile(true);
  try {
    // ✅ FIXED: Use the correct endpoint /users/show with query parameter
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const cleanBase = apiBase.endsWith('/api/v1') ? apiBase : `${apiBase}/api/v1`;
    const response = await fetch(
      `${cleanBase}/users/show?auth0_id=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('📥 Profile fetch response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📥 [OnboardingFlow] Profile fetch result:', result);
      
      if (result.success && result.data) {
        console.log('✅ [OnboardingFlow] User profile fetched successfully');
        
        // Handle the backend response format
        const userProfile = result.data.user || result.data;
        
        if (userProfile) {
          // Fix the name issue: check for first_name/last_name vs name
          let fullName = '';
          if (userProfile.name) {
            fullName = userProfile.name;
          } else if (userProfile.first_name || userProfile.last_name) {
            fullName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
          }
          
          const profileData = {
            ...userProfile,
            name: fullName,
            // Map phone_number to phone for the form
            phone: userProfile.phone_number || '',
            email: userProfile.email || safeUserEmail(safeUser) || '',
          };
          
          console.log('📋 Processed profile data:', profileData);
          setExistingProfile(profileData);
        }
      } else {
        console.log('ℹ️ No existing profile found or API returned unsuccessful');
      }
    } else {
      console.log(`ℹ️ Profile fetch failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    // Don't show error, just log it
  } finally {
    setIsLoadingProfile(false);
  }
};

  // Fetch learners linked to this parent
  const fetchLearners = async () => {
    const userId = safeUserId(safeUser);
    if (!userId) {
      console.log('⏭️ [OnboardingFlow] Skipping learners fetch: no user ID');
      setIsLoadingLearners(false);
      return;
    }
    
    console.log('📥 [OnboardingFlow] fetchLearners TRIGGERED', { userId });
    
    setIsLoadingLearners(true);
    setFetchLearnersError(null);
    try {
      const response = await ParentAPI.getMyLearners(userId);
      console.log('✅ [OnboardingFlow] fetchLearners SUCCESS:', response.learners?.length || 0, 'learners found');
      setLearners(response.learners || []);
    } catch (error) {
      console.error("❌ Error fetching learners:", error);
      setFetchLearnersError("We couldn't load your linked learners.");
    } finally {
      setIsLoadingLearners(false);
    }
  };

  // Load initial data
  useEffect(() => {
    console.log('🔄 [OnboardingFlow] Initial data load useEffect triggered', { hasSafeUser: !!safeUser });
    if (safeUser) {
      fetchUserProfile();
      fetchLearners();
    } else {
      setIsLoadingProfile(false);
      setIsLoadingLearners(false);
      setOnboardingError('User authentication required. Please log in.');
    }
  }, [safeUser]);

  // Automatically redirect to dashboard when onboarding is complete
  useEffect(() => {
    if (currentStep === 'COMPLETE') {
      const timer = setTimeout(() => {
        console.log('🚀 Onboarding complete, automatically redirecting to dashboard...', resolvedSchoolName);

        // Force a full page reload to ensure ParentPage re-initializes its hook
        // and fetches the updated profile from the server
        window.location.href = `/parent/${encodeURIComponent(resolvedSchoolName)}`;
      }, 3000); // Give them 3 seconds to see the success message

      return () => clearTimeout(timer);
    }
  }, [currentStep, resolvedSchoolName]);

  // Handle final step completion
  const handleFinalStepComplete = async (data: any) => {
    console.log('🎊 Final step completion');
    
    const userId = safeUserId(safeUser);
    if (hasInvitation && userId) {
      try {
        // Use the new InvitationAPI to accept/claim the invitation
        await InvitationAPI.acceptInvitation(onboardingData.token || onboardingData.invitation_token, userId);
        sessionStorage.removeItem('sho_invitation');
        console.log('✅ Invitation claimed successfully');
      } catch (error) {
        console.error("❌ Failed to claim invitation:", error);
      }
    }
    
    completeStep('TERMS_ACCEPTANCE', data);
  };

  // Enhanced back button handler
  const handleGoBack = () => {
    console.log('🔙 Go back clicked from step:', currentStep);
    if (goBack && typeof goBack === 'function') {
      goBack();
    }
  };

  // Render content with optional back button
  const renderWithBackButton = useCallback((content: React.ReactNode, showBack: boolean) => {
    if (!showBack) return content;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-start">
          <BackButton onBack={handleGoBack} disabled={false} />
        </div>
        {content}
      </div>
    );
  }, [handleGoBack]);

  // Show loading if user is null
  if (!safeUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading User Information
          </h2>
          <p className="text-gray-600">
            Please wait while we load your account details...
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Render the current step
  const renderStep = useCallback(() => {
    const isLocked = hasInvitation && isInvitationPrefillLocked;
    const showBackButton = currentStep !== 'PROFILE_SETUP' && currentStep !== 'INITIALIZING';

    switch (currentStep) {
      // In OnboardingFlow.tsx, update the ProfileSetup section
case 'PROFILE_SETUP':
  if (isLoadingProfile) {
    return <LoadingScreen message="Loading your profile..." />;
  }
  
  // Use existingProfile if available, otherwise fall back to user data
  const existingName = existingProfile?.name || safeUserName(safeUser) || '';
  const existingPhone = existingProfile?.phone || existingProfile?.phone_number || '';
  const existingEmail = existingProfile?.email || safeUserEmail(safeUser) || '';
  
  // Check for invitation data
  const invitationPhone = hasInvitation ? (onboardingData?.parent_phone || '') : '';
  const invitationSchoolName = onboardingData?.school_name || onboardingData?.school?.name || '';
  const invitationGradeName = onboardingData?.grade_name || onboardingData?.learners?.[0]?.grade || '';

  console.log('🎬 [OnboardingFlow] Passing to ProfileSetup:', {
    invitationSchoolName,
    invitationGradeName,
    hasInvitation,
    onboardingDataKeys: Object.keys(onboardingData || {})
  });
  
  return (
    <ProfileSetup
      onComplete={(data) => completeStep(currentStep, data)}
      prefillData={{
        name: existingName,
        email: existingEmail,
        phone: invitationPhone || existingPhone,
        school_name: invitationSchoolName,
        grade_name: invitationGradeName,
      }}
      isLocked={isLocked}
      user={safeUser}
    />
  );

      case 'IDENTITY_VERIFICATION':
        return renderWithBackButton(
          <IdentityVerification 
            onComplete={(data) => completeStep(currentStep, data)} 
          />,
          showBackButton
        );

      case 'LINK_LEARNERS':
        if (isLoadingLearners) {
          return <LoadingScreen message="Fetching your learners..." />;
        }
        
        return renderWithBackButton(
          <LinkLearners
            existingLearners={learners}
            onLearnerLinked={() => fetchLearners()}
            onComplete={() => completeStep('LINK_LEARNERS', {})}
            user={safeUser}
          />,
          showBackButton
        );

      case 'SUBSCRIPTION_CHOICE':
        return renderWithBackButton(
          <SubscriptionChoice
            onComplete={(data) => completeStep(currentStep, data)}
            initialSelection={subscriptionChoice?.tier}
          />,
          showBackButton
        );

      case 'PAYMENT_SETUP':
        console.log('');
        console.log('💳 ═══════════════════════════════════════════');
        console.log('💳 RENDERING PAYMENT_SETUP STEP');
        console.log('💳 ═══════════════════════════════════════════');
        console.log('📊 State Check:');
        console.log('  ✓ Current Step:', currentStep);
        console.log('  ✓ Selected Tier:', selectedTier);
        console.log('  ✓ Has Subscription Choice:', !!subscriptionChoice);
        console.log('  ✓ Subscription Choice Data:', subscriptionChoice);
        console.log('  ✓ Billing Cycle:', billingCycle);
        console.log('  ✓ Payment Data:', paymentData);
        console.log('  ✓ Returning from Payment:', returningFromPayment);
        console.log('  ✓ Should Show Success:', shouldShowPaymentSuccess());
        console.log('💳 ═══════════════════════════════════════════');
        console.log('');

        // 1. Check if returning from successful PayFast payment
        if (shouldShowPaymentSuccess()) {
          console.log('✅ Case 1: Showing PaymentSuccess component');
          return (
            <PaymentSuccess
              transactionId={paymentData?.transaction_id}
              onContinue={() => {
                completeStep('PAYMENT_SETUP', paymentData);
              }}
            />
          );
        }

        // 2. Safety check - ensure subscription choice exists
        if (!subscriptionChoice?.tier) {
          console.log('⚠️ Case 2: No subscription tier selected - showing error');
          return (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-3">
                Subscription Selection Required
              </h3>
              <p className="text-yellow-700 mb-6 text-lg">
                Please select a subscription plan before proceeding to payment.
              </p>
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 font-mono">
                  Debug Info:<br/>
                  subscriptionChoice: {JSON.stringify(subscriptionChoice)}<br/>
                  selectedTier: {selectedTier || 'undefined'}
                </p>
              </div>
              <button
                onClick={() => {
                  console.log('🔙 User clicking back from error state');
                  goBack();
                }}
                className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold text-lg"
              >
                ← Go Back to Plan Selection
              </button>
            </div>
          );
        }

        // 3. STANDARD TIER - Show Social Share Gate
        if (selectedTier === 'standard') {
          console.log('🆓 Case 3: Rendering STANDARD tier → SocialShareGate');
          console.log('   Component: SocialShareGate');
          console.log('   Shows: Optional social sharing');
          console.log('   Back button:', showBackButton);
          
          return renderWithBackButton(
            <div>
              {/* Debug Banner */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <strong>Debug:</strong> Rendering SocialShareGate for STANDARD tier
                </div>
              )}
              
              <SocialShareGate
                onComplete={(shareData) => {
                  console.log('');
                  console.log('📱 ═══════════════════════════════════');
                  console.log('📱 SOCIAL SHARING COMPLETED');
                  console.log('📱 ═══════════════════════════════════');
                  console.log('📦 Share Data:', shareData);
                  console.log('📱 ═══════════════════════════════════');
                  console.log('');
                  
                  // Complete payment step with social share data
                  completeStep('PAYMENT_SETUP', {
                    tier: 'standard',
                    paymentMethod: 'free',
                    socialShares: shareData,
                    status: 'completed',
                  });
                }}
                tier="standard"
              />
            </div>,
            showBackButton
          );
        }

        // 4. PREMIUM TIER - Show PayFast Payment
        if (selectedTier === 'premium') {
          console.log('💰 Case 4: Rendering PREMIUM tier → PaymentSetup (PayFast)');
          console.log('   Component: PaymentSetup');
          console.log('   Shows: PayFast payment form');
          console.log('   Billing Cycle:', billingCycle);
          console.log('   Amount:', billingCycle === 'monthly' ? premiumPrice.monthly : premiumPrice.annual);
          console.log('   Back button:', showBackButton);
          
          return renderWithBackButton(
            <div>
              {/* Debug Banner */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <strong>Debug:</strong> Rendering PaymentSetup for PREMIUM tier
                  <br/>
                  Billing: {billingCycle} - R{billingCycle === 'monthly' ? premiumPrice.monthly : premiumPrice.annual}
                </div>
              )}
              
              <PaymentSetup
                onComplete={(data) => {
                  console.log('');
                  console.log('💰 ═══════════════════════════════════');
                  console.log('💰 PAYMENT SETUP CALLBACK');
                  console.log('💰 ═══════════════════════════════════');
                  console.log('📦 Data:', data);
                  
                  if (data.error) {
                    console.error('❌ Payment error:', data.error);
                    setOnboardingError(data.error);
                  } else {
                    console.log('✅ Payment initiated successfully');
                  }
                  
                  console.log('💰 ═══════════════════════════════════');
                  console.log('');
                }}
                selectedTier="premium"
                billingCycle={billingCycle}
                billingAmount={billingCycle === 'monthly' ? premiumPrice.monthly : premiumPrice.annual}
                currency="ZAR"
                user={safeUser}
              />
            </div>,
            showBackButton
          );
        }

        // 5. FALLBACK - Unknown tier
        console.log('❌ Case 5: UNKNOWN TIER - Showing error');
        console.log('   Selected Tier:', selectedTier);
        console.log('   Expected: "standard" or "premium"');
        
        return (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-900 mb-3">
              Invalid Subscription Tier
            </h3>
            <p className="text-red-700 mb-6 text-lg">
              The selected subscription tier is not recognized.
            </p>
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 font-mono">
                Debug Info:<br/>
                selectedTier: "{selectedTier}"<br/>
                subscriptionChoice: {JSON.stringify(subscriptionChoice)}<br/>
                Expected: "standard" or "premium"
              </p>
            </div>
            <button
              onClick={() => {
                console.log('🔙 User clicking back from error state');
                goBack();
              }}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-lg"
            >
              ← Go Back and Try Again
            </button>
          </div>
        );

      case 'PARENT_CONTACT_SUMMARY':
        const parentData = {
          name: profile?.name || safeUserName(safeUser) || '',
          email: profile?.email || safeUserEmail(safeUser) || '',
          phone: profile?.phone_number || onboardingData?.parent_phone || '',
        };
        
        return renderWithBackButton(
          <ParentContactSummary
            parent={parentData}
            learners={learners}
            school={{ name: onboardingData?.school_name || 'the school' }}
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
          <TermsAcceptance 
            onComplete={(data) => handleFinalStepComplete(data)} 
          />,
          showBackButton
        );

      case 'INITIALIZING':
        return <LoadingScreen message="Initializing onboarding..." />;

      case 'COMPLETE':
        return (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Onboarding Complete! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              Your account is now fully set up. Redirecting to dashboard...
            </p>
            <button
              onClick={() => {
                console.log('🚀 Manual redirect clicked, target:', resolvedSchoolName);
                window.location.href = `/parent/${encodeURIComponent(resolvedSchoolName)}`;
              }}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mb-6"
            >
              Go to Dashboard Now
            </button>

            {/* DEMO / NESTED ROUTE LINK */}
            <div style={styles.demoSection}>
              <p style={styles.demoLabel}>Test Nested Route:</p>
              <a
                href="/parent/far%20north%20secondary%20school"
                style={styles.demoLink}
              >
                Far North Secondary School
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h3 className="text-xl font-bold text-red-700">Unknown Step</h3>
            <p className="text-gray-600 mt-2">Step: {currentStep || 'Unknown'}</p>
            <button
              onClick={() => window.location.href = '/parent'}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  }, [
    currentStep,
    hasInvitation,
    isInvitationPrefillLocked,
    isLoadingProfile,
    existingProfile,
    safeUser,
    onboardingData,
    completeStep,
    renderWithBackButton,
    isLoadingLearners,
    learners,
    fetchLearners,
    subscriptionChoice,
    shouldShowPaymentSuccess,
    paymentData,
    selectedTier,
    billingCycle,
    premiumPrice,
    setOnboardingError,
    goBack,
    profile,
    handleFinalStepComplete,
    router
  ]);

  // Show cancellation notice
  const showCancellationNotice = router.query?.cancelled === 'true';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <OnboardingProgress 
          currentStep={currentStep} 
          progress={progress || 0}
          completedSteps={completedSteps || []}
          steps={steps || []}
        />

        {/* Onboarding Error */}
        {onboardingError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <p className="text-sm text-red-700">{onboardingError}</p>
            </div>
          </div>
        )}

        {/* Invitation Notice */}
        {hasInvitation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <InformationCircleIcon className="h-6 w-6 text-blue-500 mr-3" />
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Invitation detected</span> — we've pre-filled some fields.
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

        {/* Payment Cancellation Notice */}
        {showCancellationNotice && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">
                  Payment Cancelled
                </p>
                <p className="text-sm text-yellow-700">
                  You can try again or continue without payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Learners Fetch Error */}
        {fetchLearnersError && currentStep === 'LINK_LEARNERS' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{fetchLearnersError}</p>
            <button
              onClick={fetchLearners}
              className="mt-2 text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Current Step Content */}
        <div className="mt-8">
          {renderStep()}
        </div>

        {/* Debug Panel (Development Only) - Safe version */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-800 text-white rounded-lg text-xs font-mono">
            <div className="font-bold mb-2">📊 Onboarding Debug Info</div>
            <div className="space-y-1">
              <div><span className="text-gray-400">User exists:</span> {!!safeUser ? 'Yes' : 'No'}</div>
              <div><span className="text-gray-400">User ID:</span> {safeUserId(safeUser) || '(no ID)'}</div>
              <div><span className="text-gray-400">User Email:</span> {safeUserEmail(safeUser) || '(no email)'}</div>
              <div><span className="text-gray-400">Current Step:</span> {currentStep || '(no step)'}</div>
              <div><span className="text-gray-400">Selected Tier:</span> {selectedTier || '(no tier)'}</div>
              <div><span className="text-gray-400">Billing Cycle:</span> {billingCycle || '(no cycle)'}</div>
              <div><span className="text-gray-400">Completed Steps:</span> {(completedSteps || []).length}</div>
              <div><span className="text-gray-400">Progress:</span> {Math.round(progress || 0)}%</div>
              <div><span className="text-gray-400">Learners:</span> {learners.length}</div>
              <div><span className="text-gray-400">Returning from Payment:</span> {returningFromPayment ? 'Yes' : 'No'}</div>
              <div><span className="text-gray-400">Payment Success Shown:</span> {paymentSuccessShown.toString()}</div>
              <div className="pt-2 border-t border-gray-700">
                <button
                  onClick={() => {
                    console.log('🧪 Safe User:', safeUser);
                    console.log('🧪 Onboarding Data:', onboardingData);
                    console.log('🧪 Profile:', profile);
                    console.log('🧪 Subscription Choice:', subscriptionChoice);
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  Log Safe State
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline styles for specialized components
const styles: Record<string, React.CSSProperties> = {
  demoSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
    textAlign: 'center'
  },
  demoLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px'
  },
  demoLink: {
    fontSize: '13px',
    color: '#2563eb',
    textDecoration: 'underline'
  }
};