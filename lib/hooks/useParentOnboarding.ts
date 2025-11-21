// lib/hooks/useParentOnboarding.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
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

interface InvitationData {
    id: string;
    token?: string;
    school_slug?: string;
    school_name?: string;
    parent_phone?: string;
    learner_name?: string;
}

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
  const [invitationPrefill, setInvitationPrefillState] = useState<Partial<InvitationData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ========================
  // INVITATION PREFILL LOGIC
  // ========================

  const setInvitationPrefill = useCallback((inv: Partial<InvitationData>) => {
    setInvitationPrefillState(inv);
  }, []);

  useEffect(() => {
    // On init, check sessionStorage for invitation data and load it.
    try {
      const raw = sessionStorage.getItem("sho_invitation");
      if (raw) {
        const parsed = JSON.parse(raw);
        setInvitationPrefill(parsed);
      }
    } catch (err) {
      console.warn("Could not read invitation from sessionStorage:", err);
    }
  }, [setInvitationPrefill]);

  useEffect(() => {
    // When prefill data is available, merge it into the main onboarding state
    if (invitationPrefill) {
      setOnboardingData(prev => ({
        ...prev,
        parent_phone: invitationPrefill.parent_phone || prev.parent_phone,
        learner_name: invitationPrefill.learner_name || prev.learner_name,
        school_slug: invitationPrefill.school_slug || prev.school_slug,
        school_name: invitationPrefill.school_name || prev.school_name,
        invitation_id: invitationPrefill.id,
        invitation_token: invitationPrefill.token,
      }));
    }
  }, [invitationPrefill]);


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
    onError: (error) => {
      setError(error.message);
    }
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
      setError(error.message);
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
    error,
    setInvitationPrefill,
  };
}
