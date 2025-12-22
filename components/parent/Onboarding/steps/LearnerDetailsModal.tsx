// components/parent/Onboarding/steps/LearnerDetailsModal.tsx
import React from 'react';
import { Learner } from '../../../../interfaces/learner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LearnerDetailsModalProps {
  learner: Learner | null;
  onClose: () => void;
}

export default function LearnerDetailsModal({ learner, onClose }: LearnerDetailsModalProps) {
  if (!learner) {
    return null;
  }

  const { first_name, last_name, learner_number, school_name, grade, status } = learner;
  const fullName = `${first_name} ${last_name}`;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4 relative transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900" id="modal-title">
            Learner Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Full Name</span>
            <span className="text-gray-800 font-semibold">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Learner Number</span>
            <span className="text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{learner_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">School</span>
            <span className="text-gray-800">{school_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Grade</span>
            <span className="text-gray-800">{grade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Status</span>
            <span
              className={`capitalize font-bold px-2 py-1 rounded-full text-xs ${
                status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
