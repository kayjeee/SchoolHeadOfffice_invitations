// components/parent/Onboarding/steps/TermsAcceptance.tsx
import React from 'react';
import { useForm } from 'react-hook-form';

interface TermsAcceptanceProps {
  onComplete: (data: any) => void;
}

export default function TermsAcceptance({ onComplete }: TermsAcceptanceProps) {
  const { register, handleSubmit } = useForm();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
      <div className="prose max-w-none h-64 overflow-y-auto border p-4 rounded-md">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. ...
        </p>
        {/* Add your full terms and conditions here */}
      </div>
      <form onSubmit={handleSubmit(onComplete)}>
        <div className="mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('accept_terms', { required: true })}
                type="checkbox"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="accept_terms" className="font-medium text-gray-700">
                I agree to the Terms & Conditions
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Finish Onboarding
          </button>
        </div>
      </form>
    </div>
  );
}
