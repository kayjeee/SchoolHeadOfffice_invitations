// components/parent/Onboarding/steps/LinkLearners.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const linkLearnerSchema = z.object({
  learnerId: z.string().min(6, 'Invalid Learner ID'),
});

type LinkLearnerFormData = z.infer<typeof linkLearnerSchema>;

interface LinkLearnersProps {
  onComplete: (data: LinkLearnerFormData) => void;
}

export default function LinkLearners({ onComplete }: LinkLearnersProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LinkLearnerFormData>({
    resolver: zodResolver(linkLearnerSchema),
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Link Your Learners</h3>
      <form onSubmit={handleSubmit(onComplete)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Learner ID</label>
          <input {...register('learnerId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          {errors.learnerId && <p className="text-red-500 text-xs mt-1">{errors.learnerId.message}</p>}
        </div>
        <div className="mt-6 text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Linking...' : 'Link Learner'}
          </button>
        </div>
      </form>
    </div>
  );
}
