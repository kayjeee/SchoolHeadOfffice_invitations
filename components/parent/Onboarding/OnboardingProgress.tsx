// components/parent/Onboarding/OnboardingProgress.tsx
import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { CircleStackIcon } from '@heroicons/react/24/outline';

interface OnboardingProgressProps {
  currentStep: string;
  progress: number;
  completedSteps?: string[];
  steps?: string[];
}

// Map step keys to display names
const STEP_DISPLAY_NAMES: Record<string, string> = {
  'PROFILE_SETUP': 'Profile',
  'IDENTITY_VERIFICATION': 'Identity',
  'LINK_LEARNERS': 'Learners',
  'SUBSCRIPTION_CHOICE': 'Plan',
  'PAYMENT_SETUP': 'Payment',
  'PARENT_CONTACT_SUMMARY': 'Summary',
  'NOTIFICATION_PREFERENCES': 'Notifications',
  'TERMS_ACCEPTANCE': 'Terms',
};

const DEFAULT_STEPS = [
  'PROFILE_SETUP',
  'IDENTITY_VERIFICATION',
  'LINK_LEARNERS',
  'SUBSCRIPTION_CHOICE',
  'PARENT_CONTACT_SUMMARY',
  'NOTIFICATION_PREFERENCES',
  'TERMS_ACCEPTANCE',
];

export default function OnboardingProgress({ 
  currentStep, 
  progress,
  completedSteps = [],
  steps = DEFAULT_STEPS
}: OnboardingProgressProps) {
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 Progress Component State:', {
      currentStep,
      progress: `${progress.toFixed(1)}%`,
      completedSteps,
      totalSteps: steps.length,
      currentStepIndex: steps.indexOf(currentStep)
    });
  }, [currentStep, progress, completedSteps, steps]);

  const currentStepIndex = steps.indexOf(currentStep);
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Parent Onboarding</h2>
        <div className="text-sm font-semibold text-gray-600">
          {completedSteps.length} of {steps.length} steps completed
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative pt-1 mb-6">
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 shadow-inner">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out rounded-full"
          >
            {progress > 10 && (
              <span className="text-xs font-semibold px-2">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step indicators - responsive grid */}
      <div className={`grid gap-2 ${steps.length <= 6 ? 'grid-cols-6' : 'grid-cols-8'}`}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isPast = index < currentStepIndex;
          const displayName = STEP_DISPLAY_NAMES[step] || step;

          return (
            <div key={step} className="flex flex-col items-center">
              {/* Step circle */}
              <div className="relative mb-2">
                {isCompleted ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                ) : isCurrent ? (
                  <div className="w-8 h-8 rounded-full border-4 border-green-500 bg-white flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    isPast ? 'border-gray-300 bg-gray-100' : 'border-gray-300 bg-white'
                  }`}>
                    <CircleStackIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                
                {/* Step number badge */}
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-green-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Step name */}
              <div className={`text-xs text-center font-medium max-w-full px-1 ${
                isCurrent ? 'text-green-700 font-bold' :
                isCompleted ? 'text-green-600' :
                'text-gray-500'
              }`}>
                {displayName}
              </div>

              {/* Status indicator */}
              {isCurrent && (
                <div className="mt-1 text-xs text-green-600 font-semibold">
                  ● Active
                </div>
              )}
              {isCompleted && !isCurrent && (
                <div className="mt-1 text-xs text-gray-400">
                  ✓ Done
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-semibold text-blue-800 mb-1">Debug Info:</div>
          <div className="text-blue-700 space-y-1">
            <div>Current: <span className="font-mono">{currentStep}</span></div>
            <div>Progress: <span className="font-mono">{progress.toFixed(1)}%</span></div>
            <div>Completed: <span className="font-mono">[{completedSteps.join(', ')}]</span></div>
            <div>Step {currentStepIndex + 1} of {steps.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}