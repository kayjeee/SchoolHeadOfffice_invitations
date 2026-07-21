
import React, { useState } from 'react';
import { Grade, Learner } from '../../types';
import { EmailTesterSection } from './EmailTesterSection';
import { EmailScheduler } from './EmailScheduler';
import EmailService from './services/EmailService';
import { logger } from './utils/logger';

interface EmailModalContentProps {
  learners: Learner[];
  grades: Grade[];
  schoolId: string;
  schoolName: string;
  userEmail?: string;
}

export const EmailModalContent: React.FC<EmailModalContentProps> = ({
  learners,
  grades,
  schoolId,
  schoolName,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'test' | 'schedule'>('contacts');
  const [testEmail, setTestEmail] = useState('');
  const [subject, setSubject] = useState(`Invitation to ${schoolName}`);
  const [message, setMessage] = useState(`You are invited to join the ${schoolName} community.`);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const learnersWithEmail = learners.filter(l => l.email);

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const result = await EmailService.sendTestEmail({ to: testEmail, schoolName, schoolId, userEmail });
      setTestResult({ success: true, ...result });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    }
    setIsSendingTest(false);
  };

  const handleSendBulk = async () => {
    setIsSendingBulk(true);
    setTestResult(null);
    try {
      const recipientEmails = learnersWithEmail.map(l => l.email as string);
      const result = await EmailService.sendBulkEmails({ schoolName, recipientEmails, schoolId, userEmail, gradeIds: grades.map(g => g.id) });
      setTestResult({ success: true, ...result });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    }
    setIsSendingBulk(false);
  };

  const handleSchedule = async (scheduleData: { subject:string, message: string, scheduledAt: string, timezone: string }) => {
    setIsScheduling(true);
    try {
      const recipientEmails = learnersWithEmail.map(l => l.email as string);
      await EmailService.scheduleBulkEmail({ ...scheduleData, recipientEmails, schoolId, schoolName, gradeIds: grades.map(g => g.id), body: scheduleData.message });
      alert('Email invitations scheduled successfully!');
    } catch (error: any) {
      alert(`Failed to schedule email invitations: ${error.message}`);
    }
    setIsScheduling(false);
  };

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Contacts ({learnersWithEmail.length})
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'test' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Test Email
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Schedule
        </button>
      </div>

      {activeTab === 'contacts' && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            📧 Email Contacts ({learnersWithEmail.length})
          </h4>
          <div className="max-h-60 overflow-y-auto border border-blue-200 rounded-lg bg-white">
            <table className="w-full text-sm">
              <thead className="bg-blue-100 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">
                    Learner Name
                  </th>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">
                    Email Address
                  </th>
                  <th className="text-left p-2 text-blue-800 font-medium border-b border-blue-200">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {learnersWithEmail.map((learner, index) => {
                  const grade = grades.find(g => g.id === learner.grade_id);
                  return (
                    <tr
                      key={learner.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                    >
                      <td className="p-2 border-b border-blue-100 text-gray-700">
                        {learner.full_name}
                      </td>
                      <td className="p-2 border-b border-blue-100 font-mono text-blue-700">
                        {learner.email}
                      </td>
                      <td className="p-2 border-b border-blue-100 text-gray-600">
                        {grade?.name || 'Unknown'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <EmailTesterSection
          testEmail={testEmail}
          onEmailChange={setTestEmail}
          subject={subject}
          onSubjectChange={setSubject}
          messageContent={message}
          onMessageChange={setMessage}
          onSendTest={handleSendTest}
          onSendBulk={handleSendBulk}
          isSending={isSendingTest}
          isSendingBulk={isSendingBulk}
          testResult={testResult}
          validationErrors={validationErrors}
          schoolName={schoolName}
          selectedGrade={null}
          totalRecipients={learnersWithEmail.length}
          canSendBulk={learnersWithEmail.length > 0}
        />
      )}

      {activeTab === 'schedule' && (
        <EmailScheduler
          onSchedule={handleSchedule}
          isScheduling={isScheduling}
          messageContent={message}
          subject={subject}
          totalRecipients={learnersWithEmail.length}
        />
      )}
    </div>
  );
};
