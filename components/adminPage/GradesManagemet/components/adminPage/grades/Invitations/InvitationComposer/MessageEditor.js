import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileEdit, 
  Eye, 
  Video,
  Settings,
  Send,
  FileText
} from 'lucide-react';

// Mock WhatsApp Message Tester component
const WhatsAppMessageTester = ({ selectedGrade, schoolName, testMessage, onMessageUpdate }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <MessageCircle className="mr-2" size={18} />
        Test WhatsApp Message
      </h3>
      
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+27 12 345 6789"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Preview
            </label>
            <div className="bg-white border rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="text-sm whitespace-pre-wrap">{testMessage}</div>
            </div>
          </div>
          
          <button
            disabled={!phoneNumber.trim() || !testMessage.trim()}
            className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="mr-2" />
            Send Test Message
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageEditor = ({ 
  selectedGrade,
  schoolName,
  subject = '', 
  message = '', 
  template = null, 
  onSubjectChange,
  onMessageChange, 
  onTemplateChange,
  onBack,
  onNext,
  onShowVideoRecorder,
  onShowTemplateManager,
  errors = {}
}) => {
  const [templates] = useState([
    { 
      id: 'welcome', 
      name: 'Welcome Template', 
      subject: 'Welcome to Our School Parent Portal', 
      content: `🏫 Welcome to ${schoolName || 'Our School'}!\n\nDear {{parent_name}},\n\nWe are excited to welcome you to our school community. Please join our parent portal to stay connected with your child's education journey.\n\nBest regards,\nThe School Team` 
    },
    { 
      id: 'event', 
      name: 'Event Invitation', 
      subject: 'You\'re Invited - School Event', 
      content: `🎉 Special Invitation from ${schoolName || 'Our School'}\n\nDear {{parent_name}},\n\nYou are cordially invited to our upcoming school event. Join us for an exciting day of activities and community building.\n\nDate: {{event_date}}\nTime: {{event_time}}\nVenue: School Premises\n\nWe look forward to seeing you there!\n\nWarm regards,\nThe School Team` 
    },
    {
      id: 'whatsapp_portal',
      name: 'WhatsApp Portal Invitation',
      subject: 'Join Our Parent WhatsApp Portal',
      content: `🏫 ${schoolName || 'Our School'} Parent Portal Invitation\n\nDear {{parent_name}},\n\nYou're invited to join our secure parent communication portal via WhatsApp.\n\n✅ Get real-time updates about {{grade_name}}\n✅ Receive important announcements\n✅ Connect with teachers directly\n✅ Access school resources\n\nClick the link below to join:\n{{portal_link}}\n\nFor support, contact us at {{school_contact}}\n\nBest wishes,\n${schoolName || 'School'} Admin Team`
    }
  ]);

  const [activeTab, setActiveTab] = useState('compose');
  const [testMessage, setTestMessage] = useState('');

  // Initialize message template based on selected grade and school
  useEffect(() => {
    if (selectedGrade && schoolName && !message) {
      const defaultTemplate = templates.find(t => t.id === 'whatsapp_portal');
      if (defaultTemplate) {
        const populatedMessage = defaultTemplate.content
          .replace(/{{parent_name}}/g, 'Parent')
          .replace(/{{grade_name}}/g, selectedGrade.name)
          .replace(/{{portal_link}}/g, 'https://portal.school.com/join')
          .replace(/{{school_contact}}/g, 'support@school.com');
        
        setTestMessage(populatedMessage);
        onMessageChange?.(populatedMessage);
        onSubjectChange?.(defaultTemplate.subject);
        onTemplateChange?.(defaultTemplate);
      }
    }
  }, [selectedGrade, schoolName, message, templates, onMessageChange, onSubjectChange, onTemplateChange]);

  const handleTemplateSelect = (selectedTemplate) => {
    onTemplateChange?.(selectedTemplate);
    if (selectedTemplate) {
      let populatedSubject = selectedTemplate.subject;
      let populatedContent = selectedTemplate.content;
      
      // Replace template variables with actual values
      if (selectedGrade) {
        populatedContent = populatedContent.replace(/{{grade_name}}/g, selectedGrade.name);
      }
      if (schoolName) {
        populatedContent = populatedContent.replace(new RegExp(schoolName || 'Our School', 'g'), schoolName);
        populatedSubject = populatedSubject.replace(/Our School/g, schoolName);
      }
      
      onSubjectChange?.(populatedSubject);
      onMessageChange?.(populatedContent);
      setTestMessage(populatedContent);
    }
  };

  const handleMessageChange = (value) => {
    onMessageChange?.(value);
    setTestMessage(value);
  };

  const tabs = [
    { id: 'compose', name: 'Compose Message', icon: <FileText size={16} /> },
    { id: 'test', name: 'Test WhatsApp', icon: <MessageCircle size={16} /> },
    { id: 'preview', name: 'Preview', icon: <Eye size={16} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <MessageCircle className="mr-2" size={24} />
          Message for {selectedGrade?.name || 'Selected Grade'}
        </h2>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => onShowVideoRecorder?.('messaging')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Video size={16} className="mr-2" />
            Record Video
          </button>
          
          <button 
            onClick={() => onShowTemplateManager?.()}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Settings size={16} className="mr-2" />
            Manage Templates
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <FileEdit className="mr-2" size={18} />
                Compose Your Message
              </h3>
              <p className="text-sm text-gray-500">Create or select a template for your invitation</p>
            </div>

            <div className="space-y-4">
              {/* Template Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template
                </label>
                <select
                  value={template?.id || ''}
                  onChange={(e) => {
                    const selected = templates.find(t => t.id === e.target.value);
                    handleTemplateSelect(selected || null);
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                >
                  <option value="">Select a template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => onSubjectChange?.(e.target.value)}
                  placeholder="Enter message subject..."
                  className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.subject ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={200}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {subject.length}/200 characters
                </p>
              </div>

              {/* Message Content */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content *
                </label>
                <textarea
                  id="message"
                  rows={12}
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Compose your invitation message..."
                  className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.message ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{message.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{message.length} characters</span>
                </div>
              </div>
            </div>

            {/* Message Guidelines */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                <Settings className="mr-2" size={14} />
                Message Guidelines
              </h4>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Keep subject lines clear and under 50 characters</li>
                <li>Personalize with the recipient's name using {'{parent_name}'}</li>
                <li>Include school name and grade information</li>
                <li>Add a clear call-to-action</li>
                <li>Double-check all dates, times, and contact information</li>
                <li>Test the message before bulk sending</li>
              </ul>
            </div>
          </div>
        )}

        {/* Test WhatsApp Tab */}
        {activeTab === 'test' && (
          <div>
            <WhatsAppMessageTester 
              selectedGrade={selectedGrade} 
              schoolName={schoolName}
              testMessage={testMessage}
              onMessageUpdate={handleMessageChange}
            />
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Eye className="mr-2" size={18} />
              Message Preview
            </h3>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Subject:</h4>
                <p className="text-sm text-gray-900 font-medium">{subject || 'No subject entered'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Message:</h4>
                <div className="bg-white border rounded p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {message || 'No message content entered'}
                </div>
              </div>
            </div>

            {selectedGrade && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  This message will be sent to <strong>{selectedGrade.parentCount || 0} parents</strong> in {selectedGrade.name}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button 
          onClick={onBack} 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Grade Selection
        </button>
        
        <button 
          onClick={onNext} 
          disabled={!subject.trim() || !message.trim()}
          className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} className="mr-2" />
          Next: Bulk Send
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default MessageEditor;