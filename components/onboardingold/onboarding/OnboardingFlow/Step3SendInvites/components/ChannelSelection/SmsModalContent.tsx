import React, { useState } from 'react';
import { MessageTesterSection } from './MessageTesterSection';
import { MessageScheduler, ScheduleData } from './MessageScheduler';
import SmsService from '../../../../../../../lib/services/SmsService';
import { Grade, Learner } from '../../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface SmsModalContentProps {
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
}

export const SmsModalContent: React.FC<SmsModalContentProps> = ({
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
  const [smsSupplier, setSmsSupplier] = useState<'winsms' | 'bulksms'>('winsms');

  const getPhoneNumbers = (learner: any) => {
    const phoneFields = [
      learner.phone,
      learner.whatsapp,
      learner.contact?.phone,
      learner.contact?.whatsapp,
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

  const learnersWithSms = learners.filter(learner => getPhoneNumbers(learner).length > 0);

  const getBestPhoneNumber = (learner: any): string => {
    const numbers = getPhoneNumbers(learner);
    return numbers[0] || 'No number';
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const result = await SmsService.sendTestMessage({
        to: testPhoneNumber.replace(/\s+/g, ''),
        schoolName,
        schoolId,
        userEmail,
        supplier: smsSupplier,
        learnerNumber,
        parentName,
        gradeId: selectedGrade?.id,
        sender_id: senderId,
      });
      setTestResult({ success: true, message: 'Test SMS sent successfully!', ...result });
    } catch (error: any) {
      setTestResult({ success: false, message: 'Failed to send test SMS.', error: error.message });
    }
    setIsSendingTest(false);
  };

  const handleSendBulk = async () => {
    setIsSendingBulk(true);
    setTestResult(null);
    try {
      const recipients = learnersWithSms.map(l => ({
        phone: getBestPhoneNumber(l),
        name: l.full_name,
        learner_number: l.accession_number,
      }));
      const result = await SmsService.sendBulkMessages({
        schoolName,
        recipients,
        schoolId,
        userEmail,
        supplier: smsSupplier,
        gradeIds: selectedGrades.map(g => g.id),
        senderId,
      });
      setTestResult({
        success: true,
        message: 'Bulk SMS sent successfully!',
        bulkResult: {
          sentCount: result.sentCount,
          failedCount: result.failedCount,
          totalCount: recipients.length
        }
      });
    } catch (error: any) {
      setTestResult({ success: false, message: 'Failed to send bulk SMS.', error: error.message });
    }
    setIsSendingBulk(false);
  };

  const handleSchedule = async (scheduleData: ScheduleData) => {
    setIsScheduling(true);
    try {
      const recipientNumbers = learnersWithSms.map(l => getBestPhoneNumber(l));
      await SmsService.scheduleBulkMessage({
        gradeIds: selectedGrades.map(g => g.id),
        message: scheduleData.message,
        scheduledAt: scheduleData.scheduledAt,
        timezone: scheduleData.timezone,
        recipientNumbers,
        schoolId,
        schoolName,
        supplier: smsSupplier,
        userEmail,
      });
      alert('SMS scheduled successfully!');
    } catch (error: any) {
      alert(`Failed to schedule SMS: ${error.message}`);
    }
    setIsScheduling(false);
  };

  return (
    <div className="mt-6 border-t pt-6">
      <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select SMS Supplier</label>
        <div className="flex gap-4">
          {(['winsms', 'bulksms'] as const).map(supplier => (
            <label key={supplier} className="flex items-center">
              <input
                type="radio"
                name="smsSupplier"
                value={supplier}
                checked={smsSupplier === supplier}
                onChange={() => setSmsSupplier(supplier)}
                className="mr-2"
              />
              {supplier === 'winsms' ? 'WinSMS' : 'BulkSMS'}
            </label>
          ))}
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          👥 Contacts ({learnersWithSms.length})
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
          disabled={learnersWithSms.length === 0}
        >
          📅 Schedule
        </button>
      </div>

      {activeTab === 'contacts' && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">💬 SMS Contacts ({learnersWithSms.length})</h4>
          <div className="max-h-60 overflow-y-auto border border-blue-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-blue-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">Learner Name</th>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">Phone Number</th>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">Grade</th>
                </tr>
              </thead>
              <tbody>
                {learnersWithSms.map((learner, index) => (
                  <tr key={learner.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                    <td className="p-2 border-b border-blue-100 text-gray-700">{learner.full_name}</td>
                    <td className="p-2 border-b border-blue-100 font-mono text-blue-700">{getBestPhoneNumber(learner)}</td>
                    <td className="p-2 border-b border-blue-100 text-gray-600">{grades.find(g => g.id === learner.grade_id)?.name || 'Unknown'}</td>
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
          invitedVia="sms"
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
          totalRecipients={learnersWithSms.length}
          canSendBulk={learnersWithSms.length > 0}
        />
      )}

      {activeTab === 'schedule' && (
        <MessageScheduler
          onSchedule={handleSchedule}
          isScheduling={isScheduling}
          messageContent={customMessage}
          totalRecipients={learnersWithSms.length}
        />
      )}
    </div>
  );
};
