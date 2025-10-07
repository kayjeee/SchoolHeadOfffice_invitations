// WhatsAppScheduler.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Send, AlertCircle } from 'lucide-react';

interface WhatsAppSchedulerProps {
  onSchedule: (scheduleData: ScheduleData) => void;
  isScheduling: boolean;
  messageContent: string;
  totalRecipients: number;
}

export interface ScheduleData {
  scheduledAt: string;
  timezone: string;
  message: string;
  recipientCount: number;
}

export const WhatsAppScheduler: React.FC<WhatsAppSchedulerProps> = ({
  onSchedule,
  isScheduling,
  messageContent,
  totalRecipients
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      return;
    }

    const scheduledAt = `${scheduledDate}T${scheduledTime}`;
    
    onSchedule({
      scheduledAt,
      timezone,
      message: messageContent,
      recipientCount: totalRecipients // Sending recipient count with schedule data
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const isScheduleValid = scheduledDate && scheduledTime;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Calendar className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Schedule Message</h3>
          <p className="text-sm text-gray-600">
            Schedule this message for optimal delivery time
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* Date and Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
            <option value="UTC">UTC</option>
            {/* Add more timezones as needed */}
          </select>
        </div>

        {/* Schedule Summary (Updated for Bulk) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-2">Schedule Summary</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Recipients:</strong> {totalRecipients} learners</p>
            <p><strong>Message Length:</strong> {messageContent.length} characters</p>
            {scheduledDate && scheduledTime && (
              <p><strong>Scheduled For:</strong> {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            Best Practices
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Schedule during school hours (8 AM - 5 PM)</li>
            <li>• Avoid weekends for urgent announcements</li>
            <li>• Consider timezone differences for international numbers</li>
            <li>• Test message before scheduling bulk send</li>
          </ul>
        </div>

        {/* Schedule Button */}
        <button
          onClick={handleSchedule}
          disabled={!isScheduleValid || isScheduling}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isScheduling ? (
            <>
              <Clock className="animate-pulse mr-2" size={16} />
              Scheduling...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Schedule Message
            </>
          )}
        </button>
      </div>
    </div>
  );
};