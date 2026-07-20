import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'contacts' | 'test' | 'schedule'>('contacts');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [learnerNumber, setLearnerNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const getWhatsAppNumbers = (learner: any) => {
    const phoneFields = [
      learner.phone,
      learner.whatsapp,
      learner.mobile,
      learner.cell,
      learner.contact_number,
      learner.contact?.phone,
      learner.contact?.whatsapp,
      learner.contact?.mobile,
      learner.contact?.cell,
      learner.contact?.contact_number,
      learner.contact?.tel_home,
      learner.contact?.tel_emergency,
      learner.contact?.telegram
    ];

    return phoneFields.filter(phone => {
      if (!phone || typeof phone !== 'string') return false;
      const cleanPhone = phone.trim();
      if (cleanPhone === '' || cleanPhone.startsWith('011')) return false;
      const digitCount = (cleanPhone.match(/\d/g) || []).length;
      return digitCount >= 7;
    });
  };

  const learnersWithWhatsApp = learners.filter(learner => getWhatsAppNumbers(learner).length > 0);

  const getBestWhatsAppNumber = (learner: any): string => {
    const numbers = getWhatsAppNumbers(learner);
    return numbers[0] || 'No number';
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      WhatsAppBusinessService.validateMessageTemplate(customMessage);
      const countryCode = getCountryCode(school?.country);
      const result = await WhatsAppBusinessService.sendTestMessage({
        to: testPhoneNumber.replace(/\s+/g, ''),
        schoolId,
        userEmail,
        schoolName,
        learnerNumber,
        parentName,
        sender_id: senderId,
        grade: selectedGrade || undefined,
        countryCode,
      });
      setTestResult({ success: true, message: 'Test message sent successfully! Check your WhatsApp.', ...result });
    } catch (error: any) {
      setTestResult({ success: false, message: 'Failed to send test message.', error: error.message });
    }
    setIsSendingTest(false);
  };

  const handleSendBulk = async () => {
    setIsSendingBulk(true);
    setTestResult(null);
    try {
      WhatsAppBusinessService.validateMessageTemplate(customMessage);
      const countryCode = getCountryCode(school?.country);
      const recipientNumbers = learnersWithWhatsApp.map(l => ({
        phone: getBestWhatsAppNumber(l),
        name: l.full_name,
        learner_number: l.accession_number,
      }));
      const result = await WhatsAppBusinessService.sendBulkMessages({
        gradeIds: selectedGrades.map(g => g.id),
        schoolName,
        recipientNumbers,
        schoolId,
        userEmail,
        countryCode,
        senderId,
      });
      setTestResult({
        success: true,
        message: 'Bulk messages sent successfully!',
        bulkResult: {
          sentCount: result.sentCount,
          failedCount: result.failedCount,
          totalCount: recipientNumbers.length
        }
      });
    } catch (error: any) {
      setTestResult({ success: false, message: 'Failed to send bulk messages.', error: error.message });
    }
    setIsSendingBulk(false);
  };

  const handleSchedule = async (scheduleData: ScheduleData) => {
    setIsScheduling(true);
    try {
      const recipientNumbers = learnersWithWhatsApp.map(l => getBestWhatsAppNumber(l));
      await WhatsAppBusinessService.scheduleBulkMessage({
        gradeIds: selectedGrades.map(g => g.id),
        message: scheduleData.message,
        scheduledAt: scheduleData.scheduledAt,
        timezone: scheduleData.timezone,
        recipientNumbers,
        schoolId,
        schoolName,
      });
      alert('WhatsApp message scheduled successfully!');
    } catch (error: any) {
      alert(`Failed to schedule WhatsApp message: ${error.message}`);
    }
    setIsScheduling(false);
  };

  const handleCopyWhatsAppNumbers = async () => {
    const numbers = learnersWithWhatsApp.map(l => `${l.full_name}: ${getBestWhatsAppNumber(l)}`).join('\n');
    await navigator.clipboard.writeText(numbers);
  };

  const handleCopyPhoneNumbersOnly = async () => {
    const numbers = learnersWithWhatsApp.map(l => getBestWhatsAppNumber(l)).join('\n');
    await navigator.clipboard.writeText(numbers);
  };

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          👥 Contacts ({learnersWithWhatsApp.length})
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'test' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          🧪 Test Message
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          disabled={learnersWithWhatsApp.length === 0}
        >
          📅 Schedule
        </button>
      </div>

      {activeTab === 'contacts' && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">💚 WhatsApp Contacts ({learnersWithWhatsApp.length})</h4>
          <div className="flex gap-2 mb-4">
            <button onClick={handleCopyWhatsAppNumbers} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">📋 Copy Names & Numbers</button>
            <button onClick={handleCopyPhoneNumbersOnly} className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">📞 Copy Numbers Only</button>
          </div>
          <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-green-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">Learner Name</th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">WhatsApp Number</th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">Grade</th>
                </tr>
              </thead>
              <tbody>
                {learnersWithWhatsApp.map((learner, index) => (
                  <tr key={learner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                    <td className="p-2 border-b border-green-100 text-gray-700">{learner.full_name}</td>
                    <td className="p-2 border-b border-green-100 font-mono text-green-700">{getBestWhatsAppNumber(learner)}</td>
                    <td className="p-2 border-b border-green-100 text-gray-600">{grades.find(g => g.id === learner.grade_id)?.name || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
