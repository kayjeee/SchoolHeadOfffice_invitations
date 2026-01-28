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
  school?: {
    country?: string;
  };
}

interface BulkRecipient {
  phone: string;
  name: string;
  learner_number: string;
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
  /* ─────────────────────────── STATE ─────────────────────────── */

  const [activeTab, setActiveTab] = useState<'contacts' | 'test' | 'schedule'>('contacts');
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');
  const [learnerNumber, setLearnerNumber] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isSendingBulk, setIsSendingBulk] = useState<boolean>(false);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<unknown>(null);
  const [validationErrors] = useState<Record<string, string>>({});

  /* ───────────────────────── HELPERS ───────────────────────── */

  const getAccessionNumber = (learner: Learner): string | null => {
    const candidates: Array<unknown> = [
      (learner as any).accession_number,
      (learner as any).accessionNumber,
      (learner as any).learner_number,
      (learner as any).learnerNumber,
      (learner as any).student_number,
      (learner as any).studentNumber,
    ];

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    return null;
  };

  const getWhatsAppNumbers = (learner: Learner): string[] => {
    const possibleNumbers: Array<unknown> = [
      (learner as any).phone,
      (learner as any).whatsapp,
      (learner as any).contact?.phone,
      (learner as any).contact?.whatsapp,
      (learner as any).contact?.tel_home,
      (learner as any).contact?.tel_emergency,
    ];

    return possibleNumbers.filter((value): value is string => {
      if (typeof value !== 'string') return false;
      const cleaned = value.trim();
      if (!cleaned || cleaned.startsWith('011')) return false;
      return (cleaned.match(/\d/g) || []).length >= 7;
    });
  };

  const getBestWhatsAppNumber = (learner: Learner): string => {
    const numbers = getWhatsAppNumbers(learner);
    return numbers.length > 0 ? numbers[0] : '';
  };

  /* ─────────────────────── DERIVED DATA ─────────────────────── */

  const learnersWithWhatsApp = useMemo<Learner[]>(
    () => learners.filter(l => getWhatsAppNumbers(l).length > 0),
    [learners]
  );

  /* ───────────────────────── DEBUG ───────────────────────── */

  useEffect(() => {
    if (!learners.length) return;

  
    learners.slice(0, 3).forEach((l, index) => {
    
    });
  }, [learners]);

  /* ───────────────────────── ACTIONS ───────────────────────── */

  const handleSendTest = async (): Promise<void> => {
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
        grade: selectedGrade ?? undefined,
        countryCode: getCountryCode(school?.country),
      });

      setTestResult({ success: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({ success: false, message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendBulk = async (): Promise<void> => {
    setIsSendingBulk(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(customMessage);

      const recipients: BulkRecipient[] = learnersWithWhatsApp.map(learner => ({
        phone: getBestWhatsAppNumber(learner),
        name: learner.full_name,
        learner_number: getAccessionNumber(learner) ?? learner.id,
      }));

      const result = await WhatsAppBusinessService.sendBulkMessages({
        gradeIds: selectedGrades.map(g => g.id),
        schoolName,
        recipientNumbers: recipients,
        schoolId,
        userEmail,
        countryCode: getCountryCode(school?.country),
        senderId,
      });

      setTestResult({ success: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({ success: false, message });
    } finally {
      setIsSendingBulk(false);
    }
  };

  const handleSchedule = async (data: ScheduleData): Promise<void> => {
    setIsScheduling(true);

    try {
      await WhatsAppBusinessService.scheduleBulkMessage({
        gradeIds: selectedGrades.map(g => g.id),
        message: data.message,
        scheduledAt: data.scheduledAt,
        timezone: data.timezone,
        recipientNumbers: learnersWithWhatsApp.map(getBestWhatsAppNumber),
        schoolId,
        schoolName,
      });

      alert('WhatsApp message scheduled successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(message);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCopyWhatsAppNumbers = async (): Promise<void> => {
    const text = learnersWithWhatsApp
      .map(
        l =>
          `${l.full_name}: ${getBestWhatsAppNumber(l)} (${
            getAccessionNumber(l) ?? l.id
          })`
      )
      .join('\n');

    await navigator.clipboard.writeText(text);
  };

  const handleCopyPhoneNumbersOnly = async (): Promise<void> => {
    const text = learnersWithWhatsApp
      .map(l => getBestWhatsAppNumber(l))
      .join('\n');

    await navigator.clipboard.writeText(text);
  };

  /* ───────────────────────── RENDER ───────────────────────── */

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex border-b mb-6">
        {(['contacts', 'test', 'schedule'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'schedule' && learnersWithWhatsApp.length === 0}
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

      {activeTab === 'contacts' && (
        <div className="bg-green-50 border rounded-lg p-4">
          <div className="flex gap-2">
            <button onClick={handleCopyWhatsAppNumbers} className="btn-green">
              📋 Copy Names & Numbers
            </button>
            <button onClick={handleCopyPhoneNumbersOnly} className="btn-green-light">
              📞 Copy Numbers Only
            </button>
          </div>
        </div>
      )}

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
