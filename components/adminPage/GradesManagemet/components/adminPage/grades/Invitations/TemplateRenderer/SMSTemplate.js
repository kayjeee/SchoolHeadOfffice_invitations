import React from 'react';
import { FiSmartphone, FiAlertTriangle, FiInfo } from 'react-icons/fi';

/**
 * SMSTemplate Component
 * 
 * Renders the SMS-specific message template with strict character limits,
 * cost considerations, and optimized formatting for mobile delivery.
 * 
 * @param {Object} props
 * @param {string} props.content - Current message content
 * @param {Function} props.onChange - Callback when content changes
 * @param {Object} props.selectedSchool - Selected school for variable interpolation
 * @param {Object} props.user - User object for sender information
 */
const SMSTemplate = ({ content = '', onChange, selectedSchool, user }) => {
  const CHARACTER_LIMIT = 160; // Standard SMS limit
  const EXTENDED_LIMIT = 306; // Concatenated SMS limit (2 messages)
  const COST_PER_SMS = 0.12; // Example cost per SMS

  const availableVariables = [
    { key: '{{parentName}}', description: 'Parent name', length: 10 },
    { key: '{{learnerName}}', description: 'Student name', length: 12 },
    { key: '{{schoolName}}', description: 'School name', length: 15 },
    { key: '{{grade}}', description: 'Student grade', length: 8 },
    { key: '{{contactNumber}}', description: 'School contact', length: 15 }
  ];

  const defaultTemplate = `Hi {{parentName}}, {{learnerName}} is enrolled at {{schoolName}} for {{grade}}. Welcome! Contact: {{contactNumber}}`;

  const shortTemplate = `{{learnerName}} enrolled at {{schoolName}}. Welcome! {{contactNumber}}`;

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (typeof onChange === 'function') {
      onChange('sms', newContent);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('sms-content');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      
      if (typeof onChange === 'function') {
        onChange('sms', newContent);
      }
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const useDefaultTemplate = () => {
    if (typeof onChange === 'function') {
      onChange('sms', defaultTemplate);
    }
  };

  const useShortTemplate = () => {
    if (typeof onChange === 'function') {
      onChange('sms', shortTemplate);
    }
  };

  const getCharacterCountColor = () => {
    if (content.length > EXTENDED_LIMIT) return 'text-red-600';
    if (content.length > CHARACTER_LIMIT) return 'text-amber-600';
    return 'text-gray-500';
  };

  const getCharacterCountBackground = () => {
    if (content.length > EXTENDED_LIMIT) return 'bg-red-50';
    if (content.length > CHARACTER_LIMIT) return 'bg-amber-50';
    return 'bg-gray-50';
  };

  const getSMSCount = () => {
    if (content.length === 0) return 0;
    if (content.length <= CHARACTER_LIMIT) return 1;
    if (content.length <= EXTENDED_LIMIT) return 2;
    return Math.ceil(content.length / 153); // 153 chars per SMS in concatenated messages
  };

  const getEstimatedCost = () => {
    return (getSMSCount() * COST_PER_SMS).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FiSmartphone className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">SMS Message</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={useShortTemplate}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Short Template
          </button>
          <button
            onClick={useDefaultTemplate}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Default Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message Content */}
        <div className="lg:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Message Content
          </label>
          <textarea
            id="sms-content"
            rows={6}
            value={content}
            onChange={handleContentChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your SMS message here..."
          />
          
          {/* Character Count and Cost */}
          <div className={`flex justify-between text-xs p-2 rounded ${getCharacterCountBackground()}`}>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                SMS Count: {getSMSCount()}
              </span>
              <span className="text-gray-600">
                Est. Cost: R{getEstimatedCost()}
              </span>
            </div>
            <span className={getCharacterCountColor()}>
              {content.length}/{CHARACTER_LIMIT} characters
              {content.length > CHARACTER_LIMIT && content.length <= EXTENDED_LIMIT && (
                <span className="ml-1">(2 SMS)</span>
              )}
              {content.length > EXTENDED_LIMIT && (
                <span className="ml-1 font-semibold">(Multiple SMS)</span>
              )}
            </span>
          </div>

          {/* SMS Warnings */}
          {content.length > CHARACTER_LIMIT && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex">
                <FiAlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-amber-800">
                    Multiple SMS Warning
                  </h4>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>
                      Your message will be sent as {getSMSCount()} SMS messages, 
                      costing approximately R{getEstimatedCost()}. Consider shortening for cost efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {content.length > EXTENDED_LIMIT && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <FiAlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Message Too Long
                  </h4>
                  <div className="mt-1 text-sm text-red-700">
                    <p>
                      Very long SMS messages may not be delivered properly on all devices. 
                      Consider using WhatsApp or Email for longer content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SMS Best Practices */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <FiInfo className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  SMS Best Practices
                </h4>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Keep messages under 160 characters when possible</li>
                    <li>Include essential information only</li>
                    <li>Use abbreviations sparingly</li>
                    <li>Always include contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variables Panel */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Available Variables
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {availableVariables.map((variable, index) => (
                <button
                  key={index}
                  onClick={() => insertVariable(variable.key)}
                  className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-mono text-blue-600 font-medium">
                    {variable.key}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {variable.description} (~{variable.length} chars)
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Click any variable to insert it. Character estimates help with planning.
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {content && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">SMS Preview</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-sm">
              <div className="text-xs text-gray-500 mb-2">SMS Message</div>
              <div className="text-sm text-gray-900">
                {content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                  // Simple preview replacement
                  const previews = {
                    parentName: 'J. Smith',
                    learnerName: 'Emma',
                    schoolName: selectedSchool?.name || 'Sample School',
                    grade: 'Grade 9',
                    contactNumber: '+27111234567'
                  };
                  return previews[key] || match;
                })}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {getSMSCount()} SMS • R{getEstimatedCost()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSTemplate;

