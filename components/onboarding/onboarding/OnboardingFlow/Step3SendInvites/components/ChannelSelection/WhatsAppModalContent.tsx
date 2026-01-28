import React, { useEffect, useMemo, useState } from 'react';
import { MessageTesterSection } from './MessageTesterSection';
import { MessageScheduler, ScheduleData } from './MessageScheduler';
import WhatsAppBusinessService from '../../../../../../../lib/services/WhatsAppBusinessService';
import { Grade, Learner } from '../../types';
import { logger } from './utils/logger';

interface WhatsAppModalContentProps {
  learners: Learner[];
  grades: Grade[];
  schoolId: string;
  schoolName: string;
  userEmail?: string;
  senderId?: string;
  customMessage: string;
  onMessageChange: (message: string) => void;
  selectedGrade: Grade | null;
  selectedGrades: Grade[];
  getCountryCode: (country?: string) => string;
  school?: any;
}

export const WhatsAppModalContent: React.FC<WhatsAppModalContentProps> = ({
  learners,
  grades,
  schoolId,
  schoolName,
  userEmail,
  senderId,
  customMessage,
  onMessageChange,
  selectedGrade,
  selectedGrades,
  getCountryCode,
  school,
}) => {
  /* ──────────────────────────── STATE ──────────────────────────── */
  const [activeTab, setActiveTab] = useState<'contacts' | 'test' | 'schedule'>('contacts');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [learnerNumber, setLearnerNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  /* ──────────────────────────── HELPERS ──────────────────────────── */

  const getAccessionNumber = (learner: any): string | null => {
    const fields = [
      learner.accession_number,
      learner.accessionNumber,
      learner.AccessionNumber,
      learner.learner_number,
      learner.learnerNumber,
      learner.student_number,
      learner.studentNumber,
    ];

    const value = fields.find(v => v && String(v).trim().length > 0);
    return value ? String(value).trim() : null;
  };

  const getWhatsAppNumbers = (learner: any): string[] => {
    const fields = [
      learner.phone,
      learner.whatsapp,
      learner.contact?.phone,
      learner.contact?.whatsapp,
      learner.contact?.tel_home,
      learner.contact?.tel_emergency,
      learner.contact?.telegram,
    ];

    return fields.filter(phone => {
      if (!phone || typeof phone !== 'string') return false;
      const cleaned = phone.trim();
      if (!cleaned || cleaned.startsWith('011')) return false;
      return (cleaned.match(/\d/g) || []).length >= 7;
    });
  };

  const getBestWhatsAppNumber = (learner: any): string => {
    const numbers = getWhatsAppNumbers(learner);
    return numbers[0] || 'No number';
  };

  const learnersWithWhatsApp = useMemo(
    () => learners.filter(l => getWhatsAppNumbers(l).length > 0),
    [learners]
  );

  /* ──────────────────────────── DEBUG ──────────────────────────── */

  useEffect(() => {
    if (!learners.length) return;

    logger.info('🔍 Learner Structure Check', {
      sample: learners[0],
      keys: Object.keys(learners[0]),
    });

    learners.slice(0, 3).forEach((l, i) => {
      logger.info(`Learner ${i + 1}`, {
        name: l.full_name,
        accession: getAccessionNumber(l) || l.id,
      });
    });
  }, [learners]);

  /* ──────────────────────────── ACTIONS ──────────────────────────── */

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(customMessage);

      const result = await WhatsAppBusinessService.sendTestMessage({
        to: testPhoneNumber.replace(/\s+/g, ''),
        schoolId,
        schoolName,
        userEmail,
        learnerNumber,
        parentName,
        sender_id: senderId,
        grade: selectedGrade || undefined,
        countryCode: getCountryCode(school?.country),
      });

      setTestResult({
        success: true,
        message: 'Test message sent successfully!',
        ...result,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Failed to send test message',
        error: error.message,
      });
    }

    setIsSendingTest(false);
  };

  const handleSendBulk = async () => {
    setIsSendingBulk(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(customMessage);

      const recipientNumbers = learnersWithWhatsApp.map(l => ({
        phone: getBestWhatsAppNumber(l),
        name: l.full_name,
        learner_number: getAccessionNumber(l) || l.id,
      }));

      const result = await WhatsAppBusinessService.sendBulkMessages({
        gradeIds: selectedGrades.map(g => g.id),
        schoolName,
        recipientNumbers,
        schoolId,
        userEmail,
        countryCode: getCountryCode(school?.country),
        senderId,
      });

      setTestResult({
        success: true,
        message: `Bulk messages sent successfully`,
        bulkResult: result,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Bulk send failed',
        error: error.message,
      });
    }

    setIsSendingBulk(false);
  };

  const handleSchedule = async (schedule: ScheduleData) => {
    setIsScheduling(true);

    try {
      await WhatsAppBusinessService.scheduleBulkMessage({
        gradeIds: selectedGrades.map(g => g.id),
        message: schedule.message,
        scheduledAt: schedule.scheduledAt,
        timezone: schedule.timezone,
        recipientNumbers: learnersWithWhatsApp.map(l => getBestWhatsAppNumber(l)),
        schoolId,
        schoolName,
      });

      alert('WhatsApp message scheduled successfully');
    } catch (error: any) {
      alert(error.message);
    }

    setIsScheduling(false);
  };

  const handleCopyWhatsAppNumbers = async () => {
    const text = learnersWithWhatsApp
      .map(l => `${l.full_name}: ${getBestWhatsAppNumber(l)} (${getAccessionNumber(l) || l.id})`)
      .join('\n');

    await navigator.clipboard.writeText(text);
  };

  const handleCopyPhoneNumbersOnly = async () => {
    const text = learnersWithWhatsApp.map(l => getBestWhatsAppNumber(l)).join('\n');
    await navigator.clipboard.writeText(text);
  };

  /* ──────────────────────────── UI ──────────────────────────── */

  return (
    <div className="mt-6 border-t pt-6">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(['contacts', 'test', 'schedule'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'schedule' && !learnersWithWhatsApp.length}
            className={`px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab === 'contacts' && `👥 Contacts (${learnersWithWhatsApp.length})`}
            {tab === 'test' && '🧪 Test Message'}
            {tab === 'schedule' && '📅 Schedule'}
          </button>
        ))}
      </div>

      {/* Contacts */}
      {activeTab === 'contacts' && (
        <div className="bg-green-50 border rounded-lg p-4">
          <div className="flex gap-2 mb-4">
            <button onClick={handleCopyWhatsAppNumbers} className="btn-green">
              📋 Copy Names & Numbers
            </button>
            <button onClick={handleCopyPhoneNumbersOnly} className="btn-green-light">
              📞 Copy Numbers Only
            </button>
          </div>
        </div>
      )}

      {/* Test */}
      {activeTab === 'test' && (
        <MessageTesterSection
          testPhoneNumber={testPhoneNumber}
          onPhoneNumberChange={setTestPhoneNumber}
          learnerNumber={learnerNumber}
          onLearnerNumberChange={setLearnerNumber}
          parentName={parentName}
          onParentNameChange={setParentName}
          invitedVia="whatsapp"
          onInvitedViaChange={() => {}}
          messageContent={customMessage}
          onMessageChange={onMessageChange}
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

      {/* Schedule */}
      {activeTab === 'schedule' && (
        <MessageScheduler
          onSchedule={handleSchedule}
          isScheduling={isScheduling}
          messageContent={customMessage}
          totalRecipients={learnersWithWhatsApp.length}
        />
      )}
    </div>
  );
};
