import { useMemo } from 'react';
import { Learner, InviteChannel, InviteMessage, StepState } from '../types';
import { validationUtils } from '../utils/validation';

export interface UseStepValidationProps {
  currentStep: StepState;
  selectedLearners: Learner[];
  selectedChannel: InviteChannel | null;
  inviteMessage: InviteMessage;
}

export interface UseStepValidationReturn {
  isStepValid: (step: StepState) => boolean;
  canProceedToNext: boolean;
  validationErrors: string[];
  stepErrors: Record<StepState, string[]>;
}

export const useStepValidation = ({
  currentStep,
  selectedLearners,
  selectedChannel,
  inviteMessage
}: UseStepValidationProps): UseStepValidationReturn => {
  
  // Validate learner selection step
  const learnerSelectionErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (selectedLearners.length === 0) {
      errors.push('Please select at least one learner to invite');
    }
    
    if (selectedLearners.length > 100) {
      errors.push('Cannot send more than 100 invites at once');
    }
    
    // Check for duplicate emails
    const emails = selectedLearners.map(l => l.email.toLowerCase());
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicateEmails.length > 0) {
      errors.push(`Duplicate email addresses found: ${duplicateEmails.join(', ')}`);
    }
    
    return errors;
  }, [selectedLearners]);

  // Validate channel selection step
  const channelSelectionErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!selectedChannel) {
      errors.push('Please select an invitation channel');
    }
    
    return errors;
  }, [selectedChannel]);

  // Validate message composer step
  const messageComposerErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!selectedChannel) {
      errors.push('Channel must be selected before composing message');
      return errors;
    }
    
    // Validate message content
    const messageErrors = validationUtils.validateInviteMessage(inviteMessage, selectedChannel);
    errors.push(...messageErrors);
    
    return errors;
  }, [inviteMessage, selectedChannel]);

  // Results step is always valid (no validation needed)
  const resultsErrors: string[] = [];

  // Combine all step errors
  const stepErrors: Record<StepState, string[]> = useMemo(() => ({
    'learner-selection': learnerSelectionErrors,
    'channel-selection': channelSelectionErrors,
    'message-composer': messageComposerErrors,
    'results': resultsErrors
  }), [learnerSelectionErrors, channelSelectionErrors, messageComposerErrors, resultsErrors]);

  // Check if a specific step is valid
  const isStepValid = useMemo(() => {
    return (step: StepState) => stepErrors[step].length === 0;
  }, [stepErrors]);

  // Check if current step can proceed to next
  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 'learner-selection':
        return isStepValid('learner-selection');
      
      case 'channel-selection':
        return isStepValid('learner-selection') && isStepValid('channel-selection');
      
      case 'message-composer':
        return (
          isStepValid('learner-selection') && 
          isStepValid('channel-selection') && 
          isStepValid('message-composer')
        );
      
      case 'results':
        return true; // Results step can always proceed (complete)
      
      default:
        return false;
    }
  }, [currentStep, isStepValid]);

  // Get validation errors for current step
  const validationErrors = useMemo(() => {
    return stepErrors[currentStep] || [];
  }, [stepErrors, currentStep]);

  return {
    isStepValid,
    canProceedToNext,
    validationErrors,
    stepErrors
  };
};

export default useStepValidation;

