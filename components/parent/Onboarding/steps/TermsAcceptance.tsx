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
      <h3 className="text-2xl font-bold mb-4 text-black">
        Terms & Conditions
      </h3>

      <div className="h-72 overflow-y-auto border border-gray-300 p-4 rounded-md text-sm text-black space-y-4">
        <p>
          These Terms and Conditions (“Terms”) govern your access to and use of
          this School Customer Relationship Management platform (“Platform”).
          By accessing or using this Platform, you agree to be bound by these
          Terms. If you do not agree, you may not use the Platform.
        </p>

        <h4 className="font-semibold text-base">1. Purpose of the Platform</h4>
        <p>
          This Platform is designed to facilitate communication, administration,
          and engagement between schools, parents, learners, and authorized staff.
          It may include features such as messaging, notifications, academic
          updates, onboarding workflows, and document management.
        </p>

        <h4 className="font-semibold text-base">2. User Responsibilities</h4>
        <p>
          You agree to provide accurate, current, and complete information during
          registration and onboarding. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities
          conducted under your account.
        </p>

        <h4 className="font-semibold text-base">3. Acceptable Use</h4>
        <p>
          You agree not to misuse the Platform. This includes, but is not limited
          to, unauthorized access, distribution of harmful or unlawful content,
          attempting to disrupt system operations, or using the Platform for any
          purpose not related to school administration or communication.
        </p>

        <h4 className="font-semibold text-base">4. Data Privacy & Protection</h4>
        <p>
          The Platform processes personal information in accordance with applicable
          data protection laws. By using the Platform, you consent to the collection,
          storage, and processing of personal data strictly for educational,
          administrative, and communication purposes.
        </p>

        <h4 className="font-semibold text-base">5. Communication Consent</h4>
        <p>
          You consent to receive official school communications via the Platform,
          including notifications sent through email, SMS, or WhatsApp where
          applicable. These communications are intended solely for school-related
          purposes.
        </p>

        <h4 className="font-semibold text-base">6. Intellectual Property</h4>
        <p>
          All content, software, and materials provided on this Platform remain the
          intellectual property of the Platform provider or the respective school.
          You may not copy, modify, or distribute any content without prior written
          permission.
        </p>

        <h4 className="font-semibold text-base">7. Limitation of Liability</h4>
        <p>
          The Platform is provided “as is.” While reasonable efforts are made to
          ensure reliability and accuracy, the Platform provider shall not be held
          liable for any direct or indirect loss arising from use or inability to
          use the Platform.
        </p>

        <h4 className="font-semibold text-base">8. Changes to Terms</h4>
        <p>
          These Terms may be updated from time to time. Continued use of the
          Platform after changes are made constitutes acceptance of the revised
          Terms.
        </p>

        <h4 className="font-semibold text-base">9. Governing Law</h4>
        <p>
          These Terms shall be governed by and interpreted in accordance with the
          laws of the jurisdiction in which the school operates.
        </p>
      </div>

      <form onSubmit={handleSubmit(onComplete)}>
        <div className="mt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('accept_terms', { required: true })}
                type="checkbox"
                id="accept_terms"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="accept_terms"
                className="font-medium text-black"
              >
                I have read and agree to the Terms & Conditions
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Finish Onboarding
          </button>
        </div>
      </form>
    </div>
  );
}
