// services/WhatsAppTesterSection.js
import React from "react";
import { Send, Loader, AlertCircle, CheckCircle, Users } from "lucide-react";

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
  canSendBulk,
}) => {
  // --- Helper to clean phone number ---
  const formatPhoneNumber = (value) => value.replace(/[^\d+]/g, "");

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
          onChange={(e) =>
            onPhoneNumberChange(formatPhoneNumber(e.target.value))
          }
          placeholder="+27123456789"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
          className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* --- Send Test Button --- */}
        <button
          onClick={() => {
            onSendTest();
          }}
          disabled={
            isSending || !testPhoneNumber.trim() || !messageContent.trim()
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

        {/* --- Bulk Send Button --- */}
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
                <Loader className="animate-spin mr-2" size={16} /> Sending
                Bulk...
              </>
            ) : (
              <>
                <Users size={16} className="mr-2" /> Send to {totalRecipients}{" "}
                Contacts
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
    </div>
  );
};
