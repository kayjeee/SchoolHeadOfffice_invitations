// components/parent/Onboarding/steps/NotificationPreferences.tsx
import React from 'react';
import { useForm } from 'react-hook-form';

interface NotificationPreferencesProps {
  onComplete: (data: any) => void;
}

export default function NotificationPreferences({ onComplete }: NotificationPreferencesProps) {
  const { register, handleSubmit } = useForm();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
      <form onSubmit={handleSubmit(onComplete)}>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('email_notifications')}
                type="checkbox"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="email_notifications" className="font-medium text-gray-700">
                Email Notifications
              </label>
              <p className="text-gray-500">Get important notifications about your learner's progress via email.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('sms_notifications')}
                type="checkbox"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="sms_notifications" className="font-medium text-gray-700">
                SMS Notifications
              </label>
              <p className="text-gray-500">Receive urgent alerts and reminders via SMS.</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}
