import { useMemo } from 'react';
import { StepState } from '../types';

export interface UseStepValidationProps {
  currentStep: StepState;
  selectedGrades: string[]; // Changed from selectedLearners to selectedGrades
  learners: any[]; // Added learners array
  selectedChannel: string | null; // Simplified from InviteChannel
  inviteMessage: string; // Simplified from InviteMessage
}

export interface UseStepValidationReturn {
  isStepValid: (step: StepState) => boolean;
  canProceedToNext: boolean;
  validationErrors: string[];
  stepErrors: Record<StepState, string[]>;
}

export const useStepValidation = ({
  currentStep,
  selectedGrades, // Now using selectedGrades instead of selectedLearners
  learners = [], // Default to empty array to avoid undefined
  selectedChannel,
  inviteMessage
}: UseStepValidationProps): UseStepValidationReturn => {
  
  // Validate grade selection step (replaced learner selection)
  const gradeSelectionErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!selectedGrades || selectedGrades.length === 0) {
      errors.push('Please select at least one grade to invite learners from');
    }
    
    return errors;
  }, [selectedGrades]);

  // Validate learner confirmation step (new step)
  const learnerConfirmationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!learners || learners.length === 0) {
      errors.push('No learners found in selected grades');
    }
    
    return errors;
  }, [learners]);

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
    
    if (!inviteMessage || inviteMessage.trim().length === 0) {
      errors.push('Message cannot be empty');
    }
    
    if (inviteMessage && inviteMessage.trim().length < 10) {
      errors.push('Message should be at least 10 characters long');
    }
    
    return errors;
  }, [inviteMessage, selectedChannel]);

  // Results step is always valid
  const resultsErrors: string[] = [];

  // Combine all step errors - updated step names to match your component
  const stepErrors: Record<StepState, string[]> = useMemo(() => ({
    'grade-selection': gradeSelectionErrors,
    'learner-confirmation': learnerConfirmationErrors,
    'channel-selection': channelSelectionErrors,
    'message-composer': messageComposerErrors,
    'results': resultsErrors
  }), [gradeSelectionErrors, learnerConfirmationErrors, channelSelectionErrors, messageComposerErrors]);

  // Check if a specific step is valid
  const isStepValid = useMemo(() => {
    return (step: StepState) => (stepErrors[step] || []).length === 0;
  }, [stepErrors]);

  // Check if current step can proceed to next - updated logic
  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 'grade-selection':
        return isStepValid('grade-selection');
      
      case 'learner-confirmation':
        return isStepValid('grade-selection') && isStepValid('learner-confirmation');
      
      case 'channel-selection':
        return isStepValid('grade-selection') && 
               isStepValid('learner-confirmation') && 
               isStepValid('channel-selection');
      
      case 'message-composer':
        return isStepValid('grade-selection') && 
               isStepValid('learner-confirmation') && 
               isStepValid('channel-selection') && 
               isStepValid('message-composer');
      
      case 'results':
        return true;
      
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