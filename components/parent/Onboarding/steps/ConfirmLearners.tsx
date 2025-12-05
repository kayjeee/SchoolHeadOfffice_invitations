// components/parent/Onboarding/steps/ConfirmLearners.tsx
import React from 'react';

interface Learner {
  id: string;
  name: string;
  grade?: string;
}

interface ConfirmLearnersProps {
  learners: Learner[];
  onConfirm: () => void;
  onReject: () => void;
}

export default function ConfirmLearners({ learners, onConfirm, onReject }: ConfirmLearnersProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Confirm Your Children</h3>
      <p className="text-gray-600 mb-6">
        Please confirm that the following children are yours. If this is incorrect, please contact the school.
      </p>
      <ul className="space-y-4 mb-8">
        {learners.map((learner) => (
          <li key={learner.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">{learner.name}</p>
              {learner.grade && <p className="text-sm text-gray-500">{learner.grade}</p>}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between">
        <button
          onClick={onReject}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          This is Incorrect
        </button>
        <button
          onClick={onConfirm}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
