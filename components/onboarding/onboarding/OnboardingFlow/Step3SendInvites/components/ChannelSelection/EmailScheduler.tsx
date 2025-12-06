
import React, 'react';
import { ScheduleData } from './types/channel';

interface EmailSchedulerProps {
  onSchedule: (scheduleData: ScheduleData) => void;
  isScheduling: boolean;
  messageContent: string;
  subject: string;
  totalRecipients: number;
}

export const EmailScheduler: React.FC<EmailSchedulerProps> = ({
  onSchedule,
  isScheduling,
  messageContent,
  subject,
  totalRecipients,
}) => {
  const [scheduledAt, setScheduledAt] = React.useState('');
  const [timezone, setTimezone] = React.useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleSchedule = () => {
    if (!scheduledAt) {
      alert('Please select a date and time to schedule the message.');
      return;
    }
    onSchedule({ message: messageContent, subject, scheduledAt, timezone });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Schedule Email Invitations</h3>
        <p className="mt-1 text-sm text-gray-600">
          Schedule the email invitations to be sent at a later date and time.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="scheduled-at" className="block text-sm font-medium text-gray-700">
            Date and Time
          </label>
          <input
            type="datetime-local"
            id="scheduled-at"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <input
            type="text"
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
            readOnly
          />
        </div>
      </div>

      <button
        onClick={handleSchedule}
        disabled={isScheduling || totalRecipients === 0}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {isScheduling ? 'Scheduling...' : `Schedule for ${totalRecipients} Recipients`}
      </button>
    </div>
  );
};
