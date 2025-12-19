// components/parent/Onboarding/LearnerSelection.tsx
import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Learner {
  learner_number: string;
  name: string;
  grade?: string;
}

interface LearnerSelectionProps {
  learners: Learner[];
  schoolName: string;
}

export default function LearnerSelection({ learners, schoolName }: LearnerSelectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Your children at {schoolName}:</h2>
      <ul className="space-y-4">
        {learners.map((learner) => (
          <li key={learner.learner_number} className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="font-semibold">{learner.name}</p>
              {learner.grade && <p className="text-sm text-gray-500">{learner.grade}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
