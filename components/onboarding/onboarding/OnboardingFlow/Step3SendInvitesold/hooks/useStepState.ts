import { useState, useCallback } from 'react';
import { useStepValidation, StepState } from './useStepValidation';

interface UseStepStateProps {
  onNext?: () => void;
  onBack?: () => void;
  onUpdateData?: (data: { invites: string[] }) => void;
}

export const useStepState = ({ onNext, onBack, onUpdateData }: UseStepStateProps) => {
  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");

  const { canProceedToNext, validationErrors } = useStepValidation({
    currentStep,
    selectedGrades: [], // These will be provided by useFormData
    learners: [],
    selectedChannels: [],
    inviteMessage: "",
  });

  const goNext = useCallback(() => {
    if (!canProceedToNext) return;

    switch (currentStep) {
      case "grade-selection":
        setCurrentStep("channel-selection");
        break;
      case "channel-selection":
        setCurrentStep("message-composer");
        break;
      case "message-composer":
        setCurrentStep("results");
        if (onNext) onNext();
        break;
    }
  }, [currentStep, canProceedToNext, onNext]);

  const goBack = useCallback(() => {
    switch (currentStep) {
      case "channel-selection":
        setCurrentStep("grade-selection");
        break;
      case "message-composer":
        setCurrentStep("channel-selection");
        break;
      case "results":
        setCurrentStep("message-composer");
        break;
      default:
        if (onBack) onBack();
        break;
    }
  }, [currentStep, onBack]);

  return {
    currentStep,
    setCurrentStep,
    canProceedToNext,
    validationErrors,
    goNext,
    goBack,
  };
};