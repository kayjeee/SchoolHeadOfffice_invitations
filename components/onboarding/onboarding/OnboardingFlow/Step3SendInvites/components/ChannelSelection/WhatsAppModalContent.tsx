import React, { useEffect, useMemo, useState } from 'react';
import { MessageTesterSection } from './MessageTesterSection';
import { MessageScheduler, ScheduleData } from './MessageScheduler';
import WhatsAppBusinessService from '../../../../../../../lib/services/WhatsAppBusinessService';
import { Grade, Learner } from '../../types';

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

interface ContactRow {
  learner: Learner;
  whatsappNumber: string | null;
  accessionNumber: string;
  hasWhatsApp: boolean;
}

/* ───────────────────────── COMPONENT ───────────────────────── */

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
  /* ───────────────────────── STATE ───────────────────────── */

  const [activeTab, setActiveTab] =
    useState<'contacts' | 'test' | 'schedule'>('contacts');

  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [learnerNumber, setLearnerNumber] = useState('');
  const [parentName, setParentName] = useState('');

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const [testResult, setTestResult] = useState<unknown>(null);
  const [validationErrors] = useState<Record<string, string>>({});

  /* ───────────────────────── HELPERS ───────────────────────── */

  const getAccessionNumber = (learner: Learner): string => {
    const candidates = [
      (learner as any).accession_number,
      (learner as any).accessionNumber,
      (learner as any).learner_number,
      (learner as any).learnerNumber,
      (learner as any).student_number,
      (learner as any).studentNumber,
    ];

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return learner.id;
  };

  const getWhatsAppNumbers = (learner: Learner): string[] => {
    const rawValues: unknown[] = [
      (learner as any).phone,
      (learner as any).whatsapp,
      (learner as any).contact?.phone,
      (learner as any).contact?.whatsapp,
      (learner as any).contact?.tel_home,
      (learner as any).contact?.tel_emergency,
    ];

    return rawValues.filter((value): value is string => {
      if (typeof value !== 'string') return false;

      const cleaned = value.trim();
      if (!cleaned) return false;
      if (cleaned.startsWith('011')) return false; // landline heuristic
      return (cleaned.match(/\d/g) ?? []).length >= 7;
    });
  };

  const getBestWhatsAppNumber = (learner: Learner): string | null => {
    const numbers = getWhatsAppNumbers(learner);
    return numbers.length ? numbers[0] : null;
  };

  /* ─────────────────────── DERIVED DATA ─────────────────────── */

  const contacts: ContactRow[] = useMemo(() => {
    return learners.map(learner => {
      const whatsappNumber = getBestWhatsAppNumber(learner);

      return {
        learner,
        whatsappNumber,
        accessionNumber: getAccessionNumber(learner),
        hasWhatsApp: Boolean(whatsappNumber),
      };
    });
  }, [learners]);

  const learnersWithWhatsApp = useMemo(
    () => contacts.filter(c => c.hasWhatsApp),
    [contacts]
  );

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
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendBulk = async (): Promise<void> => {
    setIsSendingBulk(true);
    setTestResult(null);

    try {
      WhatsAppBusinessService.validateMessageTemplate(customMessage);

      const recipients: BulkRecipient[] = learnersWithWhatsApp.map(c => ({
        phone: c.whatsappNumber!,
        name: c.learner.full_name,
        learner_number: c.accessionNumber,
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
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
        recipientNumbers: learnersWithWhatsApp.map(c => c.whatsappNumber!),
        schoolId,
        schoolName,
      });

      alert('WhatsApp message scheduled successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCopyWhatsAppNumbers = async (): Promise<void> => {
    const text = learnersWithWhatsApp
      .map(
        c =>
          `${c.learner.full_name}: ${c.whatsappNumber} (${c.accessionNumber})`
      )
      .join('\n');

    await navigator.clipboard.writeText(text);
  };

  const handleCopyPhoneNumbersOnly = async (): Promise<void> => {
    const text = learnersWithWhatsApp
      .map(c => c.whatsappNumber)
      .join('\n');

    await navigator.clipboard.writeText(text);
  };

  /* ───────────────────────── RENDER ───────────────────────── */

  return (
    <div className="mt-6 border-t pt-6">
      {/* Tabs */}
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
            {tab === 'contacts' &&
              `👥 Contacts (${learners.length})`}
            {tab === 'test' && '🧪 Test Message'}
            {tab === 'schedule' && '📅 Schedule'}
          </button>
        ))}
      </div>

      {/* CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={handleCopyWhatsAppNumbers} className="btn-green">
              📋 Copy Names & Numbers
            </button>
            <button onClick={handleCopyPhoneNumbersOnly} className="btn-green-light">
              📞 Copy Numbers Only
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Learner</th>
                  <th className="p-2">Accession</th>
                  <th className="p-2">WhatsApp</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.learner.id} className="border-t">
                    <td className="p-2">{c.learner.full_name}</td>
                    <td className="p-2">{c.accessionNumber}</td>
                    <td className="p-2">
                      {c.whatsappNumber ?? '—'}
                    </td>
                    <td className="p-2">
                      {c.hasWhatsApp ? (
                        <span className="text-green-600">✔ Ready</span>
                      ) : (
                        <span className="text-red-500">✖ No WhatsApp</span>
                      )}
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No learners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEST TAB */}
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

      {/* SCHEDULE TAB */}
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
