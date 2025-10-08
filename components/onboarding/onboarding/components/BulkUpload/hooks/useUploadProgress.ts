import { useState } from 'react';

export const useUploadProgress = () => {
  const [uploadStep, setUploadStep] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  const setStep = (step: string) => {
    setUploadStep(step);
  };

  const startProcessing = () => {
    setIsProcessing(true);
  };

  const stopProcessing = () => {
    setIsProcessing(false);
  };

  return {
    uploadStep,
    setUploadStep: setStep,
    isProcessing,
    startProcessing,
    stopProcessing
  };
};