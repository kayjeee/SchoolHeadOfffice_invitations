// components/parent/Onboarding/steps/SubscriptionChoice.tsx
import React from 'react';

interface SubscriptionChoiceProps {
  onComplete: (data: { tier: 'standard' | 'premium' }) => void;
}

export default function SubscriptionChoice({ onComplete }: SubscriptionChoiceProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Choose Your Plan</h2>
      <p className="text-center text-gray-600 mb-8">Select the plan that works best for you.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Plan */}
        <div className="border rounded-lg p-6 flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold text-gray-700">Standard</h3>
          <p className="text-3xl font-bold my-4">$0<span className="text-base font-normal text-gray-500">/month</span></p>
          <ul className="space-y-2 text-gray-600">
            <li>Ad-Supported Platform</li>
            <li>Email & App Notifications</li>
            <li>Basic Support</li>
          </ul>
          <button
            onClick={() => onComplete({ tier: 'standard' })}
            className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Continue with Basic
          </button>
        </div>

        {/* Premium Plan */}
        <div className="border-2 border-blue-600 rounded-lg p-6 flex flex-col items-center text-center relative">
          <div className="absolute top-0 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>
          <h3 className="text-xl font-semibold text-blue-600">Premium</h3>
          <p className="text-3xl font-bold my-4">$10<span className="text-base font-normal text-gray-500">/month</span></p>
          <ul className="space-y-2 text-gray-600">
            <li>Ad-Free Experience</li>
            <li>WhatsApp/SMS Priority Alerts</li>
            <li>Live Transport Tracking</li>
            <li>Daily Performance Reports</li>
          </ul>
          <button
            onClick={() => onComplete({ tier: 'premium' })}
            className="mt-6 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
