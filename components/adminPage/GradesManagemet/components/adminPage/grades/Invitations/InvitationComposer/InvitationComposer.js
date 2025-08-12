import React, { useState, useEffect } from 'react';
import {
  MessageCircleHeart,
  School,
  GraduationCap,
  MessageCircle,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import RecipientSelector from './RecipientSelector';
import MessageEditor from './MessageEditor';
import SchedulingOptions from './SchedulingOptions';
import PreviewPanel from './PreviewPanel';
import SendingControls from './SendingControls';
import WhatsAppMessageTester from './WhatsAppMessageTester';
import VideoRecordingStudio from './VideoRecordingStudio';
import { invitationService } from '../../../../../services/invitation/invitationService';

/**
 * Main InvitationComposer component that orchestrates the invitation creation process
 * This component manages the overall state and coordinates between sub-components
 */
const InvitationComposer = ({ 
  gradeId, 
  onInvitationSent, 
  onClose,
  user = { name: 'John Doe' },
  schools = [{ schoolName: 'Greenfield Primary School', id: '1' }],
  selectedSchool = null,
  grades = []
}) => {
  const [invitationData, setInvitationData] = useState({
    recipients: [],
    subject: '',
    message: '',
    template: null,
    scheduledDate: null,
    sendImmediately: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [recordingType, setRecordingType] = useState('messaging');
  const [bulkSendResults, setBulkSendResults] = useState([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  const currentSchoolName = selectedSchool?.schoolName || schools[0]?.schoolName || 'Your School';

  const steps = [
    { id: 1, name: 'Select Grade', icon: <GraduationCap size={16} />, color: 'blue' },
    { id: 2, name: 'Test WhatsApp', icon: <MessageCircle size={16} />, color: 'green' },
    { id: 3, name: 'Bulk Send', icon: <Users size={16} />, color: 'purple' },
    { id: 4, name: 'Results', icon: <CheckCircle size={16} />, color: 'green' }
  ];

  // Handle data updates from child components
  const updateInvitationData = (field, value) => {
    setInvitationData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors when data is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate invitation data
  const validateInvitation = () => {
    const newErrors = {};
    
    if (!invitationData.recipients.length && !selectedGrade) {
      newErrors.recipients = 'Please select at least one recipient or grade';
    }
    
    if (!invitationData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!invitationData.message.trim()) {
      newErrors.message = 'Message content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sending invitation
  const handleSendInvitation = async () => {
    if (!validateInvitation()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await invitationService.sendInvitation({
        ...invitationData,
        gradeId: gradeId || selectedGrade?.id
      });
      
      onInvitationSent?.(result);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk send
  const handleBulkSend = async (sendOptions) => {
    setIsSendingBulk(true);
    try {
      const results = await invitationService.bulkSendInvitations({
        ...invitationData,
        gradeId: selectedGrade?.id,
        ...sendOptions
      });
      setBulkSendResults(results);
      setCurrentStep(4);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSendingBulk(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {showVideoRecorder && (
        <VideoRecordingStudio 
          onClose={() => setShowVideoRecorder(false)} 
          recordingType={recordingType} 
        />
      )}
      
      {showTemplateManager && (
        <WhatsAppMessageTester 
          onClose={() => setShowTemplateManager(false)} 
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageCircleHeart className="text-blue-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Invitation Composer</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <School size={16} />
              <span>{currentSchoolName}</span>
            </div>
          </div>
          
          {onClose && (
            <button 
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              onClick={onClose}
              aria-label="Close invitation composer"
            >
              ×
            </button>
          )}
        </div>

        {/* Stepper Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center space-x-3 ${
                  currentStep === step.id 
                    ? 'text-blue-600' 
                    : currentStep > step.id 
                    ? 'text-green-600' 
                    : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step.id
                      ? 'border-blue-600 bg-blue-50'
                      : currentStep > step.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.name}</p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            {currentStep === 1 && (
              <RecipientSelector
                gradeId={gradeId}
                grades={grades}
                selectedGrade={selectedGrade}
                selectedRecipients={invitationData.recipients}
                onGradeSelect={(grade) => {
                  setSelectedGrade(grade);
                  setCurrentStep(2);
                }}
                onRecipientsChange={(recipients) => updateInvitationData('recipients', recipients)}
                error={errors.recipients}
              />
            )}
            
            {currentStep === 2 && (
              <MessageEditor
                selectedGrade={selectedGrade}
                schoolName={currentSchoolName}
                subject={invitationData.subject}
                message={invitationData.message}
                template={invitationData.template}
                onSubjectChange={(subject) => updateInvitationData('subject', subject)}
                onMessageChange={(message) => updateInvitationData('message', message)}
                onTemplateChange={(template) => updateInvitationData('template', template)}
                onBack={() => setCurrentStep(1)}
                onNext={() => setCurrentStep(3)}
                onShowVideoRecorder={(type) => {
                  setRecordingType(type);
                  setShowVideoRecorder(true);
                }}
                onShowTemplateManager={() => setShowTemplateManager(true)}
                errors={{ subject: errors.subject, message: errors.message }}
              />
            )}
            
            {currentStep === 3 && (
              <SchedulingOptions
                selectedGrade={selectedGrade}
                sendImmediately={invitationData.sendImmediately}
                scheduledDate={invitationData.scheduledDate}
                onSendImmediatelyChange={(immediate) => updateInvitationData('sendImmediately', immediate)}
                onScheduledDateChange={(date) => updateInvitationData('scheduledDate', date)}
                onBack={() => setCurrentStep(2)}
                onSend={handleBulkSend}
                isSending={isSendingBulk}
              />
            )}
            
            {currentStep === 4 && (
              <PreviewPanel
                results={bulkSendResults}
                invitationData={invitationData}
                recipientCount={invitationData.recipients.length || selectedGrade?.studentCount || 0}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={currentStep === 4}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <SendingControls
                currentStep={currentStep}
                onStartOver={() => {
                  setCurrentStep(1);
                  setSelectedGrade(null);
                  setBulkSendResults([]);
                  setInvitationData({
                    recipients: [],
                    subject: '',
                    message: '',
                    template: null,
                    scheduledDate: null,
                    sendImmediately: true
                  });
                }}
                onSend={handleSendInvitation}
                isLoading={isLoading}
                disabled={!invitationData.recipients.length && !selectedGrade}
                recipientCount={invitationData.recipients.length || selectedGrade?.studentCount || 0}
              />
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.general}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationComposer;