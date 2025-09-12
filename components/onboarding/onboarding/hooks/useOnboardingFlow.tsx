import React, { useState, createContext, useContext } from "react";
import { STEPS } from "../OnboardingFlow";

// ----------------------
// Context Setup
// ----------------------
const OnboardingFlowContext = createContext(null);

export const useOnboardingFlow = () => {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error("useOnboardingFlow must be used within an OnboardingFlowProvider");
  }
  return context;
};

// ----------------------
// Internal Provider
// ----------------------
export const InternalOnboardingFlowProvider = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  const value = {
    currentStep: STEPS[currentStepIndex],
    currentStepIndex,
    totalSteps: STEPS.length,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    onboardingData,
    updateOnboardingData,
    isLoading,
    setIsLoading
  };

  return (
    <OnboardingFlowContext.Provider value={value}>
      {children}
    </OnboardingFlowContext.Provider>
  );
};

export { InternalOnboardingFlowProvider as OnboardingFlowProvider };
