import React from 'react';
import { FiMail, FiInfo, FiPaperclip } from 'react-icons/fi';

/**
 * EmailTemplate Component
 * 
 * Renders the Email-specific message template with rich formatting options,
 * subject line management, and attachment support.
 * 
 * @param {Object} props
 * @param {string} props.content - Current message content
 * @param {string} props.subject - Email subject line
 * @param {Function} props.onChange - Callback when content changes
 * @param {Function} props.onSubjectChange - Callback when subject changes
 * @param {Object} props.selectedSchool - Selected school for variable interpolation
 * @param {Object} props.user - User object for sender information
 */
const EmailTemplate = ({ 
  content = '', 
  subject = '', 
  onChange, 
  onSubjectChange, 
  selectedSchool, 
  user 
}) => {
  const availableVariables = [
    { key: '{{parentName}}', description: 'Parent/Guardian full name' },
    { key: '{{learnerName}}', description: 'Student full name' },
    { key: '{{schoolName}}', description: 'School name' },
    { key: '{{schoolWebsite}}', description: 'School website URL' },
    { key: '{{grade}}', description: 'Student grade/class' },
    { key: '{{academicYear}}', description: 'Current academic year' },
    { key: '{{portalUrl}}', description: 'Parent portal URL' },
    { key: '{{contactNumber}}', description: 'School contact number' },
    { key: '{{contactEmail}}', description: 'School contact email' },
    { key: '{{principalName}}', description: 'Principal name' },
    { key: '{{enrollmentDate}}', description: 'Enrollment date' },
    { key: '{{fees}}', description: 'School fees information' }
  ];

  const defaultSubject = 'Welcome to {{schoolName}} - {{learnerName}} Enrollment Confirmation';

  const defaultTemplate = `Dear {{parentName}},

We are delighted to welcome {{learnerName}} to {{schoolName}} for the {{academicYear}} academic year.

ENROLLMENT DETAILS:
• Student: {{learnerName}}
• Grade: {{grade}}
• Academic Year: {{academicYear}}
• Enrollment Date: {{enrollmentDate}}

NEXT STEPS:
1. Access your Parent Portal at {{portalUrl}}
2. Complete any outstanding documentation
3. Review the fee structure: {{fees}}
4. Attend the orientation session (details to follow)

CONTACT INFORMATION:
• School Website: {{schoolWebsite}}
• Phone: {{contactNumber}}
• Email: {{contactEmail}}

We look forward to partnering with you in {{learnerName}}'s educational journey. Our dedicated team is here to support both you and your child throughout the academic year.

Should you have any questions or require assistance, please don't hesitate to contact us.

Warm regards,

{{principalName}}
Principal
{{schoolName}}

---
This is an automated message from {{schoolName}}. Please do not reply to this email.
For inquiries, contact us at {{contactEmail}} or {{contactNumber}}.`;

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (typeof onChange === 'function') {
      onChange('email', newContent);
    }
  };

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    if (typeof onSubjectChange === 'function') {
      onSubjectChange(newSubject);
    }
  };

  const insertVariable = (variable, target = 'content') => {
    const elementId = target === 'subject' ? 'email-subject' : 'email-content';
    const element = document.getElementById(elementId);
    
    if (element) {
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const currentValue = target === 'subject' ? subject : content;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      
      if (target === 'subject' && typeof onSubjectChange === 'function') {
        onSubjectChange(newValue);
      } else if (target === 'content' && typeof onChange === 'function') {
        onChange('email', newValue);
      }
      
      // Restore cursor position
      setTimeout(() => {
        element.focus();
        element.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const useDefaultTemplate = () => {
    if (typeof onChange === 'function') {
      onChange('email', defaultTemplate);
    }
    if (typeof onSubjectChange === 'function') {
      onSubjectChange(defaultSubject);
    }
  };

  const getWordCount = () => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getEstimatedReadTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(getWordCount() / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FiMail className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Email Message</h3>
        </div>
        <button
          onClick={useDefaultTemplate}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Use Default Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Email Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={handleSubjectChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter email subject..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Keep subject lines under 50 characters for better mobile display
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              id="email-content"
              rows={16}
              value={content}
              onChange={handleContentChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm font-mono"
              placeholder="Enter your email message here..."
            />
            
            {/* Content Statistics */}
            <div className="flex justify-between text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
              <span>Words: {getWordCount()}</span>
              <span>Characters: {content.length}</span>
              <span>Est. read time: {getEstimatedReadTime()} min</span>
            </div>
          </div>

          {/* Email Features Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <div className="flex">
              <FiInfo className="h-5 w-5 text-purple-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-purple-800">
                  Email Features
                </h4>
                <div className="mt-1 text-sm text-purple-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Rich formatting and HTML support</li>
                    <li>Attachment capabilities</li>
                    <li>Detailed content and documentation</li>
                    <li>Professional communication channel</li>
                    <li>Delivery and read receipts available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Attachment Section */}
          <div className="border border-gray-200 rounded-md p-3">
            <div className="flex items-center mb-2">
              <FiPaperclip className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Attachments</span>
            </div>
            <div className="text-sm text-gray-500">
              <p>Attachments can be added during the sending process. Common attachments include:</p>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>School handbook and policies</li>
                <li>Fee structure documents</li>
                <li>Enrollment forms</li>
                <li>Academic calendar</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Variables Panel */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Available Variables
          </label>
          
          <div className="text-xs text-gray-500 mb-2">
            Insert into:
            <button 
              onClick={() => document.getElementById('email-subject').focus()}
              className="ml-2 text-purple-600 hover:text-purple-700"
            >
              Subject
            </button>
            <span className="mx-1">|</span>
            <button 
              onClick={() => document.getElementById('email-content').focus()}
              className="text-purple-600 hover:text-purple-700"
            >
              Content
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {availableVariables.map((variable, index) => (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => insertVariable(variable.key, 'content')}
                    className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-purple-300 transition-colors"
                  >
                    <div className="font-mono text-purple-600 font-medium">
                      {variable.key}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {variable.description}
                    </div>
                  </button>
                  <button
                    onClick={() => insertVariable(variable.key, 'subject')}
                    className="w-full text-xs text-purple-600 hover:text-purple-700 py-1"
                  >
                    Insert in subject
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {(content || subject) && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h4>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Email Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="text-sm text-gray-500">Subject:</div>
                <div className="font-medium text-gray-900">
                  {subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                    const previews = {
                      schoolName: selectedSchool?.name || 'Sample School',
                      learnerName: 'Emma Smith'
                    };
                    return previews[key] || match;
                  }) || 'No subject'}
                </div>
              </div>
              
              {/* Email Body */}
              <div className="p-4">
                <div className="whitespace-pre-wrap text-sm text-gray-900">
                  {content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                    const previews = {
                      parentName: 'Mr. and Mrs. Smith',
                      learnerName: 'Emma Smith',
                      schoolName: selectedSchool?.name || 'Sample School',
                      schoolWebsite: 'www.sampleschool.edu',
                      grade: 'Grade 9',
                      academicYear: '2025-2026',
                      portalUrl: 'portal.sampleschool.edu',
                      contactNumber: '+27 11 123 4567',
                      contactEmail: 'info@sampleschool.edu',
                      principalName: 'Dr. Jane Johnson',
                      enrollmentDate: '15 January 2025',
                      fees: 'R12,500 per term'
                    };
                    return previews[key] || match;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplate;

