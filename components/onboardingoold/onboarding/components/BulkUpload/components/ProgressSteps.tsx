import React from 'react';
import { UploadStepProps } from '../types';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 13l4 4L19 7" 
    />
  </svg>
);

export const ProgressSteps: React.FC<UploadStepProps> = ({ step, onStepChange }) => {
  const steps = ['upload', 'validate', 'confirm', 'complete'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((stepName, index) => (
          <React.Fragment key={stepName}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex-shrink-0 w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  step === stepName
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : index < steps.indexOf(step)
                    ? 'border-green-600 bg-green-50 text-green-600'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {index < steps.indexOf(step) ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-medium capitalize text-center ${
                  step === stepName
                    ? 'text-blue-600'
                    : index < steps.indexOf(step)
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
              >
                {stepName === 'upload' ? 'Upload File' : stepName}
              </span>
            </div>
            {index < 3 && <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors duration-200 ${index < steps.indexOf(step) ? 'bg-green-600' : 'bg-gray-300'}`}></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};