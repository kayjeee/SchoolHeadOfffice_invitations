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

const ONBOARDING_STEPS: OnboardingStep[] = [
  'PROFILE_SETUP',
  'IDENTITY_VERIFICATION',
  'LINK_LEARNERS',
  'SUBSCRIPTION_CHOICE',
  'PAYMENT_SETUP',
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

export function useParentOnboarding({ initialProfile, initialLearners = [], invitationData }: UseParentOnboardingProps) {
  const { user, isLoading: isAuthLoading } = useUser();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('INITIALIZING');
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const [invitationPrefill, setInvitationPrefillState] = useState<Partial<InvitationData> | null>(invitationData);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [railsUser, setRailsUser] = useState<RailsUser | null>(null);

  // ========================
  // INVITATION PREFILL LOGIC
  // ========================

  const setInvitationPrefill = useCallback((inv: Partial<InvitationData>) => {
    setInvitationPrefillState(inv);
  }, []);

  useEffect(() => {
    // On init, check sessionStorage for invitation data and load it.
    if (!invitationPrefill) {
      try {
        const raw = sessionStorage.getItem("sho_invitation");
        if (raw) {
          const parsed = JSON.parse(raw);
          setInvitationPrefill(parsed);
        }
      } catch (err) {
        console.warn("Could not read invitation from sessionStorage:", err);
      }
    }
  }, [invitationPrefill, setInvitationPrefill]);

  useEffect(() => {
    // When prefill data is available, merge it into the main onboarding state
    if (invitationPrefill) {
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
    if (!user) return;

    setIsSyncing(true);
    setError(null);

    try {
      const syncedUser = await UserSyncService.syncUserWithRails(
        user,
        invitationPrefill?.token
      );
      setRailsUser(syncedUser);
      // After a successful sync, we can invalidate queries that depend on the Rails user ID
      queryClient.invalidateQueries({ queryKey: ['parentProfile', user.sub] });
      queryClient.invalidateQueries({ queryKey: ['parentLearners', user.sub] });
    } catch (err) {
      setError(err.message || 'Failed to synchronize your account with our records.');
    } finally {
      setIsSyncing(false);
    }
  }, [user, invitationPrefill?.token, queryClient]);

  useEffect(() => {
    if (user && !railsUser) {
      handleSyncUser();
    }
  }, [user, railsUser, handleSyncUser]);

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
    mutationFn: (data: UpdateProfileData) => ParentAPI.updateProfile(user!.sub!, data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['parentProfile', user?.sub], updatedProfile);
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const linkLearnerMutation = useMutation({
    mutationFn: (learnerNumber: string) => ParentAPI.linkLearner(user!.sub!, learnerNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentLearners', user?.sub] });
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // const removeLearnerMutation = useMutation({
  //   mutationFn: (learnerId: string) => ParentAPI.removeLearner(user!.sub!, learnerId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['parentLearners', user?.sub] });
  //   },
  //   onError: (error) => {
  //     setError(error.message);
  //   },
  // });

  // ========================
  // ONBOARDING LOGIC - WITH BACK FUNCTION
  // ========================

  useEffect(() => {
    if (!user || isProfileLoading) return;

    if (!profile) {
      setCurrentStep('PROFILE_SETUP');
    } else if (learners.length === 0) {
      setCurrentStep('LINK_LEARNERS');
    } else {
      // Add more checks for other steps here
      setCurrentStep('COMPLETE');
    }
  }, [user, profile, learners, isProfileLoading]);

  const completeStep = async (step: OnboardingStep, data: any) => {
    try {
      setOnboardingData(prev => ({ ...prev, [step]: data }));
      setCompletedSteps(prev => new Set(prev).add(step));

      if (step === 'PROFILE_SETUP') {
        await updateProfileMutation.mutateAsync(data);
      }

      let nextStep: OnboardingStep | undefined;
      if (step === 'SUBSCRIPTION_CHOICE' && data.tier === 'standard') {
        // Skip PAYMENT_SETUP if standard tier is chosen
        const currentIndex = ONBOARDING_STEPS.indexOf('PAYMENT_SETUP');
        nextStep = ONBOARDING_STEPS[currentIndex + 1];
      } else {
        const currentIndex = ONBOARDING_STEPS.indexOf(step);
        nextStep = ONBOARDING_STEPS[currentIndex + 1];
      }

      if (nextStep) {
        setCurrentStep(nextStep);
      } else {
        setCurrentStep('COMPLETE');
      }
    } catch (error) {
      console.error(`Error completing step ${step}:`, error);
      setError(error.message);
    }
  };

  // ADD THIS FUNCTION - The missing goBack function
  const goBack = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    
    // Don't go back from first step
    if (currentIndex <= 0) return;
    
    const previousStep = ONBOARDING_STEPS[currentIndex - 1];
    setCurrentStep(previousStep);
    
    // Optional: Remove the step from completed steps if going back
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentStep);
      return newSet;
    });
    
    console.log(`🔙 Going back from ${currentStep} to ${previousStep}`);
  }, [currentStep]);

  const progress = useMemo(() => {
    const completedCount = completedSteps.size;
    return Math.max(0, (completedCount / ONBOARDING_STEPS.length) * 100);
  }, [completedSteps]);

  // Get the step order for debugging/display
  const steps = useMemo(() => ONBOARDING_STEPS, []);

  return {
    user,
    railsUser,
    profile,
    learners,
    currentStep,
    steps, // Add this to expose step order
    completedSteps: Array.from(completedSteps),
    onboardingData,
    isOnboardingComplete: currentStep === 'COMPLETE',
    isLoading: isAuthLoading || isSyncing || isProfileLoading || areLearnersLoading,
    progress,
    completeStep,
    goBack, // Now this will be available!
    error,
    retrySync: handleSyncUser,
    setInvitationPrefill,
    linkLearner: linkLearnerMutation.mutateAsync,
    // removeLearner: removeLearnerMutation.mutateAsync,
  };
}