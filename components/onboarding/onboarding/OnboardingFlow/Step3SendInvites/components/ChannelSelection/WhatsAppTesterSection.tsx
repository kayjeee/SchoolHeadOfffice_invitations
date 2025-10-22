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
  // ==================== UTILITY FUNCTIONS ====================
  const formatPhoneNumber = (value: string): string => {
    return value.replace(/[^\d+]/g, '');
  };

  const getMessageContent = (): string => messageContent || '';

  const getWordCount = (): number => {
    return getMessageContent().split(/\s+/).filter(Boolean).length;
  };
  const getCharacterCount = (): number => {
    return getMessageContent().length;
  };

  const isCharacterLimitExceeded = (): boolean => {
    return getCharacterCount() > 4000;
  };

  const isTestButtonDisabled = (): boolean => {
    return isSending || !testPhoneNumber.trim() || !getMessageContent().trim();
  };

  const isBulkButtonDisabled = (): boolean => {
    return isSendingBulk || !canSendBulk || !getMessageContent().trim();
  };

  // ==================== EVENT HANDLERS ====================
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPhoneNumberChange(formatPhoneNumber(e.target.value));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e.target.value);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(getMessageContent());
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-4">
      {/* Header Section */}
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
        {/* Phone Number Input Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Send size={16} className="mr-2" />
            Test Phone Number
          </h4>
          
          <div className="space-y-3">
            <input
              type="tel"
              value={testPhoneNumber}
              onChange={handlePhoneChange}
              placeholder="+27123456789"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black font-medium ${
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

        {/* Message Editor Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Edit3 size={16} className="mr-2" />
              Message Content
            </h4>
            <button
              onClick={handleCopyMessage}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Copy message to clipboard"
            >
              <Copy size={14} className="mr-1" />
              Copy
            </button>
          </div>
          
          <textarea
            value={getMessageContent()}
            onChange={handleMessageChange}
            rows={8}
            placeholder="Enter your WhatsApp message here..."
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black ${
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
            <span>{getWordCount()} words</span>
            <span className={isCharacterLimitExceeded() ? 'text-orange-600 font-medium' : ''}>
              {getCharacterCount()}/4096 characters
            </span>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Test Send Button */}
          <button
            onClick={onSendTest}
            disabled={isTestButtonDisabled()}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm hover:shadow-md"
            title={isTestButtonDisabled() ? 'Enter phone number and message to test' : 'Send test message'}
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
            disabled={isBulkButtonDisabled()}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm hover:shadow-md"
            title={
              !canSendBulk 
                ? 'No WhatsApp contacts available' 
                : isBulkButtonDisabled() 
                ? 'Enter message to send bulk' 
                : `Send to ${totalRecipients} learners`
            }
          >
            {isSendingBulk ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Sending Bulk...
              </>
            ) : (
              <>
                <Users size={16} className="mr-2" />
                Send to {totalRecipients} Learner{totalRecipients !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>

        {/* Recipient Summary Section */}
        {canSendBulk && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 flex items-center">
                  <Users size={16} className="mr-2" />
                  Ready for Bulk Send
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  This message will be sent to {totalRecipients} learner{totalRecipients !== 1 ? 's' : ''} with WhatsApp numbers
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-blue-800">{totalRecipients}</div>
                <div className="text-xs text-blue-600 uppercase">Recipients</div>
              </div>
            </div>
          </div>
        )}

        {/* No Recipients Warning */}
        {!canSendBulk && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-600 mr-2" size={16} />
              <div>
                <h4 className="font-medium text-yellow-800">No WhatsApp Contacts</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  No learners with valid WhatsApp numbers were found. Bulk send is disabled.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Result Section */}
        {testResult && (
          <div className={`border rounded-lg p-4 ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <span className={`font-semibold ${
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
            
            {testResult.error && (
              <p className="text-sm text-red-600 mt-2 font-medium">
                Error details: {testResult.error}
              </p>
            )}
            
            {testResult.success && testResult.messageId && (
              <div className="mt-2 p-2 bg-green-100 rounded border border-green-200">
                <p className="text-xs text-green-700">
                  <span className="font-medium">Message ID:</span> {testResult.messageId}
                </p>
              </div>
            )}
            
            {testResult.bulkResult && (
              <div className="mt-3 p-3 bg-white rounded border border-green-300">
                <p className="text-sm font-semibold text-green-800 mb-2">Bulk Send Results:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-700">
                      {testResult.bulkResult.sentCount}
                    </div>
                    <div className="text-xs text-green-600">Sent</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-700">
                      {testResult.bulkResult.failedCount}
                    </div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-700">
                      {testResult.bulkResult.totalCount}
                    </div>
                    <div className="text-xs text-blue-600">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};