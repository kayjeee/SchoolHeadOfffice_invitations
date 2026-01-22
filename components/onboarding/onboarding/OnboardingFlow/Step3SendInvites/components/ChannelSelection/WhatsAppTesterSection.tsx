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
  firstName: string; // ✅ NEW
  onFirstNameChange: (value: string) => void; // ✅ NEW
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
  firstName, // ✅ NEW
  onFirstNameChange, // ✅ NEW
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
        {/* ✅ NEW: First Name Input */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            Child's First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="e.g., John"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black placeholder-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Will appear as "Hello John's Parent/Guardian"
          </p>
        </div>

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

      {/* ✅ UPDATED: Template Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📋 WhatsApp Template Preview</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p className="font-semibold">account_verification template:</p>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p>Hello <strong>{firstName || "Student"}</strong>'s Parent/Guardian</p>
            <p className="mt-2">Your child has been inducted into <strong>{schoolName}</strong>. You are welcome to follow their progress on SchoolHeadOffice.</p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm">
              ✓ Verify Account
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            The "Verify Account" button will include your unique token
          </p>
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
            !parentName.trim() ||
            !learnerNumber.trim() ||
            !firstName.trim() // ✅ NEW: Require firstName
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
            disabled={isSendingBulk}
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
            <strong className="text-gray-900">New Template:</strong>
            <p className="mt-1">We're using the approved "account_verification" template with personalized child's name and school name.</p>
          </div>
          <div>
            <strong className="text-gray-900">Test Message:</strong>
            <p className="mt-1">Send to a single phone number to verify the template works correctly.</p>
          </div>
          <div>
            <strong className="text-gray-900">Bulk Send:</strong>
            <p className="mt-1">Send to all {totalRecipients} WhatsApp contacts. Each message will include the learner's first name.</p>
          </div>
        </div>
      </div>
    </div>
  );
};