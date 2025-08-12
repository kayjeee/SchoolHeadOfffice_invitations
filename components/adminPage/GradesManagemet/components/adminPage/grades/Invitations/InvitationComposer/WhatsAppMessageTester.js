import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Loader, 
  Video, 
  Phone,
  CheckCircle,
  AlertCircle,
  Copy,
  Edit3,
  Smartphone
} from 'lucide-react';
import WhatsAppBusinessService from '../services/WhatsappBusinessService';

const WhatsAppMessageTester = ({ selectedGrade, schoolName, testMessage, onMessageUpdate }) => {
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [messageContent, setMessageContent] = useState(testMessage || '');
  const [showPreview, setShowPreview] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  // Safely get content for display and calculations
  const getMessageContent = () => messageContent || '';

  // Update message content when testMessage prop changes
  useEffect(() => {
    if (testMessage !== undefined && testMessage !== messageContent) {
      setMessageContent(testMessage);
    }
  }, [testMessage]);

  // Default message template
  useEffect(() => {
    if (!getMessageContent() && selectedGrade && schoolName) {
      const defaultMessage = `🏫 ${schoolName} Parent Portal Invitation

Dear Parent,

You're invited to join our secure parent communication portal for ${selectedGrade.name}.

✅ Get real-time updates about your child's progress
✅ Receive important announcements instantly  
✅ Connect with teachers directly
✅ Access school resources and calendar

Join now: https://portal.${schoolName.toLowerCase().replace(/\s+/g, '')}.com/join

For support, WhatsApp us at this number or email support@${schoolName.toLowerCase().replace(/\s+/g, '')}.com

Best wishes,
${schoolName} Admin Team`;
      
      setMessageContent(defaultMessage);
      onMessageUpdate?.(defaultMessage);
    }
  }, [selectedGrade, schoolName, messageContent, onMessageUpdate]);

  const validateInputs = () => {
    const errors = {};
    const content = getMessageContent();
    
    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!testPhoneNumber.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(testPhoneNumber.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number with country code';
    }
    
    // Validate message content
    if (!content.trim()) {
      errors.message = 'Message content is required';
    } else if (content.length > 4096) {
      errors.message = 'Message is too long (max 4096 characters)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendTest = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSending(true);
    setTestResult(null);

    try {
      const result = await WhatsAppBusinessService.sendTestMessage({
        to: testPhoneNumber.replace(/\s+/g, ''),
        message: getMessageContent(),
        gradeId: selectedGrade?.id,
        schoolName: schoolName
      });

      setTestResult({
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        message: 'Test message sent successfully! Check your WhatsApp.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        message: 'Failed to send test message. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageChange = (value) => {
    setMessageContent(value);
    onMessageUpdate?.(value);
    
    // Clear message validation error when user starts typing
    if (validationErrors.message) {
      setValidationErrors(prev => ({ ...prev, message: null }));
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(getMessageContent());
    // You could add a toast notification here
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    return value.replace(/[^\d+]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-full">
          <MessageCircle className="text-green-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Message Tester</h3>
          <p className="text-sm text-gray-600">
            Test your message before sending to all parents in {selectedGrade?.name || 'selected grade'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Editor */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Edit3 size={16} className="mr-2" />
              Message Content
            </h4>
            <button
              onClick={copyMessage}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Copy size={14} className="mr-1" />
              Copy
            </button>
          </div>
          
          <textarea
            value={getMessageContent()}
            onChange={(e) => handleMessageChange(e.target.value)}
            rows={12}
            placeholder="Enter your WhatsApp message here..."
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

        {/* Test Controls & Preview */}
        <div className="space-y-4">
          {/* Phone Input */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Phone size={16} className="mr-2" />
              Test Phone Number
            </h4>
            
            <div className="space-y-3">
              <div>
                <input
                  type="tel"
                  value={testPhoneNumber}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setTestPhoneNumber(formatted);
                    if (validationErrors.phone) {
                      setValidationErrors(prev => ({ ...prev, phone: null }));
                    }
                  }}
                  placeholder="+27123456789"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {validationErrors.phone}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Include country code (e.g., +27 for South Africa)
                </p>
              </div>

              <button
                onClick={handleSendTest}
                disabled={isSending || !testPhoneNumber.trim() || !getMessageContent().trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </div>

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
              
              {testResult.error && (
                <p className="text-xs text-red-600 mt-1">
                  Error: {testResult.error}
                </p>
              )}
            </div>
          )}

          {/* WhatsApp Preview */}
          {showPreview && getMessageContent() && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Smartphone size={16} className="mr-2" />
                  WhatsApp Preview
                </h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Hide
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {schoolName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{schoolName || 'School'}</p>
                      <p className="text-xs text-gray-500">now</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {getMessageContent()}
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Testing Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use your own phone number to test the message format and delivery</li>
          <li>• Check that all links work correctly and are accessible</li>
          <li>• Verify that the message displays properly on mobile devices</li>
          <li>• Test different phone number formats to ensure compatibility</li>
          <li>• Make sure the message tone is appropriate for your school community</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppMessageTester;