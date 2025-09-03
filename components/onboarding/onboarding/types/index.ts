
export type OnboardingRole = 'admin' | 'teacher' | 'student';

export interface OnboardingStep {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  roles: OnboardingRole[];
  validationSchema?: any; // Using 'any' for simplicity, can be replaced with a more specific validation schema type (e.g., Yup.Schema)
}

export interface OnboardingStatus {
  currentStepId: string;
  completedSteps: string[];
  isComplete: boolean;
  role: OnboardingRole;
}

export interface StepValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export interface OnboardingFlowContextType {
  currentStep: OnboardingStep | null;
  onboardingStatus: OnboardingStatus;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStepCompleted: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  isLoading: boolean;
  error: string | null;
}


