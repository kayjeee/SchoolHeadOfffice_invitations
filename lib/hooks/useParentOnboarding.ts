// lib/hooks/useParentOnboarding.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ParentAPI, ParentProfile, Learner, UpdateProfileData } from "../api/parent-api";
import { apiClient } from "../api/api-client";
import { z } from "zod";

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
  console.log('🧪 [useParentOnboarding] Hook triggered. Received invitationData:', {
    hasData: !!invitationData,
    schoolName: invitationData?.school_name,
    token: invitationData?.token ? `${invitationData.token.substring(0, 8)}...` : 'NONE'
  });

  const { user, isLoading: authLoading } = useUser();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("INITIALIZING");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>(invitationData || {});
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isOnboardingComplete = currentStep === "COMPLETE";

  useEffect(() => {
    console.log('🧪 [useParentOnboarding] Hook state update:', {
      currentStep,
      completedCount: completedSteps.length,
      isOnboardingComplete,
      schoolName: onboardingData?.school_name
    });
  }, [currentStep, completedSteps, isOnboardingComplete, onboardingData]);

  console.log('🧪 [useParentOnboarding] Hook initialized with invitationData:', JSON.stringify(invitationData, null, 2));

  useEffect(() => {
    if (invitationData) {
      console.log('🧪 [useParentOnboarding] invitationData changed, updating onboardingData');
      setOnboardingData(prev => ({ ...prev, ...invitationData }));
    }
  }, [invitationData]);

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
      const schema = z.object({
        success: z.boolean(),
        data: z.any()
      }).passthrough();

      const json = await apiClient.get(
        `/users/onboarding_status?auth0_id=${encodeURIComponent(auth0Id)}`,
        schema
      );

      const status = json?.data?.onboarding_status || json?.data;

      if (!status) {
        console.log('🧪 [useParentOnboarding] No onboarding status found. Starting from scratch.');
        setCurrentStep(PARENT_STEPS[0]);
        return;
      }

      const completed = (status.completed_steps || []).filter((s: string) =>
        (PARENT_STEPS as readonly string[]).includes(s)
      );

      setCompletedSteps(completed);

      // Merge step metadata and school information into onboardingData
      setOnboardingData((prev: any) => {
        const schoolName = status.school_name || status.schoolName || status.primary_school_name || status.primarySchoolName;
        const metadataSchoolName = status.step_metadata?.school_name || status.step_metadata?.schoolName;
        const resolvedName = schoolName || metadataSchoolName || prev.school_name || prev.primary_school_name;

        return {
          ...prev,
          ...(status.step_metadata || {}),
          school_name: resolvedName,
          primary_school_name: resolvedName,
          schoolName: resolvedName,
          primarySchoolName: resolvedName,
        };
      });

      setProgress(Math.round((completed.length / PARENT_STEPS.length) * 100));

      // Force logic: If parent_onboarding_completed is false, we MUST be on a step
      if (status.parent_onboarding_completed === true) {
        console.log('🧪 [useParentOnboarding] Backend reports COMPLETED');
        setCurrentStep("COMPLETE");
      } else {
        const next =
          PARENT_STEPS.find((s) => !completed.includes(s)) ?? "PROFILE_SETUP";
        console.log('🧪 [useParentOnboarding] Backend reports INCOMPLETE. Next step:', next);
        setCurrentStep(next as OnboardingStep);
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

      console.log(`🧪 [useParentOnboarding] completeStep(${step}) -> Next: ${next}`);
      setCurrentStep(next as OnboardingStep);

      const schema = z.object({ success: z.boolean() }).passthrough();

      await apiClient.post(
        `/users/${encodeURIComponent(auth0Id)}/onboarding_status/complete_step`,
        { step_name: step, metadata: data ?? {} },
        schema
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
