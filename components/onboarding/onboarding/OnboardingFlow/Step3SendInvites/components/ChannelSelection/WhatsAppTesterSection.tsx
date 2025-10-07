import React from 'react';
import { MessageCircle, Send, Loader, CheckCircle, AlertCircle, Copy, Edit3, Users } from 'lucide-react';

interface WhatsAppTesterSectionProps {
  testPhoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
  messageContent: string;
  onMessageChange: (message: string) => void;
  onSendTest: () => void;
  onSendBulk: () => void;
  isSending: boolean;
  isSendingBulk: boolean;
  testResult: any;
  validationErrors: { phone?: string; message?: string };
  schoolName: string;
  selectedGrade?: any;
  totalRecipients: number;
  canSendBulk: boolean;
}

export const WhatsAppTesterSection: React.FC<WhatsAppTesterSectionProps> = ({
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
  const formatPhoneNumber = (value: string) => {
    return value.replace(/[^\d+]/g, '');
  };

  const getMessageContent = () => messageContent || '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-full">
          <MessageCircle className="text-green-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Messaging</h3>
          <p className="text-sm text-gray-600">
            Test messages or send to all {totalRecipients} learners with WhatsApp numbers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Phone Input for Testing */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Send size={16} className="mr-2" />
            Test Phone Number
          </h4>
          
          <div className="space-y-3">
            <input
              type="tel"
              value={testPhoneNumber}
              onChange={(e) => onPhoneNumberChange(formatPhoneNumber(e.target.value))}
              placeholder="+27123456789"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                validationErrors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.phone && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {validationErrors.phone}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Include country code (e.g., +27 for South Africa)
            </p>
          </div>
        </div>

        {/* Message Editor */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Edit3 size={16} className="mr-2" />
              Message Content
            </h4>
            <button
              onClick={() => navigator.clipboard.writeText(getMessageContent())}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Copy size={14} className="mr-1" />
              Copy
            </button>
          </div>
          
          <textarea
            value={getMessageContent()}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={8}
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              validationErrors.message ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          
          {validationErrors.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {validationErrors.message}
            </p>
          )}
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{getMessageContent().split(/\s+/).filter(Boolean).length} words</span>
            <span className={getMessageContent().length > 4000 ? 'text-orange-600' : ''}>
              {getMessageContent().length}/4096 characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Test Send Button */}
          <button
            onClick={onSendTest}
            disabled={isSending || !testPhoneNumber.trim() || !getMessageContent().trim()}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSending ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Sending Test...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Test Message
              </>
            )}
          </button>

          {/* Bulk Send Button */}
          <button
            onClick={onSendBulk}
            disabled={isSendingBulk || !canSendBulk || !getMessageContent().trim()}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSendingBulk ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Sending Bulk...
              </>
            ) : (
              <>
                <Users size={16} className="mr-2" />
                Send to {totalRecipients} Learners
              </>
            )}
          </button>
        </div>

        {/* Recipient Summary */}
        {canSendBulk && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800 flex items-center">
                  <Users size={16} className="mr-2" />
                  Ready for Bulk Send
                </h4>
                <p className="text-sm text-blue-700">
                  This message will be sent to {totalRecipients} learners with WhatsApp numbers
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-800">{totalRecipients}</div>
                <div className="text-xs text-blue-600">recipients</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`border rounded-lg p-4 ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <AlertCircle className="text-red-600" size={16} />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Success!' : 'Error'}
              </span>
            </div>
            
            <p className={`text-sm ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.message}
            </p>
            
            {testResult.success && testResult.messageId && (
              <p className="text-xs text-green-600 mt-1">
                Message ID: {testResult.messageId}
              </p>
            )}
            
            {testResult.bulkResult && (
              <div className="mt-2 p-2 bg-green-100 rounded border border-green-200">
                <p className="text-sm font-medium text-green-800">Bulk Send Results:</p>
                <div className="text-xs text-green-700 grid grid-cols-2 gap-1 mt-1">
                  <span>Sent: {testResult.bulkResult.sentCount}</span>
                  <span>Failed: {testResult.bulkResult.failedCount}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};