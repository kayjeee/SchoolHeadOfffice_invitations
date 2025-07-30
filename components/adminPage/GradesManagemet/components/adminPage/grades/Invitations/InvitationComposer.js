import React, { useState } from 'react';
import { FiMail, FiSend, FiUsers, FiEye, FiCalendar, FiClock } from 'react-icons/fi';

const InvitationComposer = (user) => {
  const [composerData, setComposerData] = useState({
    template: '',
    recipients: 'all',
    customRecipients: [],
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: '',
    subject: '',
    content: '',
    includeAttachments: false
  });

  const [selectedLearners, setSelectedLearners] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Mock data
  const templates = [
    { id: 1, name: 'Welcome New Learner', subject: 'Welcome to {{schoolName}}' },
    { id: 2, name: 'Grade Assignment', subject: 'Grade Assignment Notification' },
    { id: 3, name: 'Parent Portal Access', subject: 'Your Parent Portal Access' }
  ];

  const mockLearners = [
    { id: 1, name: 'John Smith', parentEmail: 'mary.smith@email.com', grade: 'Grade 1' },
    { id: 2, name: 'Sarah Johnson', parentEmail: 'david.johnson@email.com', grade: 'Grade 1' },
    { id: 3, name: 'Michael Brown', parentEmail: 'lisa.brown@email.com', grade: 'Grade 2' }
  ];

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setComposerData({
        ...composerData,
        template: templateId,
        subject: template.subject,
        content: `Dear {{parentName}},

This is a sample email content from the ${template.name} template.

Best regards,
{{schoolName}} Administration`
      });
    }
  };

  const handleSendInvitations = async () => {
    setIsSending(true);
    
    try {
      // Simulate sending process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        content: '',
        includeAttachments: false
      });

      alert('Invitations sent successfully!');
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
        return mockLearners.filter(l => l.grade === 'Grade 1').length; // Example
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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Compose Invitation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Send invitations to parents and learners
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiEye className="mr-1 h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleSendInvitations}
              disabled={isSending || !composerData.subject || !composerData.content}
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

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recipients Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            <div className="space-y-3">
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
              <div className="mt-4 border border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {mockLearners.map(learner => (
                    <label key={learner.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLearners.includes(learner.id)}
                        onChange={() => handleLearnerSelection(learner.id)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {learner.name} ({learner.parentEmail}) - {learner.grade}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Schedule
            </label>
            <div className="space-y-3">
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
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiCalendar className="inline mr-1 h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={composerData.scheduledDate}
                    onChange={(e) => setComposerData({ ...composerData, scheduledDate: e.target.value })}
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

          {/* Email Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={composerData.subject}
              onChange={(e) => setComposerData({ ...composerData, subject: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
            </label>
            <textarea
              rows={8}
              value={composerData.content}
              onChange={(e) => setComposerData({ ...composerData, content: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your email content here..."
            />
            <p className="mt-1 text-xs text-gray-500">
              You can use variables like , etc.
            </p>
          </div>

          {/* Additional Options */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="include-attachments"
              checked={composerData.includeAttachments}
              onChange={(e) => setComposerData({ ...composerData, includeAttachments: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="include-attachments" className="ml-3 text-sm text-gray-700">
              Include school information attachments
            </label>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <FiUsers className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Invitation Summary</h4>
                <p className="text-sm text-blue-700">
                  Ready to send to <strong>{getRecipientCount()}</strong> recipients
                  {composerData.scheduleType === 'later' && composerData.scheduledDate && (
                    <span> on {composerData.scheduledDate} at {composerData.scheduledTime}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreview(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Email Preview
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

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Subject:</span>
                    </div>
                    <p className="text-sm text-gray-900">{composerData.subject || 'No subject'}</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                        {composerData.content || 'No content'}
                      </pre>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>* This preview shows the template with variables. Actual emails will use real data.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationComposer;

