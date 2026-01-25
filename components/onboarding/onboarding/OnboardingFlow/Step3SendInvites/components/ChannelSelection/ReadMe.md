# Step3SendInvites

This project implements a multi-step invitation sending component for selecting learners, choosing communication channels, composing messages, and reviewing results.

## Architecture

```
Step3SendInvites/
├── index.tsx                          # Main container component
├── components/                        # Presentational components
│   ├── LearnerSelection/
│   │   ├── index.tsx                 # Learner selection interface
│   │   ├── LearnerCard.tsx           # Individual learner card
│   │   └── GradeFilter.tsx           # Grade filtering component (placeholder)
│   ├── ChannelSelection/
│   │   ├─ ChannelModal.tsx
            ├─ ChannelSelection.tsx
            ├─ EmailModalContent.tsx
            ├─ EmailScheduler.tsx
            ├─ EmailTesterSection.tsx
            ├─ index.tsx
            ├─ InvitationComposer.tsx
            ├─ QrCodeWithCopy.tsx
            ├─ ReadMe.md
            ├─ SchoolInfoHeader.tsx
            ├─ WhatsAppMessageTester.js
            ├─ WhatsAppScheduler.tsx
            ├─ WhatsAppTesterSection.tsx
│   ├── MessageComposer/
│   │   └── index.tsx                 # Message composition interface
│   ├── InviteResults/
│   │   ├── index.tsx                 # Results overview
│   │   ├── InviteCard.tsx            # Individual invite status card (placeholder)
│   │   └── BulkActions.tsx           # Bulk operation controls (placeholder)
│   └── UI/
│       ├── Icon.tsx                  # Icon component (placeholder)
│       ├── LoadingState.tsx          # Loading state indicator
│       └── ErrorState.tsx            # Error state display
├── hooks/                             # Custom React hooks
│   ├── useLearnerData.ts             # Learner data management (fetching grades and learners)
│   ├── useInviteManagement.ts        # Invite operations (placeholder for sending invites)
│   ├── useFormState.ts               # Form state management (placeholder)
│   └── useStepValidation.ts          # Step validation logic
├── services/                          # API services
│   ├── inviteService.ts              # Invite-related API calls (mocked)
│   ├── learnerService.ts             # Learner data API calls
│   └── gradeService.ts               # Grade data API calls
├── utils/                             # Utility functions
│   ├── validation.ts                 # Input validation utilities
│   ├── download.ts                   # File download utilities
│   ├── clipboard.ts                  # Clipboard operations
│   └── constants.ts                  # Application constants (e.g., CHANNELS, API_BASE_URL)
├── types.ts                           # TypeScript type definitions
└── README.md                          # This documentation
```

## How to Run (Conceptual)

This is a component, not a standalone application. To run this, you would integrate it into a larger React application.

1.  **Install dependencies**: `npm install` or `yarn install`
2.  **Start your React application**: `npm start` or `yarn start`

Ensure your backend API is running at `http://localhost:4000` as the services are configured to fetch data from there.

## Key Features

*   **Multi-step Form**: Guides the user through grade selection, channel selection, message composition, and results.
*   **Grade and Learner Management**: Fetches and displays grades and associated learners, with selection and expansion capabilities.
*   **Channel Selection**: Allows users to choose communication channels for sending invites.
*   **Message Composition**: Provides an interface for writing the invitation message.
*   **Validation**: Basic validation for form steps.
*   **Modular Design**: Separated into components, hooks, services, and utilities for maintainability and scalability.

## Components Overview

*   **`Step3SendInvites/index.tsx`**: The main orchestrator. Manages the overall step flow and state, delegating rendering to child components.
*   **`LearnerSelection/index.tsx`**: Displays grades and learners, handles selection and expansion. Uses `LearnerCard`.
*   **`LearnerSelection/LearnerCard.tsx`**: Renders individual learner details.
*   **`ChannelSelection/index.tsx`**: Presents communication channels for selection.
*   **`MessageComposer/index.tsx`**: Text area for composing the invitation message.
*   **`InviteResults/index.tsx`**: Placeholder for displaying the summary of sent invites.

## Hooks Overview

*   **`useLearnerData.ts`**: Custom hook for fetching and managing grade and learner data from API services.
*   **`useStepValidation.ts`**: Custom hook for handling validation logic across different steps of the form.

## Services Overview

*   **`gradeService.ts`**: Encapsulates API calls related to fetching grades.
*   **`learnerService.ts`**: Encapsulates API calls related to fetching learners.
*   **`inviteService.ts`**: Placeholder for API calls related to sending invites.

## Utilities Overview

*   **`types.ts`**: Centralized TypeScript type definitions for the application.
*   **`constants.ts`**: Defines application-wide constants like `CHANNELS` and `API_BASE_URL`.
*   **`validation.ts`**: Provides helper functions for input validation.
*   **`download.ts`**: Utility for client-side file downloads.
*   **`clipboard.ts`**: Utility for clipboard operations.

## New Data Flow

The data fetching logic has been refactored to fetch all learners for a school at once, rather than fetching learners for each selected grade. This improves performance by reducing the number of network requests.

```mermaid
graph TD
    A[Step3SendInvites Component] -->|1. on mount| B(useEffect fetches data);
    B --> C{gradeService.getGrades(schoolId)};
    B --> D{learnerService.getLearnersBySchool(schoolId)};
    C --> E[Set Grades State];
    D --> F[Set Learners State];
    E --> G[LearnerSelection Component];
    F --> G;
    G -->|2. User selects grades| H(handleGradeSelection);
    H --> I[Set SelectedGrades State];
    I --> J[UI Updates];
```
// components/onboarding/onboarding/OnboardingFlow/Step3SendInvites/components/ChannelSelection/WhatsAppTesterSection.tsx
import React from "react";
import { Send, Loader, AlertCircle, CheckCircle, Users } from "lucide-react";

interface WhatsAppTesterSectionProps {
  testPhoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  learnerNumber: string;
  onLearnerNumberChange: (value: string) => void;
  parentName: string;
  onParentNameChange: (value: string) => void;
  invitedVia: string;
  onInvitedViaChange: (value: string) => void;
  messageContent: string;
  onMessageChange: (value: string) => void;
  onSendTest: () => void;
  onSendBulk: () => void;
  isSending: boolean;
  isSendingBulk: boolean;
  testResult: any;
  validationErrors: any;
  schoolName: string;
  selectedGrade: any;
  totalRecipients: number;
  canSendBulk: boolean;
}

export const WhatsAppTesterSection: React.FC<WhatsAppTesterSectionProps> = ({
  testPhoneNumber,
  onPhoneNumberChange,
  learnerNumber,
  onLearnerNumberChange,
  parentName,
  onParentNameChange,
  invitedVia,
  onInvitedViaChange,
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
  // Helper to clean phone number
  const formatPhoneNumber = (value: string) => value.replace(/[^\d+]/g, "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Name Input */}
        <div>
          <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
            Parent Name *
          </label>
          <input
            id="parentName"
            type="text"
            value={parentName}
            onChange={(e) => onParentNameChange(e.target.value)}
            placeholder="e.g., Jane Doe"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black placeholder-gray-500"
          />
        </div>

        {/* Learner Number Input */}
        <div>
          <label htmlFor="learnerNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Learner Number *
          </label>
          <input
            id="learnerNumber"
            type="text"
            value={learnerNumber}
            onChange={(e) => onLearnerNumberChange(e.target.value)}
            placeholder="e.g., 12345"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black placeholder-gray-500"
          />
        </div>
      </div>

      {/* Phone Input */}
      <div>
        <label htmlFor="testPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Test Phone Number *
        </label>
        <input
          id="testPhoneNumber"
          type="tel"
          value={testPhoneNumber}
          onChange={(e) =>
            onPhoneNumberChange(formatPhoneNumber(e.target.value))
          }
          placeholder="+27123456789"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black placeholder-gray-500 ${
            validationErrors?.phone ? "border-red-300" : "border-gray-300"
          }`}
        />
        {validationErrors?.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {validationErrors.phone}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Include country code (e.g., +27 for South Africa)
        </p>
      </div>

      {/* Invited Via Dropdown */}
      <div>
        <label htmlFor="invitedVia" className="block text-sm font-medium text-gray-700 mb-2">
          Invitation Channel
        </label>
        <select
          id="invitedVia"
          value={invitedVia}
          onChange={(e) => onInvitedViaChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
          <option value="qr_code">QR Code</option>
        </select>
      </div>

      {/* Message Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Preview
        </label>
        <textarea
          value={messageContent}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={8}
          placeholder="Enter your WhatsApp message here..."
          className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black placeholder-gray-500 ${
            validationErrors?.message ? "border-red-300" : "border-gray-300"
          }`}
        />
        {validationErrors?.message && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {validationErrors.message}
          </p>
        )}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>
            {messageContent.split(/\s+/).filter(Boolean).length} words
          </span>
          <span
            className={messageContent.length > 4000 ? "text-orange-600" : ""}
          >
            {messageContent.length}/4096 characters
          </span>
        </div>
      </div>

      {/* Template Variables Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Template Variables</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>Available variables:</strong> {"{{1}}"}, {"{{2}}"}, {"{{3}}"}, etc.</p>
          <p><strong>Example usage:</strong> &quot;Hi {"{{1}}"}, your account {"{{2}}"} has been created.&quot;</p>
          <p><strong>Current template:</strong> &quot;Hi {"{{1}}"}, your account has been created. Please verify {"{{2}}"} to complete your profile.&quot;</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Send Test Button */}
        <button
          onClick={() => {
            onSendTest();
          }}
          disabled={
            isSending ||
            !testPhoneNumber.trim() ||
            !messageContent.trim() ||
            !parentName.trim() ||
            !learnerNumber.trim()
          }
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <>
              <Loader className="animate-spin mr-2" size={16} /> Sending Test...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" /> Send Test Message
            </>
          )}
        </button>

        {/* Bulk Send Button */}
        {canSendBulk && (
          <button
            onClick={() => {
              onSendBulk();
            }}
            disabled={isSendingBulk || !messageContent.trim()}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSendingBulk ? (
              <>
                <Loader className="animate-spin mr-2" size={16} /> Sending Bulk...
              </>
            ) : (
              <>
                <Users size={16} className="mr-2" /> Send to {totalRecipients} Contacts
              </>
            )}
          </button>
        )}
      </div>

      {/* Test Result Display */}
      {testResult && (
        <div
          className={`border rounded-lg p-4 ${
            testResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="text-green-600" size={16} />
            ) : (
              <AlertCircle className="text-red-600" size={16} />
            )}
            <span
              className={`font-medium ${
                testResult.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {testResult.success ? "Success!" : "Error"}
            </span>
          </div>

          <p
            className={`text-sm ${
              testResult.success ? "text-green-700" : "text-red-700"
            }`}
          >
            {testResult.message}
          </p>

          {testResult.success && testResult.magicLink && (
            <p className="text-xs text-green-600 mt-1 break-all">
              Magic Link:{" "}
              <a
                href={testResult.magicLink}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {testResult.magicLink}
              </a>
            </p>
          )}

          {testResult.error && (
            <p className="text-xs text-red-600 mt-1">
              Error: {testResult.error}
            </p>
          )}

          {testResult.bulkResult && (
            <div className="mt-2 text-xs text-green-700">
              <p>✅ Sent: {testResult.bulkResult.sentCount}</p>
              <p>❌ Failed: {testResult.bulkResult.failedCount}</p>
              <p>📊 Total: {testResult.bulkResult.totalCount}</p>
            </div>
          )}
        </div>
      )}

      {/* Information Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 How to Use</h4>
        <div className="text-xs text-gray-700 space-y-2">
          <div>
            <strong className="text-gray-900">Test Message:</strong>
            <p className="mt-1">Send to a single phone number to verify your message template works correctly before sending to all contacts.</p>
          </div>
          <div>
            <strong className="text-gray-900">Bulk Send:</strong>
            <p className="mt-1">Send the same message to all {totalRecipients} WhatsApp contacts at once. Make sure to test first!</p>
          </div>
          <div>
            <strong className="text-gray-900">Template Variables:</strong>
            <p className="mt-1">Use {"{{1}}"}, {"{{2}}"}, etc. as placeholders that will be automatically replaced with actual data for each contact.</p>
          </div>
        </div>
      </div>
    </div>
  );
};// WhatsAppScheduler.tsx
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
};// services/WhatsAppTesterSection.js
import React from 'react';
import { Send, Loader, AlertCircle, CheckCircle, Users } from 'lucide-react';

export const WhatsAppTesterSection = ({
  testPhoneNumber,
  onPhoneNumberChange,
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
  canSendBulk
}) => {
  const formatPhoneNumber = (value) => {
    return value.replace(/[^\d+]/g, '');
  };

  return (
    <div className="space-y-4">
      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Phone Number *
        </label>
        <input
          type="tel"
          value={testPhoneNumber}
          onChange={(e) => onPhoneNumberChange(formatPhoneNumber(e.target.value))}
          placeholder="+27123456789"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            validationErrors?.phone ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationErrors?.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {validationErrors.phone}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Include country code (e.g., +27 for South Africa)
        </p>
      </div>

      {/* Message Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Preview
        </label>
        <textarea
          value={messageContent}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            validationErrors?.message ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {validationErrors?.message && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {validationErrors.message}
          </p>
        )}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{messageContent.split(/\s+/).filter(Boolean).length} words</span>
          <span className={messageContent.length > 4000 ? 'text-orange-600' : ''}>
            {messageContent.length}/4096 characters
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSendTest}
          disabled={isSending || !testPhoneNumber.trim() || !messageContent.trim()}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <>
              <Loader className="animate-spin mr-2" size={16} /> Sending Test...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" /> Send Test Message
            </>
          )}
        </button>

        {canSendBulk && (
          <button
            onClick={onSendBulk}
            disabled={isSendingBulk || !messageContent.trim()}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSendingBulk ? (
              <>
                <Loader className="animate-spin mr-2" size={16} /> Sending Bulk...
              </>
            ) : (
              <>
                <Users size={16} className="mr-2" /> Send to {totalRecipients} Contacts
              </>
            )}
          </button>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`border rounded-lg p-4 ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="text-green-600" size={16} />
            ) : (
              <AlertCircle className="text-red-600" size={16} />
            )}
            <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.success ? 'Success!' : 'Error'}
            </span>
          </div>

          <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message}
          </p>

          {testResult.success && testResult.magicLink && (
            <p className="text-xs text-green-600 mt-1 break-all">
              Magic Link: <a href={testResult.magicLink} className="underline" target="_blank" rel="noopener noreferrer">
                {testResult.magicLink}
              </a>
            </p>
          )}

          {testResult.error && (
            <p className="text-xs text-red-600 mt-1">Error: {testResult.error}</p>
          )}

          {testResult.bulkResult && (
            <div className="mt-2 text-xs text-green-700">
              <p>✅ Sent: {testResult.bulkResult.sentCount}</p>
              <p>❌ Failed: {testResult.bulkResult.failedCount}</p>
              <p>📊 Total: {testResult.bulkResult.totalCount}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { logger } from './utils/logger';
import { ChannelModalProps } from './types/channel';
import { Modal } from './ui/Modal';
import { QrCodeWithCopy } from './QrCodeWithCopy';
import { CopyButton } from './ui/CopyButton';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAudienceData } from './hooks/useAudienceData';

// NEW WHATSAPP IMPORTS
import { WhatsAppTesterSection } from './WhatsAppTesterSection';
import { WhatsAppScheduler, ScheduleData } from './WhatsAppScheduler';
import WhatsAppBusinessService from '../../../../../../../lib/services/WhatsAppBusinessService';
import { EmailModalContent } from './EmailModalContent';

export const ChannelModal: React.FC<ChannelModalProps> = ({
  channel,
  isOpen,
  onClose,
  schoolLink,
  schoolName,
  schoolId,
  prCode,
  onChannelSelect,
  isSelected,
  selectedGrades = [],
  school
}) => {
  const { user } = useUser();
  console.log('🎯 [ChannelModal] Props received:', {
    channel: channel?.name,
    isOpen,
    schoolId,
    selectedGradesCount: selectedGrades?.length || 0,
    selectedGrades: selectedGrades?.map(g => g.name) || []
  });

  // Load audience data when modal opens
  const { grades, learners, isLoading, error, totalLearners } = useAudienceData({
    schoolId,
    selectedGrades,
    channelId: channel.id,
    isOpen
  });

  // =======================================================
  // 🔥 ENHANCED WHATSAPP STATES
  // =======================================================
  const [activeTab, setActiveTab] = useState<'test' | 'schedule' | 'contacts'>('contacts');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [learnerNumber, setLearnerNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [invitedVia, setInvitedVia] = useState('whatsapp');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [customMessage, setCustomMessage] = useState(`Hi {{1}},

Your new account has been created successfully. 

Please verify {{2}} to complete your profile.`);
  const [validationErrors, setValidationErrors] = useState<any>({});
  // =======================================================

  // Country code helper function
  const getCountryCode = (country?: string): string => {
    if (!country) return '27'; // Default to South Africa
    
    // Map country names to country codes
    const countryMap: { [key: string]: string } = {
      'South Africa': '27',
      'ZA': '27',
      'Uganda': '256',
      'UG': '256',
      'Kenya': '254',
      'KE': '254',
      'Botswana': '267',
      'BW': '267',
      'Nigeria': '234',
      'NG': '234',
    };
    
    // Try exact match first
    if (countryMap[country]) {
      return countryMap[country];
    }
    
    // Try case-insensitive match
    const normalizedCountry = country.trim();
    const match = Object.keys(countryMap).find(
      key => key.toLowerCase() === normalizedCountry.toLowerCase()
    );
    
    if (match) {
      return countryMap[match];
    }
    
    // If it's already a number, return it
    if (/^\d+$/.test(country)) {
      return country;
    }
    
    // Default to South Africa
    console.warn('Unknown country, defaulting to SA (27):', country);
    return '27';
  };

  const handleSelectChannel = () => {
    logger.info('ChannelModal', 'Channel selected', {
      channelId: channel.id,
      channelName: channel.name,
      wasSelected: isSelected,
      audienceSize: totalLearners,
      gradeCount: grades.length
    });
    onChannelSelect(channel.id);
  };

  // Generate channel-specific invitation message with audience info
  const invitationMessage = `Hello 👋,

You are invited to join the ${schoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more via ${channel.name}!

${grades.length > 0 ? `Grades: ${grades.map(g => g.name).join(', ')}` : ''}
${totalLearners > 0 ? `Total Learners: ${totalLearners}` : ''}

Click here to join: ${schoolLink}`;

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(invitationMessage);
    logger.debug('ChannelModal', 'Invitation message copied', {
      audienceSize: totalLearners
    });
  };

  // Get learners count by grade for detailed breakdown
  const getLearnersCountByGrade = () => {
    const countByGrade: { [gradeId: string]: { grade: any; count: number } } = {};

    learners.forEach(learner => {
      const gradeId = learner.grade_id;
      if (gradeId) {
        const grade = grades.find(g => g.id === gradeId);
        if (grade) {
          if (!countByGrade[grade.id]) {
            countByGrade[grade.id] = { grade, count: 0 };
          }
          countByGrade[grade.id].count++;
        }
      }
    });

    return Object.values(countByGrade);
  };

  const learnersByGrade = getLearnersCountByGrade();

  // Enhanced WhatsApp number detection
  const getWhatsAppNumbers = (learner: any) => {
    const phoneFields = [
      learner.phone,
      learner.whatsapp,
      learner.contact?.phone,
      learner.contact?.whatsapp,
      learner.contact?.tel_home,
      learner.contact?.tel_emergency,
      learner.contact?.telegram
    ];

    // Filter out empty, null, undefined values and landline numbers
    const validNumbers = phoneFields.filter(phone => {
      if (!phone || typeof phone !== 'string') return false;

      const cleanPhone = phone.trim();
      if (cleanPhone === '') return false;

      // Exclude landline numbers (starting with 011)
      if (cleanPhone.startsWith('011')) return false;

      // Basic phone number validation (at least 7 digits)
      const digitCount = (cleanPhone.match(/\d/g) || []).length;
      return digitCount >= 7;
    });

    return validNumbers;
  };

  // WhatsApp-specific: Filter learners with valid WhatsApp numbers
  const learnersWithWhatsApp = learners.filter(learner => {
    const whatsappNumbers = getWhatsAppNumbers(learner);
    return whatsappNumbers.length > 0;
  });

  // Get the best WhatsApp number for a learner (prioritize WhatsApp-specific fields)
  const getBestWhatsAppNumber = (learner: any): string => {
    const numbers = getWhatsAppNumbers(learner);

    // Priority order for number selection
    const priorityFields = [
      learner.whatsapp,
      learner.contact?.whatsapp,
      learner.phone,
      learner.contact?.phone,
      learner.contact?.telegram,
      learner.contact?.tel_emergency,
      learner.contact?.tel_home
    ];

    for (const field of priorityFields) {
      if (field && typeof field === 'string') {
        const cleanField = field.trim();
        if (cleanField && !cleanField.startsWith('011')) {
          const digitCount = (cleanField.match(/\d/g) || []).length;
          if (digitCount >= 7) {
            return cleanField;
          }
        }
      }
    }

    // Fallback to first valid number
    return numbers[0] || 'No number';
  };

  // Get recipient numbers for bulk send
  const getRecipientNumbers = () => {
    return learnersWithWhatsApp.map(learner => ({
      phone: getBestWhatsAppNumber(learner),
      name: learner.full_name,
      learner_number: learner.accession_number,
      grade: grades.find(g => g.id === learner.grade_id)?.name || 'Unknown'
    }));
  };

  // WhatsApp-specific: Copy WhatsApp numbers to clipboard
  const handleCopyWhatsAppNumbers = async () => {
    const whatsappNumbers = learnersWithWhatsApp
      .map(learner => {
        const bestNumber = getBestWhatsAppNumber(learner);
        return `${learner.full_name}: ${bestNumber}`;
      })
      .join('\n');

    await navigator.clipboard.writeText(whatsappNumbers);
    logger.debug('ChannelModal', 'WhatsApp numbers copied', {
      count: learnersWithWhatsApp.length
    });
  };

  // WhatsApp-specific: Copy just phone numbers for bulk messaging
  const handleCopyPhoneNumbersOnly = async () => {
    const phoneNumbers = learnersWithWhatsApp
      .map(learner => getBestWhatsAppNumber(learner))
      .join('\n');

    await navigator.clipboard.writeText(phoneNumbers);
    logger.debug('ChannelModal', 'Phone numbers copied', {
      count: learnersWithWhatsApp.length
    });
  };

  // =======================================================
  // 🔥 ENHANCED WHATSAPP HANDLERS
  // =======================================================

  const selectedGrade = selectedGrades.length === 1 ? selectedGrades[0] : null;
  const gradeName = selectedGrade?.name || 'your selected grades';

  // Use the custom message template as default
  const messageContent = customMessage;

  // Test message validation
  const validateTestInputs = () => {
    const errors: any = {};
    const cleanedPhoneNumber = testPhoneNumber.replace(/\s+/g, '');

    if (!cleanedPhoneNumber.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(cleanedPhoneNumber)) {
      errors.phone = 'Please enter a valid phone number (E.164 format or similar, e.g., +27821234567)';
    }

    if (!messageContent.trim()) {
      errors.message = 'Message content is required';
    } else if (messageContent.length > 4096) {
      errors.message = 'Message is too long (max 4096 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle test message sending (single number)
  const handleSendTest = async () => {
    if (!validateTestInputs()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(messageContent);
      
      // ✅ Use the same country code helper
      const countryCode = getCountryCode(school?.country);
      
      console.log('📞 Test send with country code:', {
        originalCountry: school?.country,
        countryCode,
        phoneNumber: testPhoneNumber
      });
      
      const result = await WhatsAppBusinessService.sendTestMessage({
        to: testPhoneNumber.replace(/\s+/g, ''),
        schoolId: schoolId,
        userEmail: school?.userEmail,
        schoolName: schoolName,
        learnerNumber,
        parentName,
        invitedVia,
        sender_id: user?.sub,
        grade: selectedGrade,
        countryCode: countryCode, // ✅ Now passing numeric code
      });

      setTestResult({
        success: true,
        messageId: result.messageId,
        message: 'Test message sent successfully! Check your WhatsApp.'
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'An unknown error occurred.',
        message: 'Failed to send test message. Please try again.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle bulk message sending (all learners)
  const handleSendBulk = async () => {
    if (!messageContent.trim()) {
      setTestResult({
        success: false,
        message: 'Message content is required for bulk send'
      });
      return;
    }

    if (learnersWithWhatsApp.length === 0) {
      setTestResult({
        success: false,
        message: 'No WhatsApp numbers available for bulk send'
      });
      return;
    }

    setIsSendingBulk(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(messageContent);
      
      const recipientNumbers = getRecipientNumbers();
      
      // ✅ FIX: Convert country name to country code
      const countryCode = getCountryCode(school?.country);
      
      console.log('📞 Bulk send with country code:', {
        originalCountry: school?.country,
        countryCode,
        recipientCount: recipientNumbers.length
      });
      
      const result = await WhatsAppBusinessService.sendBulkMessages({
        gradeIds: selectedGrades.map(g => g.id),
        schoolName: schoolName,
        recipientNumbers: recipientNumbers,
        schoolId: schoolId,
        userEmail: school?.userEmail,
        countryCode: countryCode, // ✅ Now passing numeric code like '27'
        senderId: user?.sub,
      });

      setTestResult({
        success: true,
        message: `Bulk messages sent successfully!`,
        bulkResult: {
          sentCount: result.sentCount,
          failedCount: result.failedCount,
          totalCount: recipientNumbers.length
        }
      });

      logger.info('ChannelModal', 'Bulk WhatsApp messages sent', {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        totalRecipients: recipientNumbers.length,
        gradeIds: selectedGrades.map(g => g.id)
      });

    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'An unknown error occurred.',
        message: 'Failed to send bulk messages. Please try again.'
      });
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Enhanced schedule handler
  const handleScheduleMessage = async (scheduleData: ScheduleData) => {
    setIsScheduling(true);

    try {
      const recipientNumbers = getRecipientNumbers();
      
      const result = await WhatsAppBusinessService.scheduleBulkMessage({
        gradeIds: selectedGrades.map(g => g.id),
        message: scheduleData.message,
        scheduledAt: scheduleData.scheduledAt,
        timezone: scheduleData.timezone,
        recipientNumbers: recipientNumbers.map(r => r.phone),
        schoolId: schoolId,
        schoolName: schoolName
      });

      console.log('Message scheduled:', result);
      alert(`Message scheduled successfully for ${new Date(scheduleData.scheduledAt).toLocaleString()} to ${recipientNumbers.length} recipients`);

    } catch (error: any) {
      console.error('Failed to schedule message:', error);
      alert(`Failed to schedule message: ${error.message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  // =======================================================
  // 🔥 ENHANCED WHATSAPP TAB CONTENT RENDERERS
  // =======================================================

  // Original WhatsApp Contacts Table and Warning
  const renderWhatsAppContactsTab = () => (
    <>
      {/* WhatsApp-specific: Learner Details Section */}
      {learnersWithWhatsApp.length > 0 && !isLoading ? (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            💚 WhatsApp Contacts ({learnersWithWhatsApp.length})
          </h4>

          {/* WhatsApp Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopyWhatsAppNumbers}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
            >
              📋 Copy Names & Numbers
            </button>
            <button
              onClick={handleCopyPhoneNumbersOnly}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center"
            >
              📞 Copy Numbers Only
            </button>
          </div>

          {/* Learners List with WhatsApp Numbers */}
          <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-green-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    Learner Name
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    WhatsApp Number
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    Grade
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {learnersWithWhatsApp.map((learner, index) => {
                  const grade = grades.find(g => g.id === learner.grade_id);
                  const bestNumber = getBestWhatsAppNumber(learner);

                  // Determine the source of the number for display
                  const getNumberSource = (learner: any, number: string): string => {
                    const sources = [
                      { field: learner.whatsapp, name: 'whatsapp' },
                      { field: learner.contact?.whatsapp, name: 'contact.whatsapp' },
                      { field: learner.phone, name: 'phone' },
                      { field: learner.contact?.phone, name: 'contact.phone' },
                      { field: learner.contact?.telegram, name: 'contact.telegram' },
                      { field: learner.contact?.tel_emergency, name: 'contact.tel_emergency' },
                      { field: learner.contact?.tel_home, name: 'contact.tel_home' }
                    ];

                    const source = sources.find(s => s.field === number);
                    return source?.name || 'unknown';
                  };

                  const numberSource = getNumberSource(learner, bestNumber);

                  return (
                    <tr
                      key={learner.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}
                    >
                      <td className="p-2 border-b border-green-100 text-gray-700">
                        {learner.full_name}
                      </td>
                      <td className="p-2 border-b border-green-100 font-mono text-green-700">
                        {bestNumber}
                      </td>
                      <td className="p-2 border-b border-green-100 text-gray-600">
                        {grade?.name || 'Unknown'}
                      </td>
                      <td className="p-2 border-b border-green-100 text-xs text-gray-500">
                        {numberSource}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 text-xs text-green-700">
            <p><strong>💡 Pro Tip:</strong> Use "Copy Numbers Only" for bulk WhatsApp messaging</p>
            <p className="mt-1"><strong>🔍 Note:</strong> Landline numbers (011...) are automatically excluded</p>
          </div>
        </div>
      ) : (
        /* WhatsApp-specific: No Numbers Warning */
        learnersWithWhatsApp.length === 0 && !isLoading && totalLearners > 0 && (
          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              ⚠️ No WhatsApp Numbers Found
            </h4>
            <p className="text-sm text-yellow-700">
              {totalLearners} learners are selected but no valid WhatsApp numbers were found.
              We checked: phone, whatsapp, contact.phone, contact.whatsapp, contact.tel_home, contact.tel_emergency, and contact.telegram fields.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Landline numbers (starting with 011) are automatically excluded.
            </p>
          </div>
        )
      )}
    </>
  );

  // Main WhatsApp Tab Renderer
  const renderWhatsAppContent = () => {
    if (channel.id !== 'whatsapp') return null;

    return (
      <div className="mt-6 border-t pt-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            disabled={isLoading}
          >
            👥 Contacts ({isLoading ? '...' : learnersWithWhatsApp.length})
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'test'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🧪 Test Message
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            disabled={isLoading || learnersWithWhatsApp.length === 0}
            title={learnersWithWhatsApp.length === 0 ? "No WhatsApp contacts found to schedule a message" : "Schedule bulk message"}
          >
            📅 Schedule
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'contacts' && renderWhatsAppContactsTab()}

        {activeTab === 'test' && (
          <WhatsAppTesterSection
            testPhoneNumber={testPhoneNumber}
            onPhoneNumberChange={setTestPhoneNumber}
            learnerNumber={learnerNumber}
            onLearnerNumberChange={setLearnerNumber}
            parentName={parentName}
            onParentNameChange={setParentName}
            invitedVia={invitedVia}
            onInvitedViaChange={setInvitedVia}
            messageContent={messageContent}
            onMessageChange={setCustomMessage}
            onSendTest={handleSendTest}
            onSendBulk={handleSendBulk}
            isSending={isSendingTest}
            isSendingBulk={isSendingBulk}
            testResult={testResult}
            validationErrors={validationErrors}
            schoolName={schoolName}
            selectedGrade={selectedGrade}
            totalRecipients={learnersWithWhatsApp.length}
            canSendBulk={learnersWithWhatsApp.length > 0}
          />
        )}

        {activeTab === 'schedule' && (
          <WhatsAppScheduler
            onSchedule={handleScheduleMessage}
            isScheduling={isScheduling}
            messageContent={messageContent}
            totalRecipients={learnersWithWhatsApp.length}
          />
        )}
      </div>
    );
  };

  // Debug: Log phone number sources for troubleshooting
  React.useEffect(() => {
    if (channel.id === 'whatsapp' && learners.length > 0 && !isLoading) {
      console.log('📱 [ChannelModal] WhatsApp Number Analysis:', {
        totalLearners: learners.length,
        withWhatsApp: learnersWithWhatsApp.length,
        sampleNumbers: learners.slice(0, 3).map(learner => ({
          name: learner.full_name,
          phone: learner.phone,
          contact: learner.contact,
          bestNumber: getBestWhatsAppNumber(learner),
          allNumbers: getWhatsAppNumbers(learner)
        }))
      });
    }
  }, [learners, channel.id, isLoading]);

  console.log('📊 [ChannelModal] Current state:', {
    isLoading,
    error,
    gradesCount: grades.length,
    learnersCount: learners.length,
    learnersByGradeCount: learnersByGrade.length,
    learnersWithWhatsAppCount: learnersWithWhatsApp.length,
    isWhatsApp: channel.id === 'whatsapp'
  });

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${channel.icon} ${channel.name} Channel`}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Channel Description */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl flex items-center justify-center mx-auto mb-4">
            {channel.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {channel.name}
          </h3>
          <p className="text-gray-600">{channel.description}</p>
        </div>

        {/* Audience Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            👥 Audience Overview
            {isLoading && (
              <LoadingSpinner size="sm" text="Loading..." className="ml-2" />
            )}
          </h4>

          {error ? (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              ❌ Error loading audience data: {error}
            </div>
          ) : isLoading ? (
            <div className="text-center py-4">
              <LoadingSpinner size="md" text="Loading audience data..." />
              <p className="text-sm text-blue-600 mt-2">Fetching grades and learners...</p>
            </div>
          ) : (
            <>
              {/* Grades Summary */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Selected Grades:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {grades.length} grade{grades.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {grades.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {grades.map((grade) => (
                      <span
                        key={grade.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium border border-blue-200"
                      >
                        {grade.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600 italic">No grades selected</p>
                )}
              </div>

              {/* Learners Summary */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Total Learners:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {totalLearners} learner{totalLearners !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* WhatsApp-specific: Show WhatsApp availability */}
                {channel.id === 'whatsapp' && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-green-800">📱 WhatsApp Available:</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        learnersWithWhatsApp.length > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {learnersWithWhatsApp.length} learner{learnersWithWhatsApp.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {learnersWithWhatsApp.length === 0 && (
                      <p className="text-xs text-yellow-600 italic">
                        No WhatsApp numbers found for learners
                      </p>
                    )}
                  </div>
                )}

                {/* Learners by Grade Breakdown */}
                {learnersByGrade.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-blue-700">Breakdown by Grade:</p>
                    <div className="space-y-1">
                      {learnersByGrade.map(({ grade, count }) => (
                        <div key={grade.id} className="flex justify-between items-center text-xs">
                          <span className="text-blue-600">{grade.name}:</span>
                          <span className="bg-white text-blue-800 px-2 py-1 rounded font-medium">
                            {count} learner{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : totalLearners > 0 ? (
                  <p className="text-sm text-blue-600 italic mt-2">
                    Learners are not grouped by grade in the data
                  </p>
                ) : null}

                {totalLearners === 0 && !isLoading && (
                  <p className="text-sm text-blue-600 italic">No learners found in selected grades</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Enhanced WhatsApp Content with Bulk Send */}
        {channel.id === 'whatsapp' && renderWhatsAppContent()}
        {channel.id === 'email' && (
          <EmailModalContent
            learners={learners}
            grades={grades}
            schoolId={schoolId}
            schoolName={schoolName}
          />
        )}

        {/* School Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">🏫 School Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>School:</strong> {schoolName}</p>
            <p><strong>ID:</strong> {schoolId}</p>
            {prCode && <p><strong>PR Code:</strong> {prCode}</p>}
          </div>
        </div>

        {/* QR Code and Link */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">🔗 Share Invitation</h4>
          <QrCodeWithCopy
            link={schoolLink}
            size={120}
            showLink={true}
          />
        </div>

        {/* Invitation Message */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            ✉️ Invitation Message for {channel.name}
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {invitationMessage}
            </p>
          </div>
          <CopyButton
            text={invitationMessage}
            variant="outline"
            size="md"
            className="w-full justify-center"
            onClick={handleCopyMessage}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSelectChannel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
              isSelected
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="Loading..." />
            ) : isSelected ? (
              <span className="flex items-center justify-center">
                ✅ Selected • {totalLearners} learners
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Select Channel • {totalLearners} learners
              </span>
            )}
          </button>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="text-xs text-gray-400 border-t pt-2">
          <p>Debug: Channel={channel.id} | School={schoolId} | Grades={grades.length} | Learners={totalLearners}</p>
          <p>WhatsApp Contacts: {learnersWithWhatsApp.length}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ChannelModal;import React, { useState } from 'react';
import { logger } from './utils/logger';
import { ChannelSelectionProps, Channel } from './types/channel';
import { usePrCode } from './hooks/usePrCode';
import { SchoolInfoHeader } from './SchoolInfoHeader';
import { ChannelCard } from './ChannelCard';
import { ChannelModal } from './ChannelModal';
import { InvitationComposer } from './InvitationComposer';

export const ChannelSelection: React.FC<ChannelSelectionProps> = ({
  channels,
  selectedChannels,
  learners,
  selectedGrades, // NEW: Receive selected grades
  schoolName,
  schools,
  school,
  onChannelSelection,
  onSelectAllChannels,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Log component mount and props
  React.useEffect(() => {
    logger.info('ChannelSelection', 'Component mounted', {
      schoolName,
      schoolsCount: schools?.length || 0,
      channelsCount: channels.length,
      selectedChannelsCount: selectedChannels.length,
      selectedGradesCount: selectedGrades.length,
      learnersCount: learners.length
    });

    // Log detailed audience information
    logger.debug('ChannelSelection', 'Audience Details', {
      selectedGrades: selectedGrades.map(g => ({ id: g.id, name: g.name })),
      learnersBreakdown: {
        total: learners.length,
        withEmail: learners.filter(l => l.email).length,
        withPhone: learners.filter(l => l.phone).length
      }
    });
  }, []);

  // Determine actual school data
  const actualSchoolName = schoolName || school?.schoolName || school?.name || "your school";
  const schoolId = school?.id || school?._id || schools?.[0]?.id || schools?.[0]?._id;

  // Use PR code hook
  const { prCode, isGenerating: isGeneratingPrCode, error: prCodeError } = 
    usePrCode(schoolId, actualSchoolName, selectedChannels);

  // Generate school link
  const schoolLink = prCode 
    ? `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}?prcode=${prCode}`
    : `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}`;

  // Modal handlers
  const handleChannelClick = (channel: Channel) => {
    logger.info('ChannelSelection', 'Channel clicked for modal', {
      channelId: channel.id,
      channelName: channel.name,
      selectedGradesCount: selectedGrades.length,
      learnersCount: learners.length
    });
    setSelectedChannel(channel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    logger.debug('ChannelSelection', 'Closing channel modal');
    setIsModalOpen(false);
    setSelectedChannel(null);
  };

  const handleChannelSelectFromModal = (channelId: string) => {
    logger.info('ChannelSelection', 'Channel selected from modal', { 
      channelId,
      audience: `${selectedGrades.length} grades, ${learners.length} learners`
    });
    onChannelSelection(channelId);
  };

  logger.debug('ChannelSelection', 'Component state', {
    isModalOpen,
    selectedChannel: selectedChannel?.name,
    schoolLink,
    hasPrCode: !!prCode,
    audience: {
      grades: selectedGrades.length,
      learners: learners.length
    }
  });

  return (
    <div className="space-y-6 mb-8">
      {/* School Info Header */}
      <SchoolInfoHeader
        schoolName={actualSchoolName}
        schoolId={schoolId}
        totalSchools={schools?.length || 0}
        prCode={prCode}
        isGeneratingPrCode={isGeneratingPrCode}
        prCodeError={prCodeError}
      />

      {/* Audience Summary Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">👥 Selected Audience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <strong>Grades:</strong> {selectedGrades.length}
            {selectedGrades.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedGrades.map(grade => (
                  <span
                    key={grade.id}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                  >
                    {grade.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <strong>Total Learners:</strong> {learners.length}
          </div>
        </div>
      </div>

      {/* Select All Channels Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Select Communication Channels
          </h3>
          <p className="text-sm text-gray-600">
            Choose how to send invites to {learners.length} learners across {selectedGrades.length} grades
          </p>
        </div>
        <button
          onClick={onSelectAllChannels}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {selectedChannels.length === channels.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isSelected={selectedChannels.includes(channel.id)}
            schoolLink={schoolLink}
            onChannelSelection={onChannelSelection}
            onChannelClick={handleChannelClick}
            audienceCount={learners.length} // Pass audience count to card
          />
        ))}
      </div>

      {/* Channel Modal */}
      {selectedChannel && (
        <ChannelModal
          channel={selectedChannel}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          schoolLink={schoolLink}
          schoolName={actualSchoolName}
          schoolId={schoolId}
          prCode={prCode}
          onChannelSelect={handleChannelSelectFromModal}
          isSelected={selectedChannels.includes(selectedChannel.id)}
            selectedGrades={selectedGrades || []} // Ensure this is passed and has fallback
          selectedLearners={learners}
            school={school} // Pass school prop for API calls
            
        />
      )}

      {/* Invitation Composer (when channels are selected) */}
      {selectedChannels.length > 0 && (
        <InvitationComposer
          schoolName={actualSchoolName}
          schoolLink={schoolLink}
          schoolId={schoolId}
          prCode={prCode}
          selectedChannels={selectedChannels}
          channels={channels}
          selectedGrades={selectedGrades}
          selectedLearners={learners}
        />
      )}
    </div>
  );
};

export default ChannelSelection;
import React, { useState } from 'react';
import { Grade, Learner } from '../../types';
import { EmailTesterSection } from './EmailTesterSection';
import { EmailScheduler } from './EmailScheduler';
import EmailService from './services/EmailService';
import { logger } from './utils/logger';

interface EmailModalContentProps {
  learners: Learner[];
  grades: Grade[];
  schoolId: string;
  schoolName: string;
  userEmail?: string;
}

export const EmailModalContent: React.FC<EmailModalContentProps> = ({
  learners,
  grades,
  schoolId,
  schoolName,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'test' | 'schedule'>('contacts');
  const [testEmail, setTestEmail] = useState('');
  const [subject, setSubject] = useState(`Invitation to ${schoolName}`);
  const [message, setMessage] = useState(`You are invited to join the ${schoolName} community.`);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const learnersWithEmail = learners.filter(l => l.email);

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const result = await EmailService.sendTestEmail({ to: testEmail, schoolName, schoolId, userEmail });
      setTestResult({ success: true, ...result });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    }
    setIsSendingTest(false);
  };

  const handleSendBulk = async () => {
    setIsSendingBulk(true);
    setTestResult(null);
    try {
      const recipientEmails = learnersWithEmail.map(l => l.email as string);
      const result = await EmailService.sendBulkEmails({ schoolName, recipientEmails, schoolId, userEmail, gradeIds: grades.map(g => g.id) });
      setTestResult({ success: true, ...result });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    }
    setIsSendingBulk(false);
  };

  const handleSchedule = async (scheduleData: { subject:string, message: string, scheduledAt: string, timezone: string }) => {
    setIsScheduling(true);
    try {
      const recipientEmails = learnersWithEmail.map(l => l.email as string);
      await EmailService.scheduleBulkEmail({ ...scheduleData, recipientEmails, schoolId, schoolName, gradeIds: grades.map(g => g.id), body: scheduleData.message });
      alert('Email invitations scheduled successfully!');
    } catch (error: any) {
      alert(`Failed to schedule email invitations: ${error.message}`);
    }
    setIsScheduling(false);
  };

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Contacts ({learnersWithEmail.length})
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'test' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Test Email
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Schedule
        </button>
      </div>

      {activeTab === 'contacts' && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            📧 Email Contacts ({learnersWithEmail.length})
          </h4>
          <div className="max-h-60 overflow-y-auto border border-blue-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-blue-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">
                    Learner Name
                  </th>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">
                    Email Address
                  </th>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {learnersWithEmail.map((learner, index) => {
                  const grade = grades.find(g => g.id === learner.grade_id);
                  return (
                    <tr
                      key={learner.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                    >
                      <td className="p-2 border-b border-blue-100 text-gray-700">
                        {learner.full_name}
                      </td>
                      <td className="p-2 border-b border-blue-100 font-mono text-blue-700">
                        {learner.email}
                      </td>
                      <td className="p-2 border-b border-blue-100 text-gray-600">
                        {grade?.name || 'Unknown'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <EmailTesterSection
          testEmail={testEmail}
          onEmailChange={setTestEmail}
          subject={subject}
          onSubjectChange={setSubject}
          messageContent={message}
          onMessageChange={setMessage}
          onSendTest={handleSendTest}
          onSendBulk={handleSendBulk}
          isSending={isSendingTest}
          isSendingBulk={isSendingBulk}
          testResult={testResult}
          validationErrors={validationErrors}
          schoolName={schoolName}
          selectedGrade={null}
          totalRecipients={learnersWithEmail.length}
          canSendBulk={learnersWithEmail.length > 0}
        />
      )}

      {activeTab === 'schedule' && (
        <EmailScheduler
          onSchedule={handleSchedule}
          isScheduling={isScheduling}
          messageContent={message}
          subject={subject}
          totalRecipients={learnersWithEmail.length}
        />
      )}
    </div>
  );
};
import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";

interface ChannelStatus {
  channel: string;
  status: "Pending" | "Sent" | "Delivered" | "Failed";
}

interface MessageComposerProps {
  inviteMessage: string;
  setInviteMessage: (message: string) => void;
  validationErrors: { [key: string]: string };
  channels: string[]; // ✅ pass selected channels here
  schoolName: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  inviteMessage,
  setInviteMessage,
  validationErrors,
  channels = [],
  schoolName,
}) => {
  const [channelStatuses, setChannelStatuses] = useState<ChannelStatus[]>([]);

  // initialize statuses when channels change
  useEffect(() => {
    if (channels.length > 0) {
      setChannelStatuses(
        channels.map((ch) => ({ channel: ch, status: "Pending" }))
      );
    }
  }, [channels]);

  // simulate sending invites
  const sendInvites = () => {
    setChannelStatuses((prev) =>
      prev.map((ch) => ({ ...ch, status: "Sent" }))
    );

    // step 2: Delivered with delay
    setTimeout(() => {
      setChannelStatuses((prev) =>
        prev.map((ch) => ({ ...ch, status: "Delivered" }))
      );
    }, 2000);
  };

  // link + QR
  const schoolLink = `https://www.schoolheadoffice.com/${encodeURIComponent(
    schoolName
  )}`;

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-medium text-gray-900">
        Compose Your Invitation Message
      </h3>

      {/* Textarea for message */}
      <textarea
        className={`w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
          validationErrors.inviteMessage ? "border-red-500" : "border-gray-300"
        }`}
        rows={6}
        placeholder="Enter your invitation message here..."
        value={inviteMessage}
        onChange={(e) => setInviteMessage(e.target.value)}
      />

      {validationErrors.inviteMessage && (
        <p className="text-red-500 text-sm">
          {validationErrors.inviteMessage}
        </p>
      )}

      {/* Preview box with QR code */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <p className="text-sm text-black whitespace-pre-line">
          {inviteMessage || "Hi! Join our school on SchoolHeadOffice."}
        </p>

        <div className="flex items-center space-x-4 mt-3">
          <QRCode value={schoolLink} size={72} />
          <div>
            <p className="text-xs text-gray-600">Scan or click:</p>
            <a
              href={schoolLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm break-all"
            >
              {schoolLink}
            </a>
          </div>
        </div>
      </div>

      {/* Tracking Status */}
      {channelStatuses.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Tracking Status</h4>
          <ul className="divide-y divide-gray-200">
            {channelStatuses.map((ch) => (
              <li
                key={ch.channel}
                className="flex justify-between items-center py-2"
              >
                <span className="font-medium text-gray-800">{ch.channel}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium
                    ${
                      ch.status === "Pending"
                        ? "bg-gray-100 text-gray-700"
                        : ch.status === "Sent"
                        ? "bg-blue-100 text-blue-600"
                        : ch.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                >
                  {ch.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={sendInvites}
        disabled={!inviteMessage || channels.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
      >
        Send Invites
      </button>
    </div>
  );
};
we want to include bulk sms implentation but firstr write readme overviewthe read me has project structurure iwant to refator 
channelselection but first create a readme overview of whts happenig with all the filles