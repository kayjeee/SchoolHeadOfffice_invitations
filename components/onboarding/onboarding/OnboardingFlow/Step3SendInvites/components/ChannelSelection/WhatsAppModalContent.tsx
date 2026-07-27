import React, { useState, useEffect, useRef } from 'react';
import { MessageTesterSection } from './MessageTesterSection';
import { MessageScheduler, ScheduleData } from './MessageScheduler';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
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

  // Selection state for learners with WhatsApp
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<Set<string>>(new Set());

  const getWhatsAppNumbers = React.useCallback((learner: any) => {
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
  }, []);

  const learnersWithWhatsApp = React.useMemo(() => {
    return learners.filter(learner => getWhatsAppNumbers(learner).length > 0);
  }, [learners, getWhatsAppNumbers]);

  // Initialize and synchronize selectedLearnerIds when learnersWithWhatsApp loads/changes
  useEffect(() => {
    setSelectedLearnerIds(new Set(learnersWithWhatsApp.map(l => l.id)));
  }, [learnersWithWhatsApp]);

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

      // Filter learnersWithWhatsApp to only include selected ones
      const selectedLearners = learnersWithWhatsApp.filter(l => selectedLearnerIds.has(l.id));

      const recipientNumbers = selectedLearners.map(l => ({
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

  // Helper selectors/handlers for table header & row checkboxes
  const allSelected = learnersWithWhatsApp.length > 0 && selectedLearnerIds.size === learnersWithWhatsApp.length;
  const someSelected = selectedLearnerIds.size > 0 && selectedLearnerIds.size < learnersWithWhatsApp.length;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedLearnerIds(new Set());
    } else {
      setSelectedLearnerIds(new Set(learnersWithWhatsApp.map(l => l.id)));
    }
  };

  const handleToggleSelectLearner = (learnerId: string) => {
    const next = new Set(selectedLearnerIds);
    if (next.has(learnerId)) {
      next.delete(learnerId);
    } else {
      next.add(learnerId);
    }
    setSelectedLearnerIds(next);
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

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button onClick={handleCopyWhatsAppNumbers} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors">
              📋 Copy Names & Numbers
            </button>
            <button onClick={handleCopyPhoneNumbersOnly} className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors">
              📞 Copy Numbers Only
            </button>
            <button
              onClick={handleSendBulk}
              disabled={selectedLearnerIds.size === 0 || isSendingBulk}
              className="flex-1 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center transition-colors"
            >
              {isSendingBulk ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} /> Sending...
                </>
              ) : (
                <>
                  🚀 Send Bulk WhatsApp ({selectedLearnerIds.size})
                </>
              )}
            </button>
          </div>

          {/* Result Display inside Contacts tab */}
          {testResult && (
            <div
              className={`mb-4 border rounded-lg p-4 ${
                testResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : (
                  <AlertCircle className="text-red-600" size={16} />
                )}
                <span
                  className={`font-medium ${
                    testResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {testResult.success ? "Success!" : "Error"}
                </span>
              </div>

              <p
                className={`text-sm ${
                  testResult.success ? "text-green-700" : "text-red-700"
                }`}
              >
                {testResult.message}
              </p>

              {testResult.success && testResult.magicLink && (
                <p className="text-xs text-green-600 mt-1 break-all">
                  Magic Link:{" "}
                  <a
                    href={testResult.magicLink}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {testResult.magicLink}
                  </a>
                </p>
              )}

              {testResult.error && (
                <p className="text-xs text-red-600 mt-1">
                  Error: {testResult.error}
                </p>
              )}

              {testResult.bulkResult && (
                <div className="mt-2 text-xs text-green-700">
                  <p>✅ Sent: {testResult.bulkResult.sentCount}</p>
                  <p>❌ Failed: {testResult.bulkResult.failedCount}</p>
                  <p>📊 Total: {testResult.bulkResult.totalCount}</p>
                </div>
              )}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-green-100 sticky top-0">
                <tr>
                  <th className="p-2 border-b border-green-200 text-center w-12">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-green-300 text-green-600 focus:ring-green-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">Learner Name</th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">WhatsApp Number</th>
                  <th className="text-left p-2 text-green-800 font-medium border-b border-green-200">Grade</th>
                </tr>
              </thead>
              <tbody>
                {learnersWithWhatsApp.map((learner, index) => {
                  const isSelected = selectedLearnerIds.has(learner.id);
                  return (
                    <tr key={learner.id} className={index % 2 === 0 ? 'bg-white hover:bg-green-50/50' : 'bg-green-50 hover:bg-green-100/50'}>
                      <td className="p-2 border-b border-green-100 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectLearner(learner.id)}
                          className="rounded border-green-300 text-green-600 focus:ring-green-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-2 border-b border-green-100 text-gray-700">{learner.full_name}</td>
                      <td className="p-2 border-b border-green-100 font-mono text-green-700">{getBestWhatsAppNumber(learner)}</td>
                      <td className="p-2 border-b border-green-100 text-gray-600">{grades.find(g => g.id === learner.grade_id)?.name || 'Unknown'}</td>
                    </tr>
                  );
                })}
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
