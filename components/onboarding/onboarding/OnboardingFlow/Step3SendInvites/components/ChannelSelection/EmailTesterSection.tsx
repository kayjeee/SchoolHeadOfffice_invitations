
import React from 'react';
import { School } from '../../../types';

interface EmailTesterSectionProps {
  testEmail: string;
  onEmailChange: (email: string) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
  messageContent: string;
  onMessageChange: (message: string) => void;
  onSendTest: () => void;
  onSendBulk: () => void;
  isSending: boolean;
  isSendingBulk: boolean;
  testResult: any;
  validationErrors: any;
  schoolName: string;
  selectedGrade: School | null;
  totalRecipients: number;
  canSendBulk: boolean;
}

export const EmailTesterSection: React.FC<EmailTesterSectionProps> = ({
  testEmail,
  onEmailChange,
  subject,
  onSubjectChange,
  messageContent,
  onMessageChange,
  onSendTest,
  onSendBulk,
  isSending,
  isSendingBulk,
  testResult,
  validationErrors,
  schoolName,
  selectedGrade,
  totalRecipients,
  canSendBulk,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Test Email Invitations</h3>
        <p className="mt-1 text-sm text-gray-600">
          Send a sample email to ensure everything is working correctly before sending to all recipients.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="test-email" className="block text-sm font-medium text-gray-700">
            Test Email Address
          </label>
          <input
            type="email"
            id="test-email"
            value={testEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="test@example.com"
          />
          {validationErrors.email && <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="message-content" className="block text-sm font-medium text-gray-700">
            Email Body
          </label>
          <textarea
            id="message-content"
            rows={6}
            value={messageContent}
            onChange={(e) => onMessageChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {validationErrors.message && <p className="mt-2 text-sm text-red-600">{validationErrors.message}</p>}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onSendTest}
          disabled={isSending || isSendingBulk}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSending ? 'Sending Test...' : 'Send Test Email'}
        </button>
        <button
          onClick={onSendBulk}
          disabled={isSending || isSendingBulk || !canSendBulk}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isSendingBulk ? 'Sending Bulk...' : `Send to ${totalRecipients} Recipients`}
        </button>
      </div>

      {testResult && (
        <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <h4 className="font-semibold">{testResult.success ? 'Success!' : 'Error'}</h4>
          <p>{testResult.message}</p>
          {testResult.messageId && <p className="text-xs">Message ID: {testResult.messageId}</p>}
          {testResult.error && <p className="text-xs">Details: {testResult.error}</p>}
        </div>
      )}
    </div>
  );
};
