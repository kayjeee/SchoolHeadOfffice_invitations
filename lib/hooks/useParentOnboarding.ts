// lib/hooks/useParentOnboarding.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';

import {
  ParentAPI,
  ParentProfile,
  Learner,
  ParentProfileUpdate,
} from '../api/parent-api';
import { UserSyncService, RailsUser } from '../services/userSyncService';

/* =======================
   TYPES & CONSTANTS
======================= */

export type OnboardingStep =
  | 'INITIALIZING'
  | 'PROFILE_SETUP'
  | 'IDENTITY_VERIFICATION'
  | 'LINK_LEARNERS'
  | 'PARENT_CONTACT_SUMMARY'
  | 'NOTIFICATION_PREFERENCES'
  | 'TERMS_ACCEPTANCE'
  | 'COMPLETE';

const STEPS: OnboardingStep[] = [
  'PROFILE_SETUP',
  'IDENTITY_VERIFICATION',
  'LINK_LEARNERS',
  'PARENT_CONTACT_SUMMARY',
  'NOTIFICATION_PREFERENCES',
  'TERMS_ACCEPTANCE',
];

interface InvitationData {
  id: string;
  token?: string;
  school_name?: string;
  parent_phone?: string;
  learners?: any[];
}

interface Props {
  initialProfile?: ParentProfile | null;
  initialLearners?: Learner[];
  invitationData?: InvitationData | null;
}

/* =======================
   HOOK
======================= */

export function useParentOnboarding({
  initialProfile = null,
  initialLearners = [],
  invitationData,
}: Props) {
  const { user, isLoading: isAuthLoading } = useUser();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] =
    useState<OnboardingStep>('INITIALIZING');
  const [onboardingData, setOnboardingData] =
    useState<Record<string, any>>({});
  const [railsUser, setRailsUser] =
    useState<RailsUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /* =======================
     INVITATION PREFILL
  ======================= */

  useEffect(() => {
    if (invitationData) {
      setOnboardingData((prev) => ({
        ...prev,
        invitation_id: invitationData.id,
        invitation_token: invitationData.token,
        parent_phone: invitationData.parent_phone,
        school_name: invitationData.school_name,
        learners: invitationData.learners,
      }));
    }
  }, [invitationData]);

  /* =======================
     USER SYNC
  ======================= */

  const syncUser = useCallback(async () => {
    if (!user) return;

    setIsSyncing(true);
    try {
      const synced = await UserSyncService.syncUserWithRails(
        user,
        invitationData?.token
      );
      setRailsUser(synced);
    } catch (err: any) {
      setError(err.message || 'User sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [user, invitationData?.token]);

  useEffect(() => {
    if (user && !railsUser) {
      syncUser();
    }
  }, [user, railsUser, syncUser]);

  /* =======================
     DATA FETCHING
  ======================= */

  const { data: profile, isLoading: profileLoading } =
    useQuery({
      queryKey: ['parentProfile', user?.sub],
      queryFn: () => ParentAPI.getProfile(user!.sub!),
      enabled: !!user?.sub,
      initialData: initialProfile,
    });

  const { data: learners = [], isLoading: learnersLoading } =
    useQuery({
      queryKey: ['parentLearners', user?.sub],
      queryFn: () => ParentAPI.getLearners(user!.sub!),
      enabled: !!user?.sub,
      initialData: initialLearners,
    });

  /* =======================
     MUTATIONS
  ======================= */

  const updateProfile = useMutation({
    mutationFn: (data: ParentProfileUpdate) =>
      ParentAPI.updateProfile(user!.sub!, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['parentProfile', user?.sub],
      }),
  });

  /* =======================
     STEP LOGIC - FIXED VERSION
  ======================= */

  useEffect(() => {
    if (!user || profileLoading) return;

    // ========== FIXED LOGIC ==========
    // ALWAYS start with PROFILE_SETUP if user doesn't have a profile
    if (!profile) {
      setCurrentStep('PROFILE_SETUP');
      return;
    }

    // If profile exists but is incomplete (missing required fields), also show PROFILE_SETUP
    // Adjust the condition based on what fields are required
    const isProfileIncomplete = !profile.phone_number || !profile.name;
    if (isProfileIncomplete) {
      setCurrentStep('PROFILE_SETUP');
      return;
    }

    // After profile is complete, check for learners
    if (learners.length === 0) {
      setCurrentStep('LINK_LEARNERS');
      return;
    }

    // All basic steps are complete, determine next step based on onboarding progress
    // Find the first step that hasn't been marked as completed in onboardingData
    const firstIncompleteStep = STEPS.find(step => !onboardingData[step]);
    if (firstIncompleteStep) {
      setCurrentStep(firstIncompleteStep);
    } else {
      // All steps have data, mark as complete
      setCurrentStep('COMPLETE');
    }
    // ========== END FIX ==========
  }, [user, profile, learners, profileLoading, onboardingData]);

  /* =======================
     STEP COMPLETION
  ======================= */

  const completeStep = async (
    step: OnboardingStep,
    data: any
  ) => {
    // Save step data
    setOnboardingData((prev) => ({ ...prev, [step]: data }));

    // Handle profile setup completion
    if (step === 'PROFILE_SETUP') {
      try {
        await updateProfile.mutateAsync(data);
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    }

    // Determine next step
    const index = STEPS.indexOf(step);
    const nextStep = STEPS[index + 1];
    
    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      // Last step completed
      setCurrentStep('COMPLETE');
    }
  };

  /* =======================
     NAVIGATION
  ======================= */

  const goBack = () => {
    const index = STEPS.indexOf(currentStep);
    if (index > 0) {
      setCurrentStep(STEPS[index - 1]);
    }
  };

  const moveToStep = (step: OnboardingStep) => {
    if (STEPS.includes(step) || step === 'COMPLETE') {
      setCurrentStep(step);
    }
  };

  /* =======================
     UTILITIES
  ======================= */

  const progress = useMemo(() => {
    const index = STEPS.indexOf(currentStep);
    return Math.max(0, (index / STEPS.length) * 100);
  }, [currentStep]);

  const isOnboardingComplete = currentStep === 'COMPLETE';

  const retrySync = useCallback(() => {
    if (user) {
      syncUser();
    }
  }, [user, syncUser]);

  /* =======================
     RETURN VALUES
  ======================= */

  return {
    // User data
    user,
    railsUser,
    profile,
    learners,
    
    // Onboarding state
    currentStep,
    onboardingData,
    isOnboardingComplete,
    progress,
    
    // Loading states
    isLoading:
      isAuthLoading ||
      isSyncing ||
      profileLoading ||
      learnersLoading,
    
    // Errors
    error,
    
    // Actions
    completeStep,
    goBack,
    moveToStep,
    retrySync,
    
    // Additional helpers
    hasInvitation: !!onboardingData.invitation_id,
    invitationToken: onboardingData.invitation_token,
  };
}