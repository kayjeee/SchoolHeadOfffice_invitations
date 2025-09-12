
import React from 'react';

interface StepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  canSkip?: boolean;
  isLastStep: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onPrevious,
  onSkip,
  canGoNext,
  canGoPrevious,
  canSkip,
  isLastStep,
}) => {
  return (
    <div className="flex justify-between items-center mt-8">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 disabled:opacity-50"
      >
        Previous
      </button>
      <div className="flex space-x-4">
        {canSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-md bg-yellow-500 text-white"
          >
            Skip Step
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          {isLastStep ? "Finish Onboarding" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default StepNavigation;


