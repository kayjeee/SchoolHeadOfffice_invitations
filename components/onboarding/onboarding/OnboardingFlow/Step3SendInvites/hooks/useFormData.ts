import { useState, useEffect, useCallback } from 'react';
import { gradeService } from '../services/gradeService';
import { inviteService } from '../services/inviteService';
import { Grade, Learner, StepState } from '../types';
import { useLearnerData } from './useLearnerData';
import { usePrCodeGeneration } from './usePrCodeGeneration';

interface UseFormDataProps {
  school: any;
  currentStep: StepState;
}

export const useFormData = ({ school, currentStep }: UseFormDataProps) => {
  const schoolId = school?.id;
  
  // Grade and learner data
  const {
    grades,
    selectedGrades,
    learners,
    isLoadingGrades,
    isLoadingLearners,
    gradesError,
    handleGradeSelection,
    handleSelectAllGrades,
    handleReloadGrades,
    fetchLearnersForGrades
  } = useLearnerData(schoolId);

  // PR Code generation
  const {
    prCodes,
    inviteLinks,
    isGeneratingCodes,
    generatePrCodesAndLinks,
    getPrCodeStatus
  } = usePrCodeGeneration(schoolId, grades);

  // Form state
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string>("");

  // Fetch learners when grades are selected
  useEffect(() => {
    if (selectedGrades.length > 0) {
      fetchLearnersForGrades(selectedGrades);
    }
  }, [selectedGrades, fetchLearnersForGrades]);

  // Channel handlers
  const handleChannelSelection = useCallback((channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  }, []);

  const handleSelectAllChannels = useCallback(() => {
    setSelectedChannels((prev) =>
      prev.length === 0 ? ["email", "sms", "whatsapp", "portal"] : []
    );
  }, []);

  // Send invites handler
  const handleSendInvites = useCallback(async () => {
    const missingCodes = selectedGrades.filter(gradeId => !prCodes[gradeId]);
    
    if (missingCodes.length > 0) {
      await generatePrCodesAndLinks(missingCodes);
    }

    // Here you would typically send the actual invites
    console.log('Sending invites with:', {
      selectedGrades,
      selectedChannels,
      inviteMessage,
      prCodes,
      inviteLinks
    });
  }, [selectedGrades, selectedChannels, inviteMessage, prCodes, inviteLinks, generatePrCodesAndLinks]);

  return {
    // State
    grades,
    selectedGrades,
    learners,
    selectedChannels,
    inviteMessage,
    prCodes,
    inviteLinks,
    isLoadingGrades,
    isLoadingLearners,
    isGeneratingCodes,
    gradesError,
    
    // Actions
    handleGradeSelection,
    handleSelectAllGrades,
    handleChannelSelection,
    handleSelectAllChannels,
    setInviteMessage,
    handleReloadGrades,
    handleSendInvites,
    
    // Helpers
    getPrCodeStatus
  };
};