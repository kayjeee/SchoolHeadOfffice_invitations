// lib/hooks/useParentOnboarding.ts
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';

import { ParentAPI, ParentProfile, Learner, ParentProfileUpdate } from '../api/parent-api';

// ========================
// TYPES & CONSTANTS
// ========================

type OnboardingStep =
  | 'INITIALIZING'
  | 'PROFILE_SETUP'
  | 'IDENTITY_VERIFICATION'
  | 'LINK_LEARNERS'
  | 'NOTIFICATION_PREFERENCES'
  | 'TERMS_ACCEPTANCE'
  | 'COMPLETE';

const ONBOARDING_STEPS: OnboardingStep[] = [
  'PROFILE_SETUP',
  'IDENTITY_VERIFICATION',
  'LINK_LEARNERS',
  'NOTIFICATION_PREFERENCES',
  'TERMS_ACCEPTANCE',
];

interface UseParentOnboardingProps {
  initialProfile?: ParentProfile | null;
  initialLearners?: Learner[];
}

// ========================
// STATE MACHINE HOOK
// ========================

export function useParentOnboarding({ initialProfile, initialLearners = [] }: UseParentOnboardingProps) {
  const { user, isLoading: isAuthLoading } = useUser();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('INITIALIZING');
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});

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
    queryFn: () => ParentAPI.getLearners(user!.sub!),
    enabled: !!user?.sub,
    initialData: initialLearners,
  });

  // ========================
  // DATA MUTATIONS
  // ========================

  const updateProfileMutation = useMutation({
    mutationFn: (data: ParentProfileUpdate) => ParentAPI.updateProfile(user!.sub!, data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['parentProfile', user?.sub], updatedProfile);
    },
  });

  // ========================
  // ONBOARDING LOGIC
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

      if (step === 'PROFILE_SETUP') {
        await updateProfileMutation.mutateAsync(data);
      }

      const currentIndex = ONBOARDING_STEPS.indexOf(step);
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];

      if (nextStep) {
        setCurrentStep(nextStep);
      } else {
        setCurrentStep('COMPLETE');
      }
    } catch (error) {
      console.error(`Error completing step ${step}:`, error);
      // Handle error state in UI
    }
  };

  const progress = useMemo(() => {
    const completedSteps = ONBOARDING_STEPS.indexOf(currentStep);
    return Math.max(0, (completedSteps / ONBOARDING_STEPS.length) * 100);
  }, [currentStep]);

  return {
    user,
    profile,
    learners,
    currentStep,
    onboardingData,
    isOnboardingComplete: currentStep === 'COMPLETE',
    isLoading: isAuthLoading || isProfileLoading || areLearnersLoading,
    progress,
    completeStep,
  };
}
