// components/parent/Onboarding/steps/LearnerSelection.tsx
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MagnifyingGlassIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Learner } from '../../../../interfaces/learner';
import LearnerCard from './LearnerCard';
import { useParentOnboarding } from '../../../../lib/hooks/useParentOnboarding';
import LoadingScreen from '../../../common/LoadingScreen';
import LearnerDetailsModal from './LearnerDetailsModal';

const addLearnerSchema = z.object({
  learner_number: z.string().min(5, 'A valid learner number is required.'),
});
type AddLearnerFormData = z.infer<typeof addLearnerSchema>;

interface LearnerSelectionProps {
  onComplete: (selectedLearnerIds: string[]) => void;
}

export default function LearnerSelection({ onComplete }: LearnerSelectionProps) {
  const { learners, linkLearner, removeLearner, isLoading } = useParentOnboarding({});

  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingLearner, setIsAddingLearner] = useState(false);
  const [viewingLearner, setViewingLearner] = useState<Learner | null>(null);

  const filteredLearners = useMemo(() => {
    if (!learners) return [];
    return learners.filter(learner =>
      `${learner.first_name} ${learner.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.learner_number.includes(searchQuery)
    );
  }, [learners, searchQuery]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddLearnerFormData>({
    resolver: zodResolver(addLearnerSchema),
  });

  const handleSelectLearner = (learnerId: string) => {
    setSelectedLearnerIds(prev =>
      prev.includes(learnerId) ? prev.filter(id => id !== learnerId) : [...prev, learnerId]
    );
  };

  const handleAddLearner = async (data: AddLearnerFormData) => {
    try {
      await linkLearner(data.learner_number);
      reset();
      setIsAddingLearner(false);
    } catch (error) {
      // The useParentOnboarding hook will set the error state
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading learners..." />;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Link Your Children</h2>
        <p className="text-gray-600 mt-1">Select your children from the list below, or add them using their unique learner number.</p>
      </div>

      {/* Search and Add controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or learner number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setIsAddingLearner(true)}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Learner
        </button>
      </div>

      {/* Add Learner Form */}
      {isAddingLearner && (
        <form onSubmit={handleSubmit(handleAddLearner)} className="p-4 bg-gray-50 rounded-lg mb-6 flex items-start gap-4">
          <div className="flex-grow">
            <label htmlFor="learner_number" className="sr-only">Learner Number</label>
            <input
              {...register('learner_number')}
              id="learner_number"
              placeholder="Enter Learner Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            {errors.learner_number && <p className="text-red-500 text-xs mt-1">{errors.learner_number.message}</p>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              {isSubmitting ? 'Searching...' : 'Find & Add'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingLearner(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </form>
      )}

      {/* Learner List */}
      <div className="space-y-4">
        {filteredLearners.length > 0 ? (
          filteredLearners.map(learner => (
            <LearnerCard
              key={learner.id}
              learner={learner}
              isSelected={selectedLearnerIds.includes(learner.id)}
              onSelect={handleSelectLearner}
              onViewDetails={setViewingLearner}
              onRemove={removeLearner}
            />
          ))
        ) : (
          <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">No Learners Found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? "No learners match your search." : "Please add a learner using their learner number."}
            </p>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => onComplete(selectedLearnerIds)}
          disabled={selectedLearnerIds.length === 0}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {selectedLearnerIds.length > 0 ? `Confirm ${selectedLearnerIds.length} Learner(s)` : 'Select at Least One Learner'}
        </button>
      </div>

      <LearnerDetailsModal learner={viewingLearner} onClose={() => setViewingLearner(null)} />
    </div>
  );
}
