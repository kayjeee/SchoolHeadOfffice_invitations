import React, { useState } from 'react';
import { FiMail, FiSend, FiUsers, FiEye, FiCalendar, FiClock, FiMessageSquare, FiSmartphone, FiCheckCircle } from 'react-icons/fi';

// Channel Selector Component
function ChannelSelector({ selectedChannels, onChange }) {
  const channels = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      icon: FiMessageSquare, 
      recommended: true,
      description: 'Instant delivery, high open rates'
    },
    { 
      id: 'sms', 
      name: 'SMS', 
      icon: FiSmartphone, 
      recommended: false,
      description: 'Direct to mobile, reliable'
    },
    { 
      id: 'email', 
      name: 'Email', 
      icon: FiMail, 
      recommended: false,
      description: 'Detailed content, attachments'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Delivery Channels
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map(channel => {
          const IconComponent = channel.icon;
          const isSelected = selectedChannels.includes(channel.id);
          
          return (
            <div
              key={channel.id}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => onChange(channel.id)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onChange(channel.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <IconComponent className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-900">
                      {channel.name}
                    </span>
                    {channel.recommended && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {channel.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedChannels.length === 0 && (
        <p className="text-sm text-red-600">Please select at least one delivery channel.</p>
      )}
    </div>
  );
}

// Message Content Component for different channels
function MessageContentEditor({ channels, content, onChange }) {
  const [activeTab, setActiveTab] = useState(channels[0] || 'email');

  if (channels.length === 0) return null;

  const getPlaceholder = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return `Hello {{parentName}}! 👋

Your child {{learnerName}} has been enrolled at {{schoolName}}.

Welcome to our school community! 🎓

Best regards,
{{schoolName}} Team`;
      case 'sms':
        return `Hi {{parentName}}, {{learnerName}} is enrolled at {{schoolName}}. Welcome! For more info visit: {{schoolWebsite}}`;
      case 'email':
        return `Dear {{parentName}},

We are pleased to inform you that {{learnerName}} has been successfully enrolled at {{schoolName}}.

Welcome to our school community!

Best regards,
{{schoolName}} Administration`;
      default:
        return 'Enter your message content here...';
    }
  };

  const getCharacterLimit = (channel) => {
    switch (channel) {
      case 'sms': return 160;
      case 'whatsapp': return 4096;
      case 'email': return null;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => setActiveTab(channel)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === channel
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {channel} Content
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Message
        </label>
        <textarea
          rows={activeTab === 'sms' ? 4 : 8}
          value={content[activeTab] || ''}
          onChange={(e) => onChange(activeTab, e.target.value)}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={getPlaceholder(activeTab)}
        />
        
        {getCharacterLimit(activeTab) && (
          <div className="flex justify-between text-xs">
            {/* The fix is here: Render as a string literal instead of trying to evaluate variables */}
            <span className="text-gray-500">
              Available variables: {'{{parentName}}, {{learnerName}}, {{schoolName}}, {{schoolWebsite}}'}
            </span>
            <span className={`${
              (content[activeTab] || '').length > getCharacterLimit(activeTab) 
                ? 'text-red-600' 
                : 'text-gray-500'
            }`}>
              {(content[activeTab] || '').length}/{getCharacterLimit(activeTab)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const InvitationComposer = () => {
  const [composerData, setComposerData] = useState({
    template: '',
    recipients: 'all',
    customRecipients: [],
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: '',
    subject: '',
    channels: ['whatsapp'], // Default to WhatsApp
    content: {},
    includeAttachments: false,
    priority: 'normal'
  });

  const [selectedLearners, setSelectedLearners] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Mock data
  const templates = [
    { 
      id: 1, 
      name: 'Welcome New Learner', 
      subject: 'Welcome to {{schoolName}}',
      channels: ['whatsapp', 'email'],
      content: {
        whatsapp: 'Welcome {{parentName}}! 👋 {{learnerName}} is now enrolled at {{schoolName}}. We\'re excited to have you!',
        email: 'Dear {{parentName}},\n\nWelcome to {{schoolName}}! We are delighted to have {{learnerName}} join our school community.\n\nBest regards,\n{{schoolName}} Team'
      }
    },
    { 
      id: 2, 
      name: 'Grade Assignment', 
      subject: 'Grade Assignment - {{learnerName}}',
      channels: ['sms', 'email'],
      content: {
        sms: 'Hi {{parentName}}, {{learnerName}} has been assigned to Grade {{grade}} at {{schoolName}}.',
        email: 'Dear {{parentName}},\n\nWe are pleased to inform you that {{learnerName}} has been assigned to Grade {{grade}}.\n\nBest regards,\n{{schoolName}} Administration'
      }
    },
    { 
      id: 3, 
      name: 'Parent Portal Access', 
      subject: 'Your Parent Portal Access Details',
      channels: ['whatsapp', 'email'],
      content: {
        whatsapp: 'Hi {{parentName}}! 📱 Your parent portal is ready. Login: {{portalUrl}} Username: {{username}}',
        email: 'Dear {{parentName}},\n\nYour parent portal access is now ready.\n\nLogin URL: {{portalUrl}}\nUsername: {{username}}\n\nBest regards,\n{{schoolName}} IT Team'
      }
    }
  ];

  const mockLearners = [
    { id: 1, name: 'John Smith', parentName: 'Mary Smith', parentEmail: 'mary.smith@email.com', parentPhone: '+27821234567', grade: 'Grade 1' },
    { id: 2, name: 'Sarah Johnson', parentName: 'David Johnson', parentEmail: 'david.johnson@email.com', parentPhone: '+27821234568', grade: 'Grade 1' },
    { id: 3, name: 'Michael Brown', parentName: 'Lisa Brown', parentEmail: 'lisa.brown@email.com', parentPhone: '+27821234569', grade: 'Grade 2' },
    { id: 4, name: 'Emma Davis', parentName: 'Robert Davis', parentEmail: 'robert.davis@email.com', parentPhone: '+27821234570', grade: 'Grade 2' },
    { id: 5, name: 'James Wilson', parentName: 'Jennifer Wilson', parentEmail: 'jennifer.wilson@email.com', parentPhone: '+27821234571', grade: 'Grade 3' }
  ];

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setComposerData({
        ...composerData,
        template: templateId,
        subject: template.subject,
        channels: template.channels,
        content: template.content
      });
    } else {
      setComposerData({
        ...composerData,
        template: '',
        subject: '',
        channels: ['whatsapp'],
        content: {}
      });
    }
  };

  const handleChannelChange = (channelId) => {
    const updatedChannels = composerData.channels.includes(channelId)
      ? composerData.channels.filter(id => id !== channelId)
      : [...composerData.channels, channelId];
    
    setComposerData({
      ...composerData,
      channels: updatedChannels
    });
  };

  const handleContentChange = (channel, content) => {
    setComposerData({
      ...composerData,
      content: {
        ...composerData.content,
        [channel]: content
      }
    });
  };

  const handleSendInvitations = async () => {
    if (composerData.channels.length === 0) {
      alert('Please select at least one delivery channel.');
      return;
    }

    const hasContent = composerData.channels.some(channel => 
      composerData.content[channel] && composerData.content[channel].trim()
    );

    if (!hasContent) {
      alert('Please add content for at least one selected channel.');
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate sending process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Sending invitations:', {
        ...composerData,
        recipientCount: getRecipientCount()
      });

      // Reset form
      setComposerData({
        template: '',
        recipients: 'all',
        customRecipients: [],
        scheduleType: 'now',
        scheduledDate: '',
        scheduledTime: '',
        subject: '',
        channels: ['whatsapp'],
        content: {},
        includeAttachments: false,
        priority: 'normal'
      });
      setSelectedLearners([]);

      alert(`Invitations sent successfully via ${composerData.channels.join(', ')}!`);
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Error sending invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getRecipientCount = () => {
    switch (composerData.recipients) {
      case 'all':
        return mockLearners.length;
      case 'custom':
        return composerData.customRecipients.length;
      case 'grade':
        return mockLearners.filter(l => l.grade === 'Grade 1').length; // Assuming 'Grade 1' for example, you'd likely have a grade selection
      default:
        return 0;
    }
  };

  const handleLearnerSelection = (learnerId) => {
    const updatedSelection = selectedLearners.includes(learnerId)
      ? selectedLearners.filter(id => id !== learnerId)
      : [...selectedLearners, learnerId];
    
    setSelectedLearners(updatedSelection);
    setComposerData({
      ...composerData,
      customRecipients: updatedSelection
    });
  };

  const getEstimatedDelivery = () => {
    const channelTimes = {
      whatsapp: 'Instant',
      sms: '< 1 minute',
      email: '< 5 minutes'
    };
    
    return composerData.channels.map(channel => 
      `${channel.charAt(0).toUpperCase() + channel.slice(1)}: ${channelTimes[channel]}`
    ).join(', ');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl leading-6 font-semibold text-gray-900">
              Multi-Channel Invitation Composer
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Send invitations via WhatsApp, SMS, and Email to parents and learners
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              disabled={composerData.channels.length === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiEye className="mr-2 h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleSendInvitations}
              disabled={isSending || composerData.channels.length === 0 || !composerData.channels.some(channel => composerData.content[channel]?.trim())}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="mr-2 h-4 w-4" />
                  Send Invitations
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Email Template
            </label>
            <select
              value={composerData.template}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a template or create custom</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.channels.join(', ')})
                </option>
              ))}
            </select>
          </div>

          {/* Channel Selection */}
          <ChannelSelector 
            selectedChannels={composerData.channels}
            onChange={handleChannelChange}
          />

          {/* Recipients Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recipients
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="all-recipients"
                  name="recipients"
                  value="all"
                  checked={composerData.recipients === 'all'}
                  onChange={(e) => setComposerData({ ...composerData, recipients: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="all-recipients" className="ml-3 text-sm text-gray-700">
                  All parents/guardians ({mockLearners.length} recipients)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="grade-recipients"
                  name="recipients"
                  value="grade"
                  checked={composerData.recipients === 'grade'}
                  onChange={(e) => setComposerData({ ...composerData, recipients: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="grade-recipients" className="ml-3 text-sm text-gray-700">
                  Specific grade only
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="custom-recipients"
                  name="recipients"
                  value="custom"
                  checked={composerData.recipients === 'custom'}
                  onChange={(e) => setComposerData({ ...composerData, recipients: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="custom-recipients" className="ml-3 text-sm text-gray-700">
                  Select specific learners ({selectedLearners.length} selected)
                </label>
              </div>
            </div>

            {/* Custom Recipients Selection */}
            {composerData.recipients === 'custom' && (
              <div className="mt-4 border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {mockLearners.map(learner => (
                    <label key={learner.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLearners.includes(learner.id)}
                        onChange={() => handleLearnerSelection(learner.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{learner.name}</div>
                        <div className="text-xs text-gray-500">
                          Parent: {learner.parentName} | {learner.parentEmail} | {learner.parentPhone}
                        </div>
                        <div className="text-xs text-gray-500">{learner.grade}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Send Schedule
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="send-now"
                  name="scheduleType"
                  value="now"
                  checked={composerData.scheduleType === 'now'}
                  onChange={(e) => setComposerData({ ...composerData, scheduleType: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="send-now" className="ml-3 text-sm text-gray-700">
                  Send immediately
                  <span className="text-xs text-gray-500 block">
                    Estimated delivery: {getEstimatedDelivery()}
                  </span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="send-later"
                  name="scheduleType"
                  value="later"
                  checked={composerData.scheduleType === 'later'}
                  onChange={(e) => setComposerData({ ...composerData, scheduleType: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="send-later" className="ml-3 text-sm text-gray-700">
                  Schedule for later
                </label>
              </div>
            </div>

            {composerData.scheduleType === 'later' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="inline mr-1 h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={composerData.scheduledDate}
                    onChange={(e) => setComposerData({ ...composerData, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiClock className="inline mr-1 h-4 w-4" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={composerData.scheduledTime}
                    onChange={(e) => setComposerData({ ...composerData, scheduledTime: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subject Line (for email) */}
          {composerData.channels.includes('email') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject Line
              </label>
              <input
                type="text"
                value={composerData.subject}
                onChange={(e) => setComposerData({ ...composerData, subject: e.target.value })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter email subject..."
              />
            </div>
          )}

          {/* Message Content Editor */}
          <MessageContentEditor 
            channels={composerData.channels}
            content={composerData.content}
            onChange={handleContentChange}
          />

          {/* Priority Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Message Priority
            </label>
            <div className="flex items-center space-x-6">
              {[
                { value: 'low', label: 'Low', color: 'text-gray-600' },
                { value: 'normal', label: 'Normal', color: 'text-blue-600' },
                { value: 'high', label: 'High', color: 'text-orange-600' },
                { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
              ].map(priority => (
                <label key={priority.value} className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={composerData.priority === priority.value}
                    onChange={(e) => setComposerData({ ...composerData, priority: e.target.value })}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span className={`ml-2 text-sm ${priority.color}`}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          {composerData.channels.includes('email') && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-attachments"
                checked={composerData.includeAttachments}
                onChange={(e) => setComposerData({ ...composerData, includeAttachments: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="include-attachments" className="ml-3 text-sm text-gray-700">
                Include school information attachments (Email only)
              </label>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiUsers className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Invitation Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-800">
                      <strong>Recipients:</strong> {getRecipientCount()} parents/guardians
                    </p>
                    <p className="text-blue-800">
                      <strong>Channels:</strong> {composerData.channels.length > 0 ? composerData.channels.join(', ') : 'None selected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-800">
                      <strong>Priority:</strong> {composerData.priority.charAt(0).toUpperCase() + composerData.priority.slice(1)}
                    </p>
                    <p className="text-blue-800">
                      <strong>Schedule:</strong> {composerData.scheduleType === 'now' ? 'Immediate' : `${composerData.scheduledDate} at ${composerData.scheduledTime}`}
                    </p>
                  </div>
                </div>
              </div>
              <FiCheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreview(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Multi-Channel Message Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {composerData.channels.map(channel => {
                    const channelContent = composerData.content[channel];
                    if (!channelContent) return null;

                    const getChannelIcon = (channel) => {
                      switch (channel) {
                        case 'whatsapp': return <FiMessageSquare className="h-5 w-5 text-green-500" />;
                        case 'sms': return <FiSmartphone className="h-5 w-5 text-blue-500" />;
                        case 'email': return <FiMail className="h-5 w-5 text-red-500" />;
                        default: return null;
                      }
                    };

                    return (
                      <div key={channel} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center">
                            {getChannelIcon(channel)}
                            <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                              {channel} Preview
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          {channel === 'email' && composerData.subject && (
                            <div className="mb-4 pb-3 border-b border-gray-100">
                              <div className="text-xs text-gray-500 mb-1">Subject:</div>
                              <div className="text-sm font-medium text-gray-900">
                                {composerData.subject}
                              </div>
                            </div>
                          )}
                          
                          <div className={`${
                            channel === 'whatsapp' 
                              ? 'bg-green-50 border border-green-200 rounded-lg p-3' 
                              : channel === 'sms'
                              ? 'bg-blue-50 border border-blue-200 rounded-lg p-3'
                              : 'bg-white'
                          }`}>
                            <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                              {channelContent}
                            </pre>
                          </div>

                          {channel === 'sms' && (
                            <div className="mt-2 text-xs text-gray-500">
                              Character count: {channelContent.length}/160
                            </div>
                          )}
                        </div>
                      </div>
                    );
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

export default InvitationComposer;