import React from 'react';
import { ValidationResults as ValidationResultsType } from '../types';

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

interface SuccessScreenProps {
  results: ValidationResultsType;
  onClose: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ results, onClose }) => {
  return (
    <div className="text-center py-10">
      <div className="flex items-center justify-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckIcon className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-gray-900">Upload Complete!</h3>
      <p className="mt-2 text-sm text-gray-500">
        Your learner data has been successfully processed.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{results.inserted || 0}</div>
          <div className="text-xs text-green-600">Learners Added</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{results.duplicates || 0}</div>
          <div className="text-xs text-yellow-600">Duplicates Skipped</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{results.invalidRows || 0}</div>
          <div className="text-xs text-red-600">Invalid Rows</div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Finish
        </button>
      </div>
    </div>
  );
};