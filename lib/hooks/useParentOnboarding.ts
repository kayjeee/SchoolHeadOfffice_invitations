// lib/hooks/useParentOnboarding.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';

import { ParentAPI, ParentProfile, Learner, UpdateProfileData } from '../api/parent-api';
import { UserSyncService, RailsUser } from '../services/userSyncService';

// ========================
// TYPES & CONSTANTS
// ========================

type OnboardingStep =
  | 'INITIALIZING'
  | 'PROFILE_SETUP'
  | 'IDENTITY_VERIFICATION'
  | 'LINK_LEARNERS'
  | 'SUBSCRIPTION_CHOICE'
  | 'PAYMENT_SETUP'
  | 'PARENT_CONTACT_SUMMARY'
  | 'NOTIFICATION_PREFERENCES'
  | 'TERMS_ACCEPTANCE'
  | 'COMPLETE';

// Define the actual onboarding flow (excluding conditional steps)
const ONBOARDING_STEPS: OnboardingStep[] = [
  'PROFILE_SETUP',
  'IDENTITY_VERIFICATION',
  'LINK_LEARNERS',
  'SUBSCRIPTION_CHOICE',
  // PAYMENT_SETUP is conditionally added if premium is selected
  'PARENT_CONTACT_SUMMARY',
  'NOTIFICATION_PREFERENCES',
  'TERMS_ACCEPTANCE',
];

interface InvitationData {
  id: string;
  token?: string;
  school_slug?: string;
  school_name?: string;
  parent_phone?: string;
  learners?: { id: string; name: string; grade?: string }[];
}

interface UseParentOnboardingProps {
  initialProfile?: ParentProfile | null;
  initialLearners?: Learner[];
  invitationData?: InvitationData | null;
}

// ========================
// STATE MACHINE HOOK
// ========================

export function useParentOnboarding({ 
  initialProfile, 
  initialLearners = [], 
  invitationData 
}: UseParentOnboardingProps) {
  const { user, isLoading: isAuthLoading } = useUser();
  const queryClient = useQueryClient();

  // Core state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('INITIALIZING');
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const [invitationPrefill, setInvitationPrefillState] = useState<Partial<InvitationData> | null>(invitationData);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [railsUser, setRailsUser] = useState<RailsUser | null>(null);
  
  // Track if onboarding has been manually started
  const [onboardingStarted, setOnboardingStarted] = useState(false);

  // ========================
  // DEBUGGING UTILITIES
  // ========================

  const logStepTransition = useCallback((from: OnboardingStep, to: OnboardingStep, reason: string) => {
    console.log('🔄 STEP TRANSITION:', {
      from,
      to,
      reason,
      timestamp: new Date().toISOString(),
      completedSteps: Array.from(completedSteps),
      totalSteps: ONBOARDING_STEPS.length,
      progress: `${completedSteps.size}/${ONBOARDING_STEPS.length}`
    });
  }, [completedSteps]);

  const logStepState = useCallback((step: OnboardingStep, message: string, data?: any) => {
    console.log(`📍 [${step}] ${message}`, {
      currentStep,
      completedCount: completedSteps.size,
      data,
      timestamp: new Date().toISOString()
    });
  }, [currentStep, completedSteps]);

  // ========================
  // INVITATION PREFILL LOGIC
  // ========================

  const setInvitationPrefill = useCallback((inv: Partial<InvitationData>) => {
    console.log('💾 Setting invitation prefill:', inv);
    setInvitationPrefillState(inv);
  }, []);

  useEffect(() => {
    if (!invitationPrefill) {
      try {
        const raw = sessionStorage.getItem("sho_invitation");
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log('📥 Loaded invitation from sessionStorage:', parsed);
          setInvitationPrefill(parsed);
        }
      } catch (err) {
        console.warn("Could not read invitation from sessionStorage:", err);
      }
    }
  }, [invitationPrefill, setInvitationPrefill]);

  useEffect(() => {
    if (invitationPrefill) {
      console.log('🔗 Merging invitation data into onboarding state');
      setOnboardingData(prev => ({
        ...prev,
        parent_phone: invitationPrefill.parent_phone || prev.parent_phone,
        learners: invitationPrefill.learners || prev.learners,
        school_slug: invitationPrefill.school_slug || prev.school_slug,
        school_name: invitationPrefill.school_name || prev.school_name,
        invitation_id: invitationPrefill.id,
        invitation_token: invitationPrefill.token,
      }));
    }
  }, [invitationPrefill]);

  // ========================
  // USER SYNC LOGIC
  // ========================

  const handleSyncUser = useCallback(async () => {
    if (!user) {
      console.log('⏸️ User sync skipped: no user');
      return;
    }

    console.log('🔄 Starting user sync with Rails...', { userId: user.sub });
    setIsSyncing(true);
    setError(null);

    try {
      const syncedUser = await UserSyncService.syncUserWithRails(
        user,
        invitationPrefill?.token
      );
      console.log('✅ User synced successfully:', syncedUser);
      setRailsUser(syncedUser);
      
      queryClient.invalidateQueries({ queryKey: ['parentProfile', user.sub] });
      queryClient.invalidateQueries({ queryKey: ['parentLearners', user.sub] });
    } catch (err: any) {
      console.error('❌ User sync failed:', err);
      setError(err.message || 'Failed to synchronize your account with our records.');
    } finally {
      setIsSyncing(false);
    }
  }, [user, invitationPrefill?.token, queryClient]);

  useEffect(() => {
    if (user && !railsUser && !isSyncing) {
      handleSyncUser();
    }
  }, [user, railsUser, isSyncing, handleSyncUser]);

  // ========================
  // DATA FETCHING
  // ========================

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['parentProfile', user?.sub],
    queryFn: () => ParentAPI.getProfile(user!.sub!),
    enabled: !!user?.sub,
    initialData: initialProfile,
  });

  const { data: learners, isLoading: areLearnersLoading } = useQuery({
    queryKey: ['parentLearners', user?.sub],
    queryFn: async () => {
      const response = await ParentAPI.getMyLearners(user!.sub!);
      return response.learners;
    },
    enabled: !!user?.sub,
    initialData: initialLearners,
  });

  // ========================
  // DATA MUTATIONS
  // ========================

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => {
      console.log('📤 Updating profile via API:', data);
      return ParentAPI.updateProfile(user!.sub!, data);
    },
    onSuccess: (updatedProfile) => {
      console.log('✅ Profile updated successfully:', updatedProfile);
      queryClient.setQueryData(['parentProfile', user?.sub], updatedProfile);
    },
    onError: (error: any) => {
      console.error('❌ Profile update failed:', error);
      setError(error.message);
    }
  });

  const linkLearnerMutation = useMutation({
    mutationFn: (learnerNumber: string) => {
      console.log('📤 Linking learner via API:', learnerNumber);
      return ParentAPI.linkLearner(user!.sub!, learnerNumber);
    },
    onSuccess: () => {
      console.log('✅ Learner linked successfully');
      queryClient.invalidateQueries({ queryKey: ['parentLearners', user?.sub] });
    },
    onError: (error: any) => {
      console.error('❌ Learner linking failed:', error);
      setError(error.message);
    },
  });

  // ========================
  // STEP DETERMINATION LOGIC
  // ========================

  /**
   * Determines the initial step based on profile and learner data
   * This only runs once when the component initializes
   */
  const determineInitialStep = useCallback((): OnboardingStep => {
    console.log('🎯 Determining initial step...', {
      hasProfile: !!profile,
      profileName: profile?.name,
      learnerCount: learners?.length || 0,
      needsOnboarding: profile?.needsOnboarding,
      onboardingStarted
    });

    // If user explicitly needs onboarding or hasn't started yet
    if (!onboardingStarted) {
      // Check if profile exists and is complete
      const hasCompleteProfile = profile && profile.name && profile.phone_number;
      
      if (!hasCompleteProfile) {
        console.log('➡️ Starting at PROFILE_SETUP (incomplete profile)');
        return 'PROFILE_SETUP';
      }
      
      // Profile exists, check learners
      if (!learners || learners.length === 0) {
        console.log('➡️ Starting at LINK_LEARNERS (no learners)');
        return 'LINK_LEARNERS';
      }
      
      // Has profile and learners, but needs onboarding
      console.log('➡️ Starting at PARENT_CONTACT_SUMMARY (has basics)');
      return 'PARENT_CONTACT_SUMMARY';
    }

    // Default to current step if already started
    return currentStep;
  }, [profile, learners, onboardingStarted, currentStep]);

  // Initialize the onboarding flow
  useEffect(() => {
    if (!user || isProfileLoading || currentStep !== 'INITIALIZING') {
      return;
    }

    console.log('🚀 Initializing onboarding flow...');
    const initialStep = determineInitialStep();
    setCurrentStep(initialStep);
    setOnboardingStarted(true);
  }, [user, isProfileLoading, currentStep, determineInitialStep]);

  // ========================
  // STEP COMPLETION LOGIC
  // ========================

  const completeStep = useCallback(async (step: OnboardingStep, data: any) => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`✨ COMPLETING STEP: ${step}`);
    console.log('═══════════════════════════════════════');
    console.log('📦 Step data:', data);

    try {
      // Save the step data
      setOnboardingData(prev => {
        const updated = { ...prev, [step]: data };
        console.log('💾 Updated onboarding data:', updated);
        return updated;
      });

      // Mark step as completed
      setCompletedSteps(prev => {
        const updated = new Set(prev).add(step);
        console.log('✅ Completed steps:', Array.from(updated));
        console.log(`📊 Progress: ${updated.size}/${ONBOARDING_STEPS.length} steps`);
        return updated;
      });

      // Handle profile update if this is profile setup
      if (step === 'PROFILE_SETUP') {
        console.log('🔄 Triggering profile API update...');
        await updateProfileMutation.mutateAsync(data);
        console.log('✅ Profile API update complete');
      }

      // Special handling for SUBSCRIPTION_CHOICE
      if (step === 'SUBSCRIPTION_CHOICE') {
        if (data.tier === 'premium') {
          console.log('💳 Premium selected - next step is PAYMENT_SETUP');
          logStepTransition(step, 'PAYMENT_SETUP', 'Premium subscription requires payment');
          setCurrentStep('PAYMENT_SETUP');
          return;
        } else {
          console.log('🆓 Standard (free) selected - skipping PAYMENT_SETUP');
          logStepTransition(step, 'PARENT_CONTACT_SUMMARY', 'Standard subscription skips payment');
          setCurrentStep('PARENT_CONTACT_SUMMARY');
          return;
        }
      }

      // Special handling for PAYMENT_SETUP - always go to PARENT_CONTACT_SUMMARY
      if (step === 'PAYMENT_SETUP') {
        console.log('💰 Payment setup complete - moving to PARENT_CONTACT_SUMMARY');
        logStepTransition(step, 'PARENT_CONTACT_SUMMARY', 'Payment complete');
        setCurrentStep('PARENT_CONTACT_SUMMARY');
        return;
      }

      // Determine next step
      const currentIndex = ONBOARDING_STEPS.indexOf(step);
      console.log(`📍 Current step index: ${currentIndex}/${ONBOARDING_STEPS.length - 1}`);

      if (currentIndex >= ONBOARDING_STEPS.length - 1) {
        // This was the last step
        console.log('🎉 ALL STEPS COMPLETED! Marking onboarding as COMPLETE');
        logStepTransition(step, 'COMPLETE', 'Final step completed');
        setCurrentStep('COMPLETE');
      } else {
        // Move to next step
        const nextStep = ONBOARDING_STEPS[currentIndex + 1];
        console.log(`➡️ Moving to next step: ${nextStep}`);
        logStepTransition(step, nextStep, 'Step completed successfully');
        setCurrentStep(nextStep);
      }

      console.log('═══════════════════════════════════════');
      console.log('');
    } catch (error: any) {
      console.error('');
      console.error('═══════════════════════════════════════');
      console.error(`❌ ERROR completing step ${step}:`, error);
      console.error('═══════════════════════════════════════');
      console.error('');
      setError(error.message);
    }
  }, [updateProfileMutation, logStepTransition]);

  // ========================
  // NAVIGATION LOGIC
  // ========================

  const goBack = useCallback(() => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔙 GO BACK REQUESTED');
    console.log('═══════════════════════════════════════');
    
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    console.log(`📍 Current step: ${currentStep} (index ${currentIndex})`);
    
    if (currentIndex <= 0) {
      console.log('⛔ Already at first step, cannot go back');
      console.log('═══════════════════════════════════════');
      console.log('');
      return;
    }
    
    const previousStep = ONBOARDING_STEPS[currentIndex - 1];
    console.log(`⬅️ Going back to: ${previousStep}`);
    
    // Remove current step from completed steps
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentStep);
      console.log('📝 Updated completed steps:', Array.from(newSet));
      return newSet;
    });
    
    logStepTransition(currentStep, previousStep, 'User navigated back');
    setCurrentStep(previousStep);
    
    console.log('═══════════════════════════════════════');
    console.log('');
  }, [currentStep, logStepTransition]);

  // ========================
  // COMPUTED VALUES
  // ========================

  const progress = useMemo(() => {
    const completedCount = completedSteps.size;
    const totalSteps = ONBOARDING_STEPS.length;
    const progressPercent = Math.max(0, Math.min(100, (completedCount / totalSteps) * 100));
    
    console.log('📊 Progress calculation:', {
      completedCount,
      totalSteps,
      progressPercent: progressPercent.toFixed(1) + '%',
      completedSteps: Array.from(completedSteps)
    });
    
    return progressPercent;
  }, [completedSteps]);

  const isOnboardingComplete = useMemo(() => {
    const complete = currentStep === 'COMPLETE';
    console.log('🎯 Onboarding complete check:', {
      currentStep,
      isComplete: complete,
      completedStepsCount: completedSteps.size,
      totalSteps: ONBOARDING_STEPS.length
    });
    return complete;
  }, [currentStep, completedSteps]);

  // ========================
  // DEBUG: Log state changes
  // ========================

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Onboarding Hook State:', {
        currentStep,
        completedSteps: Array.from(completedSteps),
        progress: `${progress.toFixed(1)}%`,
        isOnboardingComplete,
        hasUser: !!user,
        hasProfile: !!profile,
        learnerCount: learners?.length || 0,
        onboardingStarted
      });
    }
  }, [currentStep, completedSteps, progress, isOnboardingComplete, user, profile, learners, onboardingStarted]);

  // ========================
  // RETURN API
  // ========================

  return {
    // User data
    user,
    railsUser,
    profile,
    learners,
    
    // Step management
    currentStep,
    steps: ONBOARDING_STEPS,
    completedSteps: Array.from(completedSteps),
    
    // State
    onboardingData,
    isOnboardingComplete,
    isLoading: isAuthLoading || isSyncing || isProfileLoading || areLearnersLoading,
    progress,
    error,
    
    // Actions
    completeStep,
    goBack,
    retrySync: handleSyncUser,
    setInvitationPrefill,
    linkLearner: linkLearnerMutation.mutateAsync,
    
    // Debug helpers (only in development)
    ...(process.env.NODE_ENV === 'development' && {
      _debug: {
        logStepState,
        logStepTransition,
        currentIndex: ONBOARDING_STEPS.indexOf(currentStep),
        totalSteps: ONBOARDING_STEPS.length
      }
    })
  };
}