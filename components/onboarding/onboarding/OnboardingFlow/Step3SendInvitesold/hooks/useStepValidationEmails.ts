import { useMemo } from "react";

export type StepState =
  | "grade-selection"
  | "channel-selection"
  | "message-composer"
  | "results";

export interface UseStepValidationEmailsProps {
  currentStep: StepState;
  emails: string[];
  selectedChannel: string | null;
  inviteMessage: string;
}

export interface UseStepValidationEmailsReturn {
  isStepValid: (step: StepState) => boolean;
  canProceedToNext: boolean;
  validationErrors: string[];
  stepErrors: Record<StepState, string[]>;
}

export const useStepValidationEmails = ({
  currentStep,
  emails,
  selectedChannel,
  inviteMessage,
}: UseStepValidationEmailsProps): UseStepValidationEmailsReturn => {
  // Validate email step
  const emailStepErrors = useMemo(() => {
    const errors: string[] = [];
    const validEmails = emails.filter((e) => e.trim() !== "");

    if (validEmails.length === 0) {
      errors.push("Please enter at least one email to invite");
    }

    const duplicateEmails = validEmails.filter(
      (email, idx) => validEmails.indexOf(email) !== idx
    );
    if (duplicateEmails.length > 0) {
      errors.push(`Duplicate emails found: ${duplicateEmails.join(", ")}`);
    }

    return errors;
  }, [emails]);

  // Validate channel selection step
  const channelStepErrors = useMemo(() => {
    if (!selectedChannel) return ["Please select an invitation channel"];
    return [];
  }, [selectedChannel]);

  // Validate message composer step
  const messageStepErrors = useMemo(() => {
    const errors: string[] = [];
    if (!selectedChannel) {
      errors.push("Channel must be selected before composing message");
    }
    if (!inviteMessage || inviteMessage.trim().length === 0) {
      errors.push("Message cannot be empty");
    }
    return errors;
  }, [inviteMessage, selectedChannel]);

  // Results step is always valid
  const resultsErrors: string[] = [];

  const stepErrors: Record<StepState, string[]> = useMemo(
    () => ({
      "grade-selection": emailStepErrors,
      "channel-selection": channelStepErrors,
      "message-composer": messageStepErrors,
      results: resultsErrors,
    }),
    [emailStepErrors, channelStepErrors, messageStepErrors]
  );

  const isStepValid = useMemo(
    () => (step: StepState) => stepErrors[step]?.length === 0,
    [stepErrors]
  );

  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case "grade-selection":
        return isStepValid("grade-selection");
      case "channel-selection":
        return isStepValid("grade-selection") && isStepValid("channel-selection");
      case "message-composer":
        return (
          isStepValid("grade-selection") &&
          isStepValid("channel-selection") &&
          isStepValid("message-composer")
        );
      case "results":
        return true;
      default:
        return false;
    }
  }, [currentStep, isStepValid]);

  const validationErrors = stepErrors[currentStep] || [];

  return { isStepValid, canProceedToNext, validationErrors, stepErrors };
};