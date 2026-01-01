// components/parent/Onboarding/steps/LinkLearners.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlusIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Learner } from '../../../../lib/api/parent-api';

interface LinkLearnersProps {
  existingLearners: Learner[];
  onLearnerLinked: () => void;
  onComplete: () => void;
  user: any;
}

export default function LinkLearners({ 
  existingLearners, 
  onLearnerLinked, 
  onComplete, 
  user 
}: LinkLearnersProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleLinkLearner = async (data: any) => {
    setIsLinking(true);
    setLinkError(null);
    setLinkSuccess(false);

    try {
      const response = await fetch('/api/parent/link-learners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_token: data.invitation_token,
          phone_number: data.phone_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link learner');
      }

      setLinkSuccess(true);
      reset();
      onLearnerLinked(); // Refresh learners list
      
      setTimeout(() => setLinkSuccess(false), 3000);
    } catch (error: any) {
      setLinkError(error.message || 'An error occurred while linking learner');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Link Your Learners</h3>

      {/* Existing Learners Section */}
      {existingLearners.length > 0 && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-6 w-6 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-green-800">
              Your Linked Learners ({existingLearners.length})
            </h4>
          </div>
          
          <div className="space-y-3">
            {existingLearners.map((learner) => (
              <div 
                key={learner.id} 
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-green-100"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {learner.first_name} {learner.last_name}
                    </p>
                    {learner.grade && (
                      <p className="text-sm text-gray-500">Grade: {learner.grade}</p>
                    )}
                    {learner.learner_number && (
                      <p className="text-sm text-gray-500">ID: {learner.learner_number}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  Linked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link Additional Learner Form */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <UserPlusIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-800">
            Link Additional Learner
          </h4>
        </div>

        <form onSubmit={handleSubmit(handleLinkLearner)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invitation Token
            </label>
            <input
              {...register('invitation_token', { required: 'Invitation token is required' })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Enter invitation token"
            />
            {errors.invitation_token && (
              <p className="text-red-500 text-xs mt-1">
                {errors.invitation_token.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (for verification)
            </label>
            <input
              {...register('phone_number', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10,}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="27123456789"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone_number.message as string}
              </p>
            )}
          </div>

          {linkError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{linkError}</p>
            </div>
          )}

          {linkSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">✓ Learner linked successfully!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLinking}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLinking ? 'Linking...' : 'Link Learner'}
          </button>
        </form>
      </div>

      {/* Continue Button */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {existingLearners.length > 0 
              ? `You have ${existingLearners.length} learner${existingLearners.length > 1 ? 's' : ''} linked`
              : 'No learners linked yet'}
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}