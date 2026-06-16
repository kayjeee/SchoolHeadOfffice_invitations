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

const getLearnerFullName = (learner: Learner): string => {
  if (learner.full_name && learner.full_name !== 'Unnamed Learner') {
    return learner.full_name;
  }
  const fName = (learner as any).firstName || learner.first_name || '';
  const lName = (learner as any).lastName || learner.last_name || '';
  const fullName = `${fName} ${lName}`.trim();
  return fullName || 'Unnamed Learner';
};

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
      (learner as any).contact?.telegram,
      (learner as any).telegram,
      (learner as any).mobile,
      (learner as any).cell,
      (learner as any).contact_number,
    ];

    // Heuristic: If accession number looks like a phone number, consider it
    const accession = getAccessionNumber(learner);
    if (accession && /^\d{10,13}$/.test(accession.replace(/\D/g, ''))) {
      rawValues.push(accession);
    }

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
        name: getLearnerFullName(c.learner),
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
          `${getLearnerFullName(c.learner)}: ${c.whatsappNumber} (${c.accessionNumber})`
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
    <div className="mt-6 border-t pt-6 text-gray-900">
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
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <button
              onClick={handleCopyWhatsAppNumbers}
              disabled={learnersWithWhatsApp.length === 0}
              className="btn-green disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📋 Copy Names & Numbers
            </button>
            <button onClick={handleCopyPhoneNumbersOnly} className="btn-green-light">
              📞 Copy Numbers Only
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm text-gray-900">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="p-3 border-b">Learner</th>
                  <th className="p-3 border-b">Accession</th>
                  <th className="p-3 border-b">WhatsApp</th>
                  <th className="p-3 border-b">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map(c => (
                  <tr key={c.learner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-900">{getLearnerFullName(c.learner)}</td>
                    <td className="p-3 text-gray-600">{c.accessionNumber}</td>
                    <td className="p-3 font-mono text-gray-900">
                      {c.whatsappNumber ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-3">
                      {c.hasWhatsApp ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✔ Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          ✖ No WhatsApp
                        </span>
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
