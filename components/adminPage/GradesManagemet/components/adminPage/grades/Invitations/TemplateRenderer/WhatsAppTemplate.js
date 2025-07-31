import React from 'react';
import { FiMessageSquare, FiInfo } from 'react-icons/fi';

/**
 * WhatsAppTemplate Component
 * 
 * Renders the WhatsApp-specific message template with appropriate formatting,
 * character limits, and variable interpolation support.
 * 
 * @param {Object} props
 * @param {string} props.content - Current message content
 * @param {Function} props.onChange - Callback when content changes
 * @param {Object} props.selectedSchool - Selected school for variable interpolation
 * @param {Object} props.user - User object for sender information
 */
const WhatsAppTemplate = ({ content = '', onChange, selectedSchool, user }) => {
  const CHARACTER_LIMIT = 4096; // WhatsApp message limit
  const RECOMMENDED_LENGTH = 300; // Recommended length for better engagement

  const availableVariables = [
    { key: '{{parentName}}', description: 'Parent/Guardian name' },
    { key: '{{learnerName}}', description: 'Student name' },
    { key: '{{schoolName}}', description: 'School name' },
    { key: '{{schoolWebsite}}', description: 'School website URL' },
    { key: '{{grade}}', description: 'Student grade/class' },
    { key: '{{academicYear}}', description: 'Current academic year' },
    { key: '{{portalUrl}}', description: 'Parent portal URL' },
    { key: '{{contactNumber}}', description: 'School contact number' }
  ];

  const defaultTemplate = `Hello {{parentName}}! 👋

Your child {{learnerName}} has been successfully enrolled at {{schoolName}} for the {{academicYear}} academic year.

🎓 Grade: {{grade}}
📱 Parent Portal: {{portalUrl}}
📞 Contact: {{contactNumber}}

Welcome to our school community! We're excited to have {{learnerName}} join us.

Best regards,
{{schoolName}} Team`;

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (typeof onChange === 'function') {
      onChange('whatsapp', newContent);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('whatsapp-content');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      
      if (typeof onChange === 'function') {
        onChange('whatsapp', newContent);
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
      onChange('whatsapp', defaultTemplate);
    }
  };

  const getCharacterCountColor = () => {
    if (content.length > CHARACTER_LIMIT) return 'text-red-600';
    if (content.length > RECOMMENDED_LENGTH) return 'text-amber-600';
    return 'text-gray-500';
  };

  const getCharacterCountBackground = () => {
    if (content.length > CHARACTER_LIMIT) return 'bg-red-50';
    if (content.length > RECOMMENDED_LENGTH) return 'bg-amber-50';
    return 'bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FiMessageSquare className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">WhatsApp Message</h3>
        </div>
        <button
          onClick={useDefaultTemplate}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Use Default Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message Content */}
        <div className="lg:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Message Content
          </label>
          <textarea
            id="whatsapp-content"
            rows={12}
            value={content}
            onChange={handleContentChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm font-mono"
            placeholder="Enter your WhatsApp message here..."
          />
          
          {/* Character Count */}
          <div className={`flex justify-between text-xs p-2 rounded ${getCharacterCountBackground()}`}>
            <span className="text-gray-600">
              💡 Tip: Keep messages concise for better engagement
            </span>
            <span className={getCharacterCountColor()}>
              {content.length}/{CHARACTER_LIMIT} characters
              {content.length > RECOMMENDED_LENGTH && content.length <= CHARACTER_LIMIT && (
                <span className="ml-1">(Consider shortening)</span>
              )}
              {content.length > CHARACTER_LIMIT && (
                <span className="ml-1 font-semibold">(Too long!)</span>
              )}
            </span>
          </div>

          {/* WhatsApp Features Info */}
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <FiInfo className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">
                  WhatsApp Features
                </h4>
                <div className="mt-1 text-sm text-green-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Supports emojis and formatting</li>
                    <li>Instant delivery notifications</li>
                    <li>High open rates (98%+)</li>
                    <li>Two-way communication possible</li>
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
                  className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-green-300 transition-colors"
                >
                  <div className="font-mono text-green-600 font-medium">
                    {variable.key}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {variable.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Click any variable to insert it at your cursor position.
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {content && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                {content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                  // Simple preview replacement
                  const previews = {
                    parentName: 'John Smith',
                    learnerName: 'Emma Smith',
                    schoolName: selectedSchool?.name || 'Sample School',
                    schoolWebsite: 'www.sampleschool.edu',
                    grade: 'Grade 9',
                    academicYear: '2025-2026',
                    portalUrl: 'portal.sampleschool.edu',
                    contactNumber: '+27 11 123 4567'
                  };
                  return previews[key] || match;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplate;

