// components/parent/Onboarding/steps/ConfirmLearner.tsx
import React from 'react';

interface ConfirmLearnerProps {
  onComplete: () => void;
  prefillData: {
    learner_name?: string;
    school_name?: string;
  };
}

export default function ConfirmLearner({ onComplete, prefillData }: ConfirmLearnerProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Confirm Learner</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Learner Name</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">{prefillData.learner_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">School Name</label>
          <p className="mt-1 text-lg font-semibold text-gray-900">{prefillData.school_name}</p>
        </div>
      </div>
      <div className="mt-6 text-right">
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
