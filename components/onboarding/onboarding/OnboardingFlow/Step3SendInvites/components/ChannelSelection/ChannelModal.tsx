import React, { useState } from 'react';
import { logger } from './utils/logger';
import { ChannelModalProps } from './types/channel';
import { Modal } from './ui/Modal';
import { QrCodeWithCopy } from './QrCodeWithCopy';
import { CopyButton } from './ui/CopyButton';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAudienceData } from './hooks/useAudienceData';

// NEW WHATSAPP IMPORTS
import { WhatsAppTesterSection } from './WhatsAppTesterSection';
import { WhatsAppScheduler, ScheduleData } from './WhatsAppScheduler';
import WhatsAppBusinessService from './services/WhatsappBusinessService';

export const ChannelModal: React.FC<ChannelModalProps> = ({
  channel,
  isOpen,
  onClose,
  schoolLink,
  schoolName,
  schoolId,
  prCode,
  onChannelSelect,
  isSelected,
  selectedGrades = [],
  school
}) => {
  console.log('🎯 [ChannelModal] Props received:', {
    channel: channel?.name,
    isOpen,
    schoolId,
    selectedGradesCount: selectedGrades?.length || 0,
    selectedGrades: selectedGrades?.map(g => g.name) || []
  });

  // Load audience data when modal opens
  const { grades, learners, isLoading, error, totalLearners } = useAudienceData({
    schoolId,
    selectedGrades,
    channelId: channel.id,
    isOpen
  });

  // =======================================================
  // 🔥 ENHANCED WHATSAPP STATES
  // =======================================================
  const [activeTab, setActiveTab] = useState<'test' | 'schedule' | 'contacts'>('contacts');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<any>({});
  // =======================================================

  const handleSelectChannel = () => {
    logger.info('ChannelModal', 'Channel selected', {
      channelId: channel.id,
      channelName: channel.name,
      wasSelected: isSelected,
      audienceSize: totalLearners,
      gradeCount: grades.length
    });
    onChannelSelect(channel.id);
  };

  // Generate channel-specific invitation message with audience info
  const invitationMessage = `Hello 👋,

You are invited to join the ${schoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more via ${channel.name}!

${grades.length > 0 ? `Grades: ${grades.map(g => g.name).join(', ')}` : ''}
${totalLearners > 0 ? `Total Learners: ${totalLearners}` : ''}

Click here to join: ${schoolLink}`;

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(invitationMessage);
    logger.debug('ChannelModal', 'Invitation message copied', {
      audienceSize: totalLearners
    });
  };

  // Get learners count by grade for detailed breakdown
  const getLearnersCountByGrade = () => {
    const countByGrade: { [gradeId: string]: { grade: any; count: number } } = {};

    learners.forEach(learner => {
      const gradeId = learner.grade_id;
      if (gradeId) {
        const grade = grades.find(g => g.id === gradeId);
        if (grade) {
          if (!countByGrade[grade.id]) {
            countByGrade[grade.id] = { grade, count: 0 };
          }
          countByGrade[grade.id].count++;
        }
      }
    });

    return Object.values(countByGrade);
  };

  const learnersByGrade = getLearnersCountByGrade();

  // Enhanced WhatsApp number detection
  const getWhatsAppNumbers = (learner: any) => {
    const phoneFields = [
      learner.phone,
      learner.whatsapp,
      learner.contact?.phone,
      learner.contact?.whatsapp,
      learner.contact?.tel_home,
      learner.contact?.tel_emergency,
      learner.contact?.telegram
    ];

    // Filter out empty, null, undefined values and landline numbers
    const validNumbers = phoneFields.filter(phone => {
      if (!phone || typeof phone !== 'string') return false;

      const cleanPhone = phone.trim();
      if (cleanPhone === '') return false;

      // Exclude landline numbers (starting with 011)
      if (cleanPhone.startsWith('011')) return false;

      // Basic phone number validation (at least 7 digits)
      const digitCount = (cleanPhone.match(/\d/g) || []).length;
      return digitCount >= 7;
    });

    return validNumbers;
  };

  // WhatsApp-specific: Filter learners with valid WhatsApp numbers
  const learnersWithWhatsApp = learners.filter(learner => {
    const whatsappNumbers = getWhatsAppNumbers(learner);
    return whatsappNumbers.length > 0;
  });

  // Get the best WhatsApp number for a learner (prioritize WhatsApp-specific fields)
  const getBestWhatsAppNumber = (learner: any): string => {
    const numbers = getWhatsAppNumbers(learner);

    // Priority order for number selection
    const priorityFields = [
      learner.whatsapp,
      learner.contact?.whatsapp,
      learner.phone,
      learner.contact?.phone,
      learner.contact?.telegram,
      learner.contact?.tel_emergency,
      learner.contact?.tel_home
    ];

    for (const field of priorityFields) {
      if (field && typeof field === 'string') {
        const cleanField = field.trim();
        if (cleanField && !cleanField.startsWith('011')) {
          const digitCount = (cleanField.match(/\d/g) || []).length;
          if (digitCount >= 7) {
            return cleanField;
          }
        }
      }
    }

    // Fallback to first valid number
    return numbers[0] || 'No number';
  };

  // Get recipient numbers for bulk send
  const getRecipientNumbers = () => {
    return learnersWithWhatsApp.map(learner => ({
      phone: getBestWhatsAppNumber(learner),
      name: learner.full_name,
      grade: grades.find(g => g.id === learner.grade_id)?.name || 'Unknown'
    }));
  };

  // WhatsApp-specific: Copy WhatsApp numbers to clipboard
  const handleCopyWhatsAppNumbers = async () => {
    const whatsappNumbers = learnersWithWhatsApp
      .map(learner => {
        const bestNumber = getBestWhatsAppNumber(learner);
        return `${learner.full_name}: ${bestNumber}`;
      })
      .join('\n');

    await navigator.clipboard.writeText(whatsappNumbers);
    logger.debug('ChannelModal', 'WhatsApp numbers copied', {
      count: learnersWithWhatsApp.length
    });
  };

  // WhatsApp-specific: Copy just phone numbers for bulk messaging
  const handleCopyPhoneNumbersOnly = async () => {
    const phoneNumbers = learnersWithWhatsApp
      .map(learner => getBestWhatsAppNumber(learner))
      .join('\n');

    await navigator.clipboard.writeText(phoneNumbers);
    logger.debug('ChannelModal', 'Phone numbers copied', {
      count: learnersWithWhatsApp.length
    });
  };

  // =======================================================
  // 🔥 ENHANCED WHATSAPP HANDLERS
  // =======================================================

  const selectedGrade = selectedGrades.length === 1 ? selectedGrades[0] : null;
  const gradeName = selectedGrade?.name || 'your selected grades';

  // Generate default message
  const defaultMessage = `🏫 ${schoolName} Parent Portal Invitation

Dear Parent,

You're invited to join our secure parent communication portal for ${gradeName}.

✅ Get real-time updates about your child's progress
✅ Receive important announcements instantly  
✅ Connect with teachers directly
✅ Access school resources and calendar

Join now: ${schoolLink}

Best wishes,
${schoolName} Admin Team`;

  const messageContent = customMessage || defaultMessage;

  // Test message validation
  const validateTestInputs = () => {
    const errors: any = {};
    const cleanedPhoneNumber = testPhoneNumber.replace(/\s+/g, '');

    if (!cleanedPhoneNumber.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(cleanedPhoneNumber)) {
      errors.phone = 'Please enter a valid phone number (E.164 format or similar, e.g., +27821234567)';
    }

    if (!messageContent.trim()) {
      errors.message = 'Message content is required';
    } else if (messageContent.length > 4096) {
      errors.message = 'Message is too long (max 4096 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle test message sending (single number)
  const handleSendTest = async () => {
    if (!validateTestInputs()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(messageContent);

      const result = await WhatsAppBusinessService.sendTestMessage({
        to: testPhoneNumber.replace(/\s+/g, ''),
        grade: selectedGrade,
        schoolId: schoolId,
        userEmail: school?.userEmail,
        schoolName: schoolName
      });

      setTestResult({
        success: true,
        messageId: result.messageId,
        message: 'Test message sent successfully! Check your WhatsApp.'
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'An unknown error occurred.',
        message: 'Failed to send test message. Please try again.'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle bulk message sending (all learners)
  const handleSendBulk = async () => {
    if (!messageContent.trim()) {
      setTestResult({
        success: false,
        message: 'Message content is required for bulk send'
      });
      return;
    }

    if (learnersWithWhatsApp.length === 0) {
      setTestResult({
        success: false,
        message: 'No WhatsApp numbers available for bulk send'
      });
      return;
    }

    setIsSendingBulk(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(messageContent);

      const recipientNumbers = getRecipientNumbers();
      
      const result = await WhatsAppBusinessService.sendBulkMessages({
        gradeIds: selectedGrades.map(g => g.id),
        schoolName: schoolName,
        recipientNumbers: recipientNumbers.map(r => r.phone),
        schoolId: schoolId,
        userEmail: school?.userEmail
      });

      setTestResult({
        success: true,
        message: `Bulk messages sent successfully!`,
        bulkResult: {
          sentCount: result.sentCount,
          failedCount: result.failedCount,
          totalCount: recipientNumbers.length
        }
      });

      // Log bulk send results
      logger.info('ChannelModal', 'Bulk WhatsApp messages sent', {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        totalRecipients: recipientNumbers.length,
        gradeIds: selectedGrades.map(g => g.id)
      });

    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'An unknown error occurred.',
        message: 'Failed to send bulk messages. Please try again.'
      });
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Enhanced schedule handler
  const handleScheduleMessage = async (scheduleData: ScheduleData) => {
    setIsScheduling(true);

    try {
      const recipientNumbers = getRecipientNumbers();
      
      const result = await WhatsAppBusinessService.scheduleBulkMessage({
        gradeIds: selectedGrades.map(g => g.id),
        message: scheduleData.message,
        scheduledAt: scheduleData.scheduledAt,
        timezone: scheduleData.timezone,
        recipientNumbers: recipientNumbers.map(r => r.phone),
        schoolId: schoolId,
        schoolName: schoolName
      });

      console.log('Message scheduled:', result);
      alert(`Message scheduled successfully for ${new Date(scheduleData.scheduledAt).toLocaleString()} to ${recipientNumbers.length} recipients`);

    } catch (error: any) {
      console.error('Failed to schedule message:', error);
      alert(`Failed to schedule message: ${error.message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  // =======================================================
  // 🔥 ENHANCED WHATSAPP TAB CONTENT RENDERERS
  // =======================================================

  // Original WhatsApp Contacts Table and Warning
  const renderWhatsAppContactsTab = () => (
    <>
      {/* WhatsApp-specific: Learner Details Section */}
      {learnersWithWhatsApp.length > 0 && !isLoading ? (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            💚 WhatsApp Contacts ({learnersWithWhatsApp.length})
          </h4>

          {/* WhatsApp Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopyWhatsAppNumbers}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
            >
              📋 Copy Names & Numbers
            </button>
            <button
              onClick={handleCopyPhoneNumbersOnly}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center"
            >
              📞 Copy Numbers Only
            </button>
          </div>

          {/* Learners List with WhatsApp Numbers */}
          <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-green-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    Learner Name
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    WhatsApp Number
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    Grade
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {learnersWithWhatsApp.map((learner, index) => {
                  const grade = grades.find(g => g.id === learner.grade_id);
                  const bestNumber = getBestWhatsAppNumber(learner);

                  // Determine the source of the number for display
                  const getNumberSource = (learner: any, number: string): string => {
                    const sources = [
                      { field: learner.whatsapp, name: 'whatsapp' },
                      { field: learner.contact?.whatsapp, name: 'contact.whatsapp' },
                      { field: learner.phone, name: 'phone' },
                      { field: learner.contact?.phone, name: 'contact.phone' },
                      { field: learner.contact?.telegram, name: 'contact.telegram' },
                      { field: learner.contact?.tel_emergency, name: 'contact.tel_emergency' },
                      { field: learner.contact?.tel_home, name: 'contact.tel_home' }
                    ];

                    const source = sources.find(s => s.field === number);
                    return source?.name || 'unknown';
                  };

                  const numberSource = getNumberSource(learner, bestNumber);

                  return (
                    <tr
                      key={learner.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}
                    >
                      <td className="p-2 border-b border-green-100 text-gray-700">
                        {learner.full_name}
                      </td>
                      <td className="p-2 border-b border-green-100 font-mono text-green-700">
                        {bestNumber}
                      </td>
                      <td className="p-2 border-b border-green-100 text-gray-600">
                        {grade?.name || 'Unknown'}
                      </td>
                      <td className="p-2 border-b border-green-100 text-xs text-gray-500">
                        {numberSource}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 text-xs text-green-700">
            <p><strong>💡 Pro Tip:</strong> Use "Copy Numbers Only" for bulk WhatsApp messaging</p>
            <p className="mt-1"><strong>🔍 Note:</strong> Landline numbers (011...) are automatically excluded</p>
          </div>
        </div>
      ) : (
        /* WhatsApp-specific: No Numbers Warning */
        learnersWithWhatsApp.length === 0 && !isLoading && totalLearners > 0 && (
          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              ⚠️ No WhatsApp Numbers Found
            </h4>
            <p className="text-sm text-yellow-700">
              {totalLearners} learners are selected but no valid WhatsApp numbers were found.
              We checked: phone, whatsapp, contact.phone, contact.whatsapp, contact.tel_home, contact.tel_emergency, and contact.telegram fields.
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Landline numbers (starting with 011) are automatically excluded.
            </p>
          </div>
        )
      )}
    </>
  );

  // Main WhatsApp Tab Renderer
  const renderWhatsAppContent = () => {
    if (channel.id !== 'whatsapp') return null;

    return (
      <div className="mt-6 border-t pt-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            disabled={isLoading}
          >
            👥 Contacts ({isLoading ? '...' : learnersWithWhatsApp.length})
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'test'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🧪 Test Message
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            disabled={isLoading || learnersWithWhatsApp.length === 0}
            title={learnersWithWhatsApp.length === 0 ? "No WhatsApp contacts found to schedule a message" : "Schedule bulk message"}
          >
            📅 Schedule
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'contacts' && renderWhatsAppContactsTab()}

        {activeTab === 'test' && (
          <WhatsAppTesterSection
            testPhoneNumber={testPhoneNumber}
            onPhoneNumberChange={setTestPhoneNumber}
            messageContent={messageContent}
            onMessageChange={setCustomMessage}
            onSendTest={handleSendTest}
            onSendBulk={handleSendBulk}
            isSending={isSendingTest}
            isSendingBulk={isSendingBulk}
            testResult={testResult}
            validationErrors={validationErrors}
            schoolName={schoolName}
            selectedGrade={selectedGrade}
            totalRecipients={learnersWithWhatsApp.length}
            canSendBulk={learnersWithWhatsApp.length > 0}
          />
        )}

        {activeTab === 'schedule' && (
          <WhatsAppScheduler
            onSchedule={handleScheduleMessage}
            isScheduling={isScheduling}
            messageContent={messageContent}
            totalRecipients={learnersWithWhatsApp.length}
          />
        )}
      </div>
    );
  };

  // Debug: Log phone number sources for troubleshooting
  React.useEffect(() => {
    if (channel.id === 'whatsapp' && learners.length > 0 && !isLoading) {
      console.log('📱 [ChannelModal] WhatsApp Number Analysis:', {
        totalLearners: learners.length,
        withWhatsApp: learnersWithWhatsApp.length,
        sampleNumbers: learners.slice(0, 3).map(learner => ({
          name: learner.full_name,
          phone: learner.phone,
          // whatsapp: learner.whatsapp, // Removed because 'whatsapp' does not exist on type 'Learner'
          contact: learner.contact,
          bestNumber: getBestWhatsAppNumber(learner),
          allNumbers: getWhatsAppNumbers(learner)
        }))
      });
    }
  }, [learners, channel.id, isLoading]);

  console.log('📊 [ChannelModal] Current state:', {
    isLoading,
    error,
    gradesCount: grades.length,
    learnersCount: learners.length,
    learnersByGradeCount: learnersByGrade.length,
    learnersWithWhatsAppCount: learnersWithWhatsApp.length,
    isWhatsApp: channel.id === 'whatsapp'
  });

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${channel.icon} ${channel.name} Channel`}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Channel Description */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl flex items-center justify-center mx-auto mb-4">
            {channel.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {channel.name}
          </h3>
          <p className="text-gray-600">{channel.description}</p>
        </div>

        {/* Audience Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            👥 Audience Overview
            {isLoading && (
              <LoadingSpinner size="sm" text="Loading..." className="ml-2" />
            )}
          </h4>

          {error ? (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              ❌ Error loading audience data: {error}
            </div>
          ) : isLoading ? (
            <div className="text-center py-4">
              <LoadingSpinner size="md" text="Loading audience data..." />
              <p className="text-sm text-blue-600 mt-2">Fetching grades and learners...</p>
            </div>
          ) : (
            <>
              {/* Grades Summary */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Selected Grades:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {grades.length} grade{grades.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {grades.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {grades.map((grade) => (
                      <span
                        key={grade.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium border border-blue-200"
                      >
                        {grade.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600 italic">No grades selected</p>
                )}
              </div>

              {/* Learners Summary */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Total Learners:</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {totalLearners} learner{totalLearners !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* WhatsApp-specific: Show WhatsApp availability */}
                {channel.id === 'whatsapp' && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-green-800">📱 WhatsApp Available:</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        learnersWithWhatsApp.length > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {learnersWithWhatsApp.length} learner{learnersWithWhatsApp.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {learnersWithWhatsApp.length === 0 && (
                      <p className="text-xs text-yellow-600 italic">
                        No WhatsApp numbers found for learners
                      </p>
                    )}
                  </div>
                )}

                {/* Learners by Grade Breakdown */}
                {learnersByGrade.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-blue-700">Breakdown by Grade:</p>
                    <div className="space-y-1">
                      {learnersByGrade.map(({ grade, count }) => (
                        <div key={grade.id} className="flex justify-between items-center text-xs">
                          <span className="text-blue-600">{grade.name}:</span>
                          <span className="bg-white text-blue-800 px-2 py-1 rounded font-medium">
                            {count} learner{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : totalLearners > 0 ? (
                  <p className="text-sm text-blue-600 italic mt-2">
                    Learners are not grouped by grade in the data
                  </p>
                ) : null}

                {totalLearners === 0 && !isLoading && (
                  <p className="text-sm text-blue-600 italic">No learners found in selected grades</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Enhanced WhatsApp Content with Bulk Send */}
        {renderWhatsAppContent()}

        {/* School Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">🏫 School Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>School:</strong> {schoolName}</p>
            <p><strong>ID:</strong> {schoolId}</p>
            {prCode && <p><strong>PR Code:</strong> {prCode}</p>}
          </div>
        </div>

        {/* QR Code and Link */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">🔗 Share Invitation</h4>
          <QrCodeWithCopy
            link={schoolLink}
            size={120}
            showLink={true}
          />
        </div>

        {/* Invitation Message */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            ✉️ Invitation Message for {channel.name}
          </h4>
          <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {invitationMessage}
            </p>
          </div>
          <CopyButton
            text={invitationMessage}
            variant="outline"
            size="md"
            className="w-full justify-center"
            onClick={handleCopyMessage}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSelectChannel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
              isSelected
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="Loading..." />
            ) : isSelected ? (
              <span className="flex items-center justify-center">
                ✅ Selected • {totalLearners} learners
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Select Channel • {totalLearners} learners
              </span>
            )}
          </button>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="text-xs text-gray-400 border-t pt-2">
          <p>Debug: Channel={channel.id} | School={schoolId} | Grades={grades.length} | Learners={totalLearners}</p>
          <p>WhatsApp Contacts: {learnersWithWhatsApp.length}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ChannelModal;