import React from 'react';
import { Learner } from '../../../lib/api/parent-api';
import { useCart } from './CartContext';
import { User, Check } from 'lucide-react';

interface LearnerSelectorProps {
  learners: Learner[];
}

export default function LearnerSelector({ learners }: LearnerSelectorProps) {
  const { selectedLearner, setSelectedLearnerWithConfirm } = useCart();

  if (!learners || learners.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <User className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Shopping For Learner
          </div>
          <div className="text-base font-bold text-gray-900">
            {selectedLearner
              ? `${selectedLearner.full_name || `${selectedLearner.first_name} ${selectedLearner.last_name}`} • ${selectedLearner.grade || 'No Grade'}`
              : 'Select a learner'}
          </div>
        </div>
      </div>

      {learners.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {learners.map((learner) => {
            const isSelected = selectedLearner?.id === learner.id;
            const displayName = learner.first_name || learner.full_name || 'Learner';

            return (
              <button
                key={learner.id}
                type="button"
                onClick={() => setSelectedLearnerWithConfirm(learner)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{displayName}</span>
                <span className="opacity-75">({learner.grade})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
