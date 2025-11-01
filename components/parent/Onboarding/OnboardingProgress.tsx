// components/parent/Onboarding/OnboardingProgress.tsx
import React from 'react';

interface OnboardingProgressProps {
  currentStep: string;
  progress: number;
}

const STEPS = [
  'Profile Setup',
  'Identity Verification',
  'Link Learners',
  'Notifications',
  'Terms',
];

export default function OnboardingProgress({ currentStep, progress }: OnboardingProgressProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800">Parent Onboarding</h2>
      <div className="mt-4">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {STEPS.map((step, index) => (
              <div key={index} className="text-center w-1/5">
                <p className="font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
