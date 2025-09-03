import { createContext, useContext, useState } from "react";
import { OnboardingFlowContextType, OnboardingStep } from "../types";
import { ONBOARDING_STEPS } from "../utils/roleBasedSteps";

const OnboardingFlowContext = createContext<OnboardingFlowContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

export const OnboardingFlowProvider: React.FC<Props> = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const goToNextStep = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) setCurrentStepIndex(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const currentStep: OnboardingStep = ONBOARDING_STEPS[currentStepIndex];

  return (
    <OnboardingFlowContext.Provider value={{ currentStep, goToNextStep, goToPreviousStep }}>
      {children}
    </OnboardingFlowContext.Provider>
  );
};

export const useOnboardingFlow = () => {
  const context = useContext(OnboardingFlowContext);
  if (!context) throw new Error("useOnboardingFlow must be used within OnboardingFlowProvider");
  return context;
};
