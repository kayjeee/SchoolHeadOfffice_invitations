// components/onboarding/index.ts

export { default as OnboardingGuard } from "./OnboardingGuard";

export * from "./hooks/useOnboardingFlow";
export * from "./hooks/useOnboardingStatus";
export * from "./hooks/useStepValidation";

export * from "./services/onboardingService";
export * from "./services/stepProgressService";

export * from "./utils/roleBasedSteps";
export * from "./utils/stepValidators";

export { default as ProgressIndicator } from "./components/ProgressIndicator";
export { default as StepNavigation } from "./components/StepNavigation";
export { default as StatusBadge } from "./components/StatusBadge";
export { default as SkipStepModal } from "./components/SkipStepModal";

export { default as OnboardingLayout } from "./layouts/OnboardingLayout";
export { default as StepLayout } from "./layouts/StepLayout";

export * from "./types";
