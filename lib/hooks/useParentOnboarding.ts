// lib/hooks/useParentOnboarding.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ParentAPI, ParentProfile, Learner, UpdateProfileData } from "../api/parent-api";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://shobackendv2-production.up.railway.app/api/v1";

const PARENT_STEPS = [
  "PROFILE_SETUP",
  "IDENTITY_VERIFICATION",
  "LINK_LEARNERS",
  "SUBSCRIPTION_CHOICE",
  "PAYMENT_SETUP",
  "PARENT_CONTACT_SUMMARY",
  "NOTIFICATION_PREFERENCES",
  "TERMS_ACCEPTANCE",
] as const;

type OnboardingStep = typeof PARENT_STEPS[number] | "COMPLETE" | "INITIALIZING";

interface InvitationData {
  id?: string;
  token?: string;
  school_slug?: string;
  school_name?: string;
  parent_phone?: string;
  learners?: { id: string; name: string; grade?: string }[];
}

interface Props {
  initialProfile?: ParentProfile | null;
  initialLearners?: Learner[];
  invitationData?: InvitationData | null;
}

export function useParentOnboarding({
  initialProfile,
  initialLearners = [],
  invitationData,
}: Props) {
  const { user, isLoading: authLoading } = useUser();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);

  console.log('🧪 [useParentOnboarding] Hook initialized with invitationData:', JSON.stringify(invitationData, null, 2));

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("PROFILE_SETUP");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>(invitationData || {});

  useEffect(() => {
    if (invitationData) {
      console.log('🧪 [useParentOnboarding] invitationData changed, updating onboardingData');
      setOnboardingData(prev => ({ ...prev, ...invitationData }));
    }
  }, [invitationData]);
  const [progress, setProgress] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth0Id = user?.sub ?? null;

  // 🚫 DO NOTHING if user not logged in
  const isDisabled = !auth0Id;

  /* ---------------------------------------------------------------------- */
  /*                               DATA FETCHING                             */
  /* ---------------------------------------------------------------------- */

  const { data: profile } = useQuery({
    queryKey: ["parentProfile", auth0Id],
    queryFn: () => ParentAPI.getProfile(auth0Id!),
    enabled: !!auth0Id,
    initialData: initialProfile,
  });

  const { data: learners = [] } = useQuery({
    queryKey: ["parentLearners", auth0Id],
    queryFn: () => ParentAPI.getMyLearners(auth0Id!).then(r => r.learners),
    enabled: !!auth0Id,
    initialData: initialLearners,
  });

  /* ---------------------------------------------------------------------- */
  /*                         FETCH ONBOARDING STATUS                         */
  /* ---------------------------------------------------------------------- */

  const fetchStatus = useCallback(async () => {
    if (!auth0Id) return;

    try {
      const res = await fetch(
        `https://shobackendv2-production.up.railway.app/api/v1/users/onboarding_status?auth0_id=${encodeURIComponent(auth0Id)}`
      );

      if (!res.ok) throw new Error();

      const json = await res.json();
      const status = json?.data?.onboarding_status;

      if (!status) {
        setCurrentStep(PARENT_STEPS[0]);
        return;
      }

      const completed = (status.completed_steps || []).filter((s: string) =>
        (PARENT_STEPS as readonly string[]).includes(s)
      );

      setCompletedSteps(completed);

      // Merge step metadata into onboardingData
      if (status.step_metadata) {
        console.log('🧪 [useParentOnboarding] Merging step_metadata:', JSON.stringify(status.step_metadata, null, 2));
        setOnboardingData((prev: any) => ({
          ...prev,
          ...status.step_metadata
        }));
      }

      setProgress(Math.round((completed.length / PARENT_STEPS.length) * 100));

      if (status.parent_onboarding_completed) {
        setCurrentStep("COMPLETE");
        setIsOnboardingComplete(true);
      } else {
        const next =
          PARENT_STEPS.find((s) => !completed.includes(s)) ?? "COMPLETE";
        setCurrentStep(next);
      }
    } catch {
      setCurrentStep(PARENT_STEPS[0]);
    } finally {
      initializedRef.current = true;
    }
  }, [auth0Id]);

  useEffect(() => {
    if (!authLoading && auth0Id && !initializedRef.current) {
      fetchStatus();
    }
  }, [authLoading, auth0Id, fetchStatus]);

  /* ---------------------------------------------------------------------- */
  /*                              MUTATIONS                                  */
  /* ---------------------------------------------------------------------- */

  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfileData) =>
      ParentAPI.updateProfile(auth0Id!, data),
    onSuccess: (profile) =>
      queryClient.setQueryData(["parentProfile", auth0Id], profile),
  });

  const goBack = useCallback(() => {
    const currentIndex = PARENT_STEPS.indexOf(currentStep as any);
    if (currentIndex > 0) {
      setCurrentStep(PARENT_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const linkLearner = useCallback(async (learnerNumber: string) => {
    if (!auth0Id) return;
    await ParentAPI.linkLearner(auth0Id, learnerNumber);
    queryClient.invalidateQueries({ queryKey: ["parentLearners", auth0Id] });
  }, [auth0Id, queryClient]);

  const completeStep = useCallback(
    async (step: string, data?: any) => {
      if (!auth0Id) return;

      if (step === "PROFILE_SETUP" && data) {
        await updateProfile.mutateAsync(data);
      }

      // Store local data
      if (data) {
        setOnboardingData((prev: any) => ({
          ...prev,
          [step]: data,
          ...data // Also flatten for convenience
        }));
      }

      const nextCompleted = completedSteps.includes(step)
        ? completedSteps
        : [...completedSteps, step];
      setCompletedSteps(nextCompleted);
      setProgress(Math.round((nextCompleted.length / PARENT_STEPS.length) * 100));

      const next =
        PARENT_STEPS.find((s) => !nextCompleted.includes(s)) ?? "COMPLETE";

      setCurrentStep(next);
      if (next === "COMPLETE") setIsOnboardingComplete(true);

      await fetch(
        `${API_URL}/users/${encodeURIComponent(auth0Id)}/onboarding_status/complete_step`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step_name: step, metadata: data ?? {} }),
        }
      );
    },
    [auth0Id, completedSteps, updateProfile]
  );

  /* ---------------------------------------------------------------------- */
  /*                                  STATE                                  */
  /* ---------------------------------------------------------------------- */

  const isLoading =
    authLoading || (!!auth0Id && !initializedRef.current);

  return {
    user,
    profile,
    learners,
    currentStep,
    completedSteps,
    onboardingData,
    steps: [...PARENT_STEPS],
    progress,
    isOnboardingComplete,
    isLoading,
    error,
    completeStep,
    goBack,
    linkLearner,
  };
}
