// lib/hooks/useParentOnboarding.ts
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

// ─── Canonical step order (MUST match backend OnboardingStatus::PARENT_STEPS) ───
const PARENT_STEPS: string[] = [
  'PROFILE_SETUP',
  'IDENTITY_VERIFICATION',
  'LINK_LEARNERS',
  'SUBSCRIPTION_CHOICE',
  'PAYMENT_SETUP',
  'PARENT_CONTACT_SUMMARY',
  'NOTIFICATION_PREFERENCES',
  'TERMS_ACCEPTANCE',
];

const API_BASE = 'https://shobackendv2-production.up.railway.app/api/v1';

interface InvitationData {
  id?: string;
  token?: string;
  school_slug?: string;
  school_name?: string;
  parent_phone?: string;
  learners?: { id: string; name: string; grade?: string }[];
}

interface UseParentOnboardingProps {
  initialProfile?: any;
  initialLearners?: any[];
  invitationData?: InvitationData | null;
}

type OnboardingStep = typeof PARENT_STEPS[number] | 'INITIALIZING' | 'COMPLETE';

export function useParentOnboarding({
  initialProfile,
  initialLearners = [],
  invitationData,
}: UseParentOnboardingProps) {
  // ─── Get authenticated user from Auth0 ─────────────────────
  const { user, isLoading: isAuthLoading } = useUser();

  // ─── State ─────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('INITIALIZING');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({
    ...(invitationData || {}),
  });
  const [profile, setProfile] = useState<any>(initialProfile);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track whether we've fetched from the server at least once
  const initializedRef = useRef(false);

  // ─── Extract auth0_id helper ───────────────────────────────
  const getAuth0Id = useCallback((): string | null => {
    if (!user?.sub) return null;
    return user.sub;
  }, [user]);

  // ─── Fetch saved progress from backend ─────────────────────
  const fetchOnboardingStatus = useCallback(async () => {
    const auth0Id = getAuth0Id();
    if (!auth0Id) {
      console.warn('🔍 useParentOnboarding: no auth0_id available, starting fresh');
      setCurrentStep(PARENT_STEPS[0]);
      setProgress(0);
      initializedRef.current = true;
      return;
    }

    try {
      console.log('📥 useParentOnboarding: fetching status from backend...', { auth0Id });
      
      const res = await fetch(
        `${API_BASE}/users/onboarding_status?auth0_id=${encodeURIComponent(auth0Id)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!res.ok) {
        console.warn('⚠️ useParentOnboarding: failed to fetch status, starting fresh');
        setCurrentStep(PARENT_STEPS[0]);
        setProgress(0);
        initializedRef.current = true;
        return;
      }

      const json = await res.json();
      const status = json?.data?.onboarding_status;

      console.log('📦 useParentOnboarding: received status from backend:', status);

      if (status) {
        // Restore completed steps (filter to only known parent steps)
        const savedCompleted: string[] = (status.completed_steps || [])
          .map((s: string) => s.toString().toUpperCase())
          .filter((s: string) => PARENT_STEPS.includes(s));

        setCompletedSteps(savedCompleted);

        // Calculate progress
        const progressPercent = status.parent_completion_percentage ?? computeProgress(savedCompleted);
        setProgress(progressPercent);

        // Determine where to resume
        const nextStep = status.next_parent_step || computeNextStep(savedCompleted);
        
        console.log('🎯 useParentOnboarding: restored state', {
          savedCompleted,
          nextStep,
          progressPercent,
          isComplete: nextStep === 'COMPLETE',
        });

        if (nextStep === 'COMPLETE' || status.parent_onboarding_completed) {
          setCurrentStep('COMPLETE');
          setIsOnboardingComplete(true);
        } else {
          setCurrentStep(nextStep);
          setIsOnboardingComplete(false);
        }
      } else {
        // No status object yet — start from the beginning
        console.log('ℹ️ useParentOnboarding: no saved status, starting fresh');
        setCurrentStep(PARENT_STEPS[0]);
        setProgress(0);
      }
    } catch (e) {
      console.error('❌ useParentOnboarding: error fetching status', e);
      setCurrentStep(PARENT_STEPS[0]);
      setProgress(0);
    } finally {
      initializedRef.current = true;
    }
  }, [getAuth0Id]);

  // ─── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthLoading && user && !initializedRef.current) {
      fetchOnboardingStatus();
    }
  }, [isAuthLoading, user, fetchOnboardingStatus]);

  // ─── Complete a step ───────────────────────────────────────
  const completeStep = useCallback(async (stepName: string, data?: any) => {
    const auth0Id = getAuth0Id();

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`✨ COMPLETING STEP: ${stepName}`);
    console.log('═══════════════════════════════════════');
    console.log('📦 Step data:', data);
    console.log('🔑 Auth0 ID:', auth0Id);

    // 1. Optimistically update local state so the UI responds instantly
    const newCompleted = completedSteps.includes(stepName)
      ? completedSteps
      : [...completedSteps, stepName];

    setCompletedSteps(newCompleted);
    const newProgress = computeProgress(newCompleted);
    setProgress(newProgress);

    // Store step data locally (used by later steps, e.g. SUBSCRIPTION_CHOICE → PAYMENT_SETUP)
    if (data) {
      setOnboardingData((prev) => ({ ...prev, [stepName]: data }));
    }

    // Advance to the next step optimistically
    const next = computeNextStep(newCompleted);
    setCurrentStep(next);
    if (next === 'COMPLETE') setIsOnboardingComplete(true);

    console.log('📊 Local state updated:', {
      completedSteps: newCompleted,
      progress: newProgress,
      nextStep: next,
    });

    // 2. Persist to backend (non-blocking — UI already moved on)
    if (auth0Id) {
      try {
        console.log('📤 Persisting step to backend...');
        
        const res = await fetch(
          `${API_BASE}/users/${encodeURIComponent(auth0Id)}/onboarding_status/complete_step`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step_name: stepName,
              metadata: data || {},
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('❌ useParentOnboarding: backend complete_step failed', err);
          
          // Roll back local state so the user can retry
          setCompletedSteps(completedSteps);
          setProgress(computeProgress(completedSteps));
          setCurrentStep(stepName);
          if (stepName !== 'COMPLETE') setIsOnboardingComplete(false);
          
          setError('Failed to save progress. Please try again.');
        } else {
          const result = await res.json();
          console.log('✅ useParentOnboarding: step persisted successfully', result);
          setError(null);
        }
      } catch (e) {
        console.error('❌ useParentOnboarding: network error persisting step', e);
        
        // Roll back
        setCompletedSteps(completedSteps);
        setProgress(computeProgress(completedSteps));
        setCurrentStep(stepName);
        if (stepName !== 'COMPLETE') setIsOnboardingComplete(false);
        
        setError('Network error. Please check your connection and try again.');
      }
    } else {
      console.warn('⚠️ useParentOnboarding: no auth0_id, cannot persist to backend');
    }

    console.log('═══════════════════════════════════════');
    console.log('');
  }, [completedSteps, getAuth0Id]);

  // ─── Go back one step ──────────────────────────────────────
  const goBack = useCallback(() => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔙 GO BACK REQUESTED');
    console.log('═══════════════════════════════════════');

    const idx = PARENT_STEPS.indexOf(currentStep as any);
    console.log(`📍 Current step: ${currentStep} (index ${idx})`);

    if (idx <= 0) {
      console.log('⛔ Already at first step, cannot go back');
      console.log('═══════════════════════════════════════');
      console.log('');
      return;
    }

    const previousStep = PARENT_STEPS[idx - 1];
    console.log(`⬅️ Going back to: ${previousStep}`);

    // Remove current step from completed steps
    const newCompleted = completedSteps.filter((s) => s !== currentStep);
    setCompletedSteps(newCompleted);
    setProgress(computeProgress(newCompleted));
    setCurrentStep(previousStep);

    console.log('📝 Updated state:', {
      completedSteps: newCompleted,
      currentStep: previousStep,
    });
    console.log('═══════════════════════════════════════');
    console.log('');
  }, [currentStep, completedSteps]);

  // ─── Expose ────────────────────────────────────────────────
  return {
    // User data
    user,
    profile,
    learners: initialLearners,

    // Step management
    currentStep,
    steps: PARENT_STEPS,
    completedSteps,

    // State
    onboardingData,
    isOnboardingComplete,
    isLoading: isAuthLoading || !initializedRef.current,
    progress,
    error,

    // Actions
    completeStep,
    goBack,
    retryFetch: fetchOnboardingStatus,
  };
}

// ─── Pure helpers (no side effects) ───────────────────────────
function computeNextStep(completed: string[]): OnboardingStep {
  for (const step of PARENT_STEPS) {
    if (!completed.includes(step)) return step;
  }
  return 'COMPLETE';
}

function computeProgress(completed: string[]): number {
  if (PARENT_STEPS.length === 0) return 0;
  const count = completed.filter((s) => PARENT_STEPS.includes(s)).length;
  return Math.round((count / PARENT_STEPS.length) * 100);
}