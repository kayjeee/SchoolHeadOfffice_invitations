// components/parent/Onboarding/steps/LinkLearners.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCircleIcon, AcademicCapIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { ParentAPI, Learner } from '../../../../lib/api/parent-api';
import { APIError } from '../../../../lib/api/api-client';

const linkLearnerSchema = z.object({
  learner_number: z.string().min(1, 'Learner Number is required'),
});

type LinkLearnerFormData = z.infer<typeof linkLearnerSchema>;

interface LinkLearnersProps {
  existingLearners: Learner[];
  onLearnerLinked: () => void;
  onComplete: () => void;
  user: { sub: string };
}

export default function LinkLearners({ existingLearners, onLearnerLinked, onComplete, user }: LinkLearnersProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkLearnerFormData>({
    resolver: zodResolver(linkLearnerSchema),
  });

  const onSubmit = async (data: LinkLearnerFormData) => {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await ParentAPI.linkLearner(data.learner_number);
      setSuccessMessage('Learner linked successfully!');
      reset();
      onLearnerLinked(); // Refresh the list in the parent component
    } catch (error) {
      if (error instanceof APIError) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Your Linked Learners */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-6">Your Linked Learners</h3>
        {existingLearners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {existingLearners.map((learner) => (
              <div key={learner.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center mb-3">
                  <UserCircleIcon className="h-8 w-8 text-gray-500 mr-3" />
                  <p className="text-lg font-semibold text-gray-800">{learner.full_name}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Learner No:</span> {learner.accession_number}</p>
                  <p className="flex items-center"><BuildingLibraryIcon className="h-4 w-4 mr-2" /> {learner.school_name ?? 'Not available'}</p>
                  <p className="flex items-center"><AcademicCapIcon className="h-4 w-4 mr-2" /> {learner.grade_name ?? 'Not available'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">You haven't linked any learners yet.</p>
            <p className="text-sm text-gray-400 mt-1">Use the form below to add your first learner.</p>
          </div>
        )}
      </div>

      {/* Section 2: Link a New Learner */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Link a New Learner</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="learner_number" className="block text-sm font-medium text-gray-700">
              Learner Number
            </label>
            <input
              id="learner_number"
              {...register('learner_number')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter the unique number from the school"
            />
            {errors.learner_number && <p className="text-red-500 text-xs mt-1">{errors.learner_number.message}</p>}
          </div>

          {apiError && <p className="text-red-500 text-sm mt-4">{apiError}</p>}
          {successMessage && <p className="text-green-600 text-sm mt-4">{successMessage}</p>}

          <div className="mt-6 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Linking...' : 'Link Learner'}
            </button>
          </div>
        </form>
      </div>

      {/* Continue Button */}
      <div className="mt-8 text-right">
        <button
          onClick={onComplete}
          disabled={existingLearners.length === 0}
          className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
