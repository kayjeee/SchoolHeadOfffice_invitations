// lib/hooks/useStudentOnboarding.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentAPI, StudentProfileData, UpdateStudentProfilePayload } from "../api/student-api";
import { apiClient } from "../api/api-client";
import { z } from "zod";

const STUDENT_STEPS = [
  "PROFILE_SETUP",
  "TERMS_ACCEPTANCE",
] as const;

type StudentOnboardingStep = typeof STUDENT_STEPS[number] | "COMPLETE" | "INITIALIZING";

interface Props {
  initialProfile?: StudentProfileData | null;
  invitationData?: any;
}

export function useStudentOnboarding({
  initialProfile,
  invitationData,
}: Props) {
  const { user, isLoading: authLoading } = useUser();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);

  const [currentStep, setCurrentStep] = useState<StudentOnboardingStep>("INITIALIZING");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [onboardingData, setOnboardingData] = useState<any>(invitationData || {});
  const [progress, setProgress] = useState(0);

  const isOnboardingComplete = currentStep === "COMPLETE";
  const auth0Id = user?.sub ?? null;

  useEffect(() => {
    if (invitationData) {
      setOnboardingData((prev: any) => ({ ...prev, ...invitationData }));
    }
  }, [invitationData]);

  /* ---------------------------------------------------------------------- */
  /*                               DATA FETCHING                             */
  /* ---------------------------------------------------------------------- */

  const { data: profile } = useQuery({
    queryKey: ["studentProfile", auth0Id],
    queryFn: () => StudentAPI.getProfile(auth0Id!),
    enabled: !!auth0Id,
    initialData: initialProfile,
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
        setCurrentStep(STUDENT_STEPS[0]);
        return;
      }

      const completed = (status.completed_steps || []).filter((s: string) =>
        (STUDENT_STEPS as readonly string[]).includes(s)
      );

      setCompletedSteps(completed);

      setOnboardingData((prev: any) => {
        const schoolName = status.school_name || status.schoolName || status.primary_school_name || status.primarySchoolName;
        const resolvedName = schoolName || prev.school_name || prev.primary_school_name;

        return {
          ...prev,
          ...(status.step_metadata || {}),
          school_name: resolvedName,
          primary_school_name: resolvedName,
          schoolName: resolvedName,
          primarySchoolName: resolvedName,
        };
      });

      setProgress(Math.round((completed.length / STUDENT_STEPS.length) * 100));

      if (status.student_onboarding_completed === true || status.completed === true) {
        setCurrentStep("COMPLETE");
      } else {
        const next = STUDENT_STEPS.find((s) => !completed.includes(s)) ?? "PROFILE_SETUP";
        setCurrentStep(next as StudentOnboardingStep);
      }
    } catch {
      setCurrentStep(STUDENT_STEPS[0]);
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
    mutationFn: (data: UpdateStudentProfilePayload) =>
      StudentAPI.updateProfile(auth0Id!, data),
    onSuccess: (updated) =>
      queryClient.setQueryData(["studentProfile", auth0Id], updated),
  });

  const goBack = useCallback(() => {
    const currentIndex = STUDENT_STEPS.indexOf(currentStep as any);
    if (currentIndex > 0) {
      setCurrentStep(STUDENT_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const completeStep = useCallback(
    async (step: string, data?: any) => {
      if (!auth0Id) return;

      if (step === "PROFILE_SETUP" && data) {
        await updateProfile.mutateAsync(data);
      }

      if (data) {
        setOnboardingData((prev: any) => ({
          ...prev,
          [step]: data,
          ...data
        }));
      }

      const nextCompleted = completedSteps.includes(step)
        ? completedSteps
        : [...completedSteps, step];
      setCompletedSteps(nextCompleted);
      setProgress(Math.round((nextCompleted.length / STUDENT_STEPS.length) * 100));

      const next = STUDENT_STEPS.find((s) => !nextCompleted.includes(s)) ?? "COMPLETE";

      console.log(`🎓 [useStudentOnboarding] completeStep(${step}) -> Next: ${next}`);
      setCurrentStep(next as StudentOnboardingStep);

      await StudentAPI.completeStep(auth0Id, step, data ?? {});
    },
    [auth0Id, completedSteps, updateProfile]
  );

  const isLoading = authLoading || (!!auth0Id && !initializedRef.current);

  return {
    user,
    profile,
    currentStep,
    completedSteps,
    onboardingData,
    steps: [...STUDENT_STEPS],
    progress,
    isOnboardingComplete,
    isLoading,
    completeStep,
    goBack,
  };
}
