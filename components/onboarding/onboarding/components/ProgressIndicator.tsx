
import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  currentStepName: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress, currentStepName }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-4 rounded-full text-xs flex items-center justify-center text-white"
        style={{ width: `${progress}%` }}
      >
        {progress.toFixed(0)}% - {currentStepName}
      </div>
    </div>
  );
};


export default ProgressIndicator;


