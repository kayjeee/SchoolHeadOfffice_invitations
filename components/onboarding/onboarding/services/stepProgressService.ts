
import { OnboardingStep, OnboardingStatus } from "../types";

export const stepProgressService = {
  getNextStep(
    currentStepId: string,
    allSteps: OnboardingStep[],
    completedSteps: string[],
    role: OnboardingRole
  ): OnboardingStep | null {
    const currentStepIndex = allSteps.findIndex(
      (step) => step.id === currentStepId
    );
    if (currentStepIndex === -1) return null;

    for (let i = currentStepIndex + 1; i < allSteps.length; i++) {
      const nextStep = allSteps[i];
      if (nextStep.roles.includes(role) && !completedSteps.includes(nextStep.id)) {
        return nextStep;
      }
    }
    return null;
  },

  getPreviousStep(
    currentStepId: string,
    allSteps: OnboardingStep[],
    role: OnboardingRole
  ): OnboardingStep | null {
    const currentStepIndex = allSteps.findIndex(
      (step) => step.id === currentStepId
    );
    if (currentStepIndex === -1) return null;

    for (let i = currentStepIndex - 1; i >= 0; i--) {
      const prevStep = allSteps[i];
      if (prevStep.roles.includes(role)) {
        return prevStep;
      }
    }
    return null;
  },

  calculateProgress(
    onboardingStatus: OnboardingStatus,
    allSteps: OnboardingStep[]
  ): number {
    const relevantSteps = allSteps.filter((step) =>
      step.roles.includes(onboardingStatus.role)
    );
    const completedRelevantSteps = onboardingStatus.completedSteps.filter((id) =>
      relevantSteps.some((step) => step.id === id)
    );
    if (relevantSteps.length === 0) return 0;
    return (completedRelevantSteps.length / relevantSteps.length) * 100;
  },

  isStepSkippable(stepId: string, allSteps: OnboardingStep[]): boolean {
    // Define logic for which steps are skippable
    // For now, let's say Step2UploadLearners is skippable
    return stepId === "Step2UploadLearners";
  },
};


