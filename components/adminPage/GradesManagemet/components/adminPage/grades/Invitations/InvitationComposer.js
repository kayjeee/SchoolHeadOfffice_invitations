import React, { useState, useEffect } from 'react';
import { FiSend, FiEye, FiUsers, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import ChannelSelector from './ChannelSelector';
import TemplateRenderer from './TemplateRenderer';
import { createProvider, getAvailableProviders } from './providers';

/**
 * InvitationComposer Component (Refactored)
 * 
 * Main orchestrator component for creating and sending multi-channel invitations.
 * Manages state, coordinates sub-components, and handles the sending process.
 * 
 * @param {Object} props
 * @param {Array} props.schools - Array of available schools
 * @param {Object} props.selectedSchool - Currently selected school
 * @param {Object} props.user - Current user object
 * @param {Array} props.grades - Available grades data
 * @param {Function} props.onSendComplete - Callback when sending is complete
 */
const InvitationComposer = ({ 
  schools = [], 
  selectedSchool = null, 
  user = null, 
  grades = [],
  onSendComplete 
}) => {
  // Main state management
  const [composerState, setComposerState] = useState({
    // Channel and content state
    selectedChannels: ['whatsapp'], // Default to WhatsApp
    content: {},
    subject: '',
    
    // Recipients state
    recipients: 'all', // 'all', 'grade', 'custom'
    selectedGrade: '',
    customRecipients: [],
    
    // Scheduling state
    scheduleType: 'now', // 'now', 'later'
    scheduledDate: '',
    scheduledTime: '',
    
    // Template state
    selectedTemplate: '',
    
    // UI state
    showPreview: false,
    isSending: false,
    sendingProgress: 0,
    
    // Settings
    priority: 'normal',
    includeAttachments: false
  });

  // Available templates
  const templates = [
    {
      id: 'welcome_new_learner',
      name: 'Welcome New Learner',
      description: 'Welcome message for newly enrolled students',
      channels: ['whatsapp', 'email'],
      subject: 'Welcome to {{schoolName}} - {{learnerName}}',
      content: {
        whatsapp: `Hello {{parentName}}! 👋\n\nYour child {{learnerName}} has been successfully enrolled at {{schoolName}} for the {{academicYear}} academic year.\n\n🎓 Grade: {{grade}}\n📱 Parent Portal: {{portalUrl}}\n\nWelcome to our school community!\n\nBest regards,\n{{schoolName}} Team`,
        email: `Dear {{parentName}},\n\nWe are delighted to welcome {{learnerName}} to {{schoolName}} for the {{academicYear}} academic year.\n\nENROLLMENT DETAILS:\n• Student: {{learnerName}}\n• Grade: {{grade}}\n• Academic Year: {{academicYear}}\n\nNEXT STEPS:\n1. Access your Parent Portal at {{portalUrl}}\n2. Complete any outstanding documentation\n3. Attend the orientation session\n\nWe look forward to partnering with you in {{learnerName}}'s educational journey.\n\nWarm regards,\n\n{{principalName}}\nPrincipal\n{{schoolName}}`
      }
    },
    {
      id: 'grade_assignment',
      name: 'Grade Assignment Notification',
      description: 'Notification about grade/class assignment',
      channels: ['sms', 'email'],
      subject: 'Grade Assignment - {{learnerName}}',
      content: {
        sms: `Hi {{parentName}}, {{learnerName}} has been assigned to {{grade}} at {{schoolName}}. Contact: {{contactNumber}}`,
        email: `Dear {{parentName}},\n\nWe are pleased to inform you that {{learnerName}} has been assigned to {{grade}} for the {{academicYear}} academic year.\n\nClass details and teacher information will be shared closer to the start of the academic year.\n\nBest regards,\n{{schoolName}} Administration`
      }
    },
    {
      id: 'portal_access',
      name: 'Parent Portal Access',
      description: 'Parent portal login credentials and instructions',
      channels: ['whatsapp', 'email'],
      subject: 'Your Parent Portal Access - {{schoolName}}',
      content: {
        whatsapp: `Hi {{parentName}}! 📱\n\nYour parent portal is ready:\n🔗 {{portalUrl}}\n👤 Username: {{username}}\n🔑 Password: {{password}}\n\nFor support: {{contactNumber}}`,
        email: `Dear {{parentName}},\n\nYour parent portal access is now ready.\n\nLOGIN DETAILS:\n• URL: {{portalUrl}}\n• Username: {{username}}\n• Password: {{password}}\n\nFEATURES:\n• View academic progress\n• Access school communications\n• Update contact information\n• Make fee payments\n\nFor technical support, contact us at {{contactEmail}}\n\nBest regards,\n{{schoolName}} IT Team`
      }
    }
  ];

  // Mock learners data (in real app, this would come from props or API)
  const mockLearners = [
    { 
      id: 1, 
      name: 'John Smith', 
      parentName: 'Mary Smith', 
      email: 'mary.smith@email.com', 
      phone: '+27821234567',
      whatsapp: '+27821234567',
      grade: 'Grade 9',
      gradeId: grades[0]?.id || '68893527f01744107e6f0d68'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      parentName: 'David Johnson', 
      email: 'david.johnson@email.com', 
      phone: '+27821234568',
      whatsapp: '+27821234568',
      grade: 'Grade 9',
      gradeId: grades[0]?.id || '68893527f01744107e6f0d68'
    },
    { 
      id: 3, 
      name: 'Michael Brown', 
      parentName: 'Lisa Brown', 
      email: 'lisa.brown@email.com', 
      phone: '+27821234569',
      whatsapp: '+27821234569',
      grade: 'Grade 9 k',
      gradeId: grades[1]?.id || '6889365ff01744107e6f0d6a'
    }
  ];

  // Update state helper
  const updateState = (updates) => {
    setComposerState(prev => ({ ...prev, ...updates }));
  };

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateState({
        selectedTemplate: templateId,
        subject: template.subject,
        selectedChannels: template.channels,
        content: template.content
      });
    } else {
      updateState({
        selectedTemplate: '',
        subject: '',
        selectedChannels: ['whatsapp'],
        content: {}
      });
    }
  };

  // Handle channel selection
  const handleChannelChange = (channelId) => {
    const updatedChannels = composerState.selectedChannels.includes(channelId)
      ? composerState.selectedChannels.filter(id => id !== channelId)
      : [...composerState.selectedChannels, channelId];
    
    updateState({ selectedChannels: updatedChannels });
  };

  // Handle content changes
  const handleContentChange = (channel, content) => {
    updateState({
      content: {
        ...composerState.content,
        [channel]: content
      }
    });
  };

  // Handle subject change
  const handleSubjectChange = (subject) => {
    updateState({ subject });
  };

  // Get recipient count
  const getRecipientCount = () => {
    switch (composerState.recipients) {
      case 'all':
        return mockLearners.length;
      case 'grade':
        return mockLearners.filter(l => l.gradeId === composerState.selectedGrade).length;
      case 'custom':
        return composerState.customRecipients.length;
      default:
        return 0;
    }
  };

  // Get filtered recipients
  const getRecipients = () => {
    switch (composerState.recipients) {
      case 'all':
        return mockLearners;
      case 'grade':
        return mockLearners.filter(l => l.gradeId === composerState.selectedGrade);
      case 'custom':
        return mockLearners.filter(l => composerState.customRecipients.includes(l.id));
      default:
        return [];
    }
  };

  // Handle learner selection for custom recipients
  const handleLearnerSelection = (learnerId) => {
    const updatedSelection = composerState.customRecipients.includes(learnerId)
      ? composerState.customRecipients.filter(id => id !== learnerId)
      : [...composerState.customRecipients, learnerId];
    
    updateState({ customRecipients: updatedSelection });
  };

  // Validate form
  const validateForm = () => {
    const errors = [];

    if (composerState.selectedChannels.length === 0) {
      errors.push('Please select at least one delivery channel.');
    }

    const hasContent = composerState.selectedChannels.some(channel => 
      composerState.content[channel] && composerState.content[channel].trim()
    );

    if (!hasContent) {
      errors.push('Please add content for at least one selected channel.');
    }

    if (composerState.selectedChannels.includes('email') && !composerState.subject.trim()) {
      errors.push('Email subject is required when email channel is selected.');
    }

    if (getRecipientCount() === 0) {
      errors.push('Please select at least one recipient.');
    }

    if (composerState.scheduleType === 'later') {
      if (!composerState.scheduledDate) {
        errors.push('Please select a scheduled date.');
      }
      if (!composerState.scheduledTime) {
        errors.push('Please select a scheduled time.');
      }
    }

    return errors;
  };

  // Handle send invitations
  const handleSendInvitations = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }

    updateState({ isSending: true, sendingProgress: 0 });

    try {
      const recipients = getRecipients();
      const totalMessages = composerState.selectedChannels.length * recipients.length;
      let sentMessages = 0;

      console.log('Starting invitation send process:', {
        channels: composerState.selectedChannels,
        recipientCount: recipients.length,
        totalMessages,
        scheduleType: composerState.scheduleType
      });

      // Simulate sending process
      for (const channel of composerState.selectedChannels) {
        console.log(`Sending ${channel} messages to ${recipients.length} recipients`);
        
        // Create appropriate provider (this is just for demonstration)
        let provider;
        try {
          if (channel === 'sms' || channel === 'whatsapp') {
            provider = createProvider('twilio', {
              accountSid: 'demo_sid',
              authToken: 'demo_token',
              fromNumber: '+27123456789'
            });
          } else if (channel === 'email') {
            provider = createProvider('sendgrid', {
              apiKey: 'demo_key',
              fromEmail: selectedSchool?.email || 'noreply@school.edu'
            });
          }

          // Simulate sending with progress updates
          for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];
            
            // Simulate individual message sending
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log(`Sent ${channel} message to ${recipient.parentName}`);
            sentMessages++;
            
            updateState({ 
              sendingProgress: Math.round((sentMessages / totalMessages) * 100) 
            });
          }

        } catch (error) {
          console.error(`Error with ${channel} provider:`, error);
        }
      }

      // Reset form after successful send
      updateState({
        selectedTemplate: '',
        selectedChannels: ['whatsapp'],
        content: {},
        subject: '',
        recipients: 'all',
        selectedGrade: '',
        customRecipients: [],
        scheduleType: 'now',
        scheduledDate: '',
        scheduledTime: '',
        isSending: false,
        sendingProgress: 0
      });

      alert(`Invitations sent successfully!\n\n${sentMessages} messages sent via ${composerState.selectedChannels.join(', ')}`);

      // Call completion callback if provided
      if (typeof onSendComplete === 'function') {
        onSendComplete({
          success: true,
          messagesSent: sentMessages,
          channels: composerState.selectedChannels,
          recipients: recipients.length
        });
      }

    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Error sending invitations. Please try again.');
      updateState({ isSending: false, sendingProgress: 0 });
    }
  };

  // Get estimated delivery time
  const getEstimatedDelivery = () => {
    const channelTimes = {
      whatsapp: 'Instant',
      sms: '< 1 minute',
      email: '< 5 minutes'
    };
    
    return composerState.selectedChannels.map(channel => 
      `${channel.charAt(0).toUpperCase() + channel.slice(1)}: ${channelTimes[channel]}`
    ).join(', ');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl leading-6 font-semibold text-gray-900">
              Multi-Channel Invitation Composer
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Send invitations via WhatsApp, SMS, and Email to parents and learners
            </p>
            {selectedSchool && (
              <p className="mt-1 text-xs text-blue-600">
                School: {selectedSchool.name}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateState({ showPreview: true })}
              disabled={composerState.selectedChannels.length === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiEye className="mr-2 h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleSendInvitations}
              disabled={composerState.isSending || validateForm().length > 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {composerState.isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending... {composerState.sendingProgress}%
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
              Message Template
            </label>
            <select
              value={composerState.selectedTemplate}
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
            {composerState.selectedTemplate && (
              <p className="mt-1 text-sm text-gray-500">
                {templates.find(t => t.id === composerState.selectedTemplate)?.description}
              </p>
            )}
          </div>

          {/* Channel Selection */}
          <ChannelSelector 
            selectedChannels={composerState.selectedChannels}
            onChange={handleChannelChange}
            user={user}
            selectedSchool={selectedSchool}
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
                  checked={composerState.recipients === 'all'}
                  onChange={(e) => updateState({ recipients: e.target.value })}
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
                  checked={composerState.recipients === 'grade'}
                  onChange={(e) => updateState({ recipients: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="grade-recipients" className="ml-3 text-sm text-gray-700">
                  Specific grade only
                </label>
              </div>

              {composerState.recipients === 'grade' && (
                <div className="ml-7">
                  <select
                    value={composerState.selectedGrade}
                    onChange={(e) => updateState({ selectedGrade: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a grade</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name} ({grade.learners_count} learners)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="radio"
                  id="custom-recipients"
                  name="recipients"
                  value="custom"
                  checked={composerState.recipients === 'custom'}
                  onChange={(e) => updateState({ recipients: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="custom-recipients" className="ml-3 text-sm text-gray-700">
                  Select specific learners ({composerState.customRecipients.length} selected)
                </label>
              </div>
            </div>

            {/* Custom Recipients Selection */}
            {composerState.recipients === 'custom' && (
              <div className="mt-4 border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {mockLearners.map(learner => (
                    <label key={learner.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={composerState.customRecipients.includes(learner.id)}
                        onChange={() => handleLearnerSelection(learner.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{learner.name}</div>
                        <div className="text-xs text-gray-500">
                          Parent: {learner.parentName} | {learner.email} | {learner.phone}
                        </div>
                        <div className="text-xs text-gray-500">{learner.grade}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Recipient Summary */}
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <FiUsers className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
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
                  checked={composerState.scheduleType === 'now'}
                  onChange={(e) => updateState({ scheduleType: e.target.value })}
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
                  checked={composerState.scheduleType === 'later'}
                  onChange={(e) => updateState({ scheduleType: e.target.value })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="send-later" className="ml-3 text-sm text-gray-700">
                  Schedule for later
                </label>
              </div>
            </div>

            {composerState.scheduleType === 'later' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="inline mr-1 h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={composerState.scheduledDate}
                    onChange={(e) => updateState({ scheduledDate: e.target.value })}
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
                    value={composerState.scheduledTime}
                    onChange={(e) => updateState({ scheduledTime: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Template Renderer */}
          <TemplateRenderer 
            channels={composerState.selectedChannels}
            content={composerState.content}
            subject={composerState.subject}
            onChange={handleContentChange}
            onSubjectChange={handleSubjectChange}
            selectedSchool={selectedSchool}
            user={user}
          />

          {/* Form Validation Summary */}
          {validateForm().length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following issues:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {validateForm().map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ready to Send Summary */}
          {validateForm().length === 0 && composerState.selectedChannels.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <FiCheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Ready to send
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''} will receive messages via {composerState.selectedChannels.join(', ')}.
                      {composerState.scheduleType === 'later' && composerState.scheduledDate && composerState.scheduledTime && (
                        <span> Scheduled for {composerState.scheduledDate} at {composerState.scheduledTime}.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationComposer;

