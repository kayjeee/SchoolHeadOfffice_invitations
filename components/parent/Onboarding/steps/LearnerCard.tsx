// components/parent/Onboarding/steps/LearnerCard.tsx
import React from 'react';
import { Learner } from '../../../../interfaces/learner';
import { UserCircleIcon, AcademicCapIcon, BuildingOffice2Icon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface LearnerCardProps {
  learner: Learner;
  onSelect: (learnerId: string) => void;
  onViewDetails: (learner: Learner) => void;
  onRemove?: (learnerId: string) => void;
  isSelected: boolean;
}

export default function LearnerCard({ learner, onSelect, onViewDetails, onRemove, isSelected }: LearnerCardProps) {
  const { id, first_name, last_name, learner_number, school_name, grade, status } = learner;
  const fullName = `${first_name} ${last_name}`;

  const cardBaseStyle = 'p-4 rounded-lg shadow-sm transition-all duration-200';
  const cardSelectedStyle = isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200 hover:shadow-md';

  return (
    <div className={`${cardBaseStyle} ${cardSelectedStyle}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        {/* Learner Info */}
        <div className="flex-grow mb-4 sm:mb-0">
          <div className="flex items-center mb-2">
            <UserCircleIcon className="h-6 w-6 text-gray-500 mr-3" />
            <h4 className="text-lg font-bold text-gray-800">{fullName}</h4>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span>{`Grade ${grade}`}</span>
            </div>
            <div className="flex items-center">
              <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">{`#${learner_number}`}</span>
            </div>
            <div className="flex items-center col-span-2">
              <BuildingOffice2Icon className="h-4 w-4 text-gray-400 mr-2" />
              <span>{school_name}</span>
            </div>
            <div className="flex items-center">
              {status === 'active' ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span className={`capitalize font-medium ${status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={() => onSelect(id)}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
          <button
            onClick={() => onViewDetails(learner)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Details
          </button>
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="w-full sm:w-auto px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
