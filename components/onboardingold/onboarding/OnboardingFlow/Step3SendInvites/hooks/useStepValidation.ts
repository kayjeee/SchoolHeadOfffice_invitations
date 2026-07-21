import { useMemo } from "react";
import { StepState, Learner } from "../types";

interface UseStepValidationProps {
  currentStep: StepState;
  selectedGrades: string[];
  learners: Learner[];
  selectedChannels: string[];
  inviteMessage: string;
}

export const useStepValidation = ({
  currentStep,
  selectedGrades,
  learners,
  selectedChannels,
  inviteMessage,
}: UseStepValidationProps) => {
  const { canProceedToNext, validationErrors } = useMemo(() => {
    const errors: { [key: string]: string } = {};
    let canProceed = true;

    switch (currentStep) {
      case "grade-selection":
        if (selectedGrades.length === 0) {
          errors.selectedGrades = "Please select at least one grade.";
          canProceed = false;
        }
        break;
      case "channel-selection":
        if (selectedChannels.length === 0) {
          errors.selectedChannels = "Please select at least one communication channel.";
          canProceed = false;
        }
        break;
      case "message-composer":
        if (inviteMessage.trim().length === 0) {
          errors.inviteMessage = "Message cannot be empty.";
          canProceed = false;
        }
        break;
      case "results":
        // No specific validation needed for results step to proceed
        break;
    }
    return { canProceedToNext: canProceed, validationErrors: errors };
  }, [currentStep, selectedGrades, learners, selectedChannels, inviteMessage]);

  return {
    canProceedToNext,
    validationErrors,
  };
};
