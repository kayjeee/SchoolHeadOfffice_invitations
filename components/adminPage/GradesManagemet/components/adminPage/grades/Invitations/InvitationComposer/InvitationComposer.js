import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageCircleHeart,
  School,
  GraduationCap,
  MessageCircle,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import MessageEditor from './MessageEditor';
import SchedulingOptions from './SchedulingOptions';
import PreviewPanel from './PreviewPanel';
import SendingControls from './SendingControls';
import WhatsAppMessageTester from './WhatsAppMessageTester';
import VideoRecordingStudio from './VideoRecordingStudio';
import { invitationService } from '../../../../../services/invitation/invitationService';

/**
 * InvitationComposer component - Fixed version that properly receives and displays grades
 */
const InvitationComposer = ({
  user = { name: 'John Doe' },
  schools = [],
  selectedSchool = null,
  selectedGrade: initialSelectedGrade = null,
  grades: propGrades = [],
  onInvitationSent,
  onClose, // Add onClose prop for modal management
}) => {
  const [invitationData, setInvitationData] = useState({
    recipients: [],
    subject: '',
    message: '',
    template: null,
    scheduledDate: null,
    sendImmediately: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(initialSelectedGrade);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [recordingType, setRecordingType] = useState('messaging');
  const [bulkSendResults, setBulkSendResults] = useState([]);

  // Debug logging to track props changes
  useEffect(() => {
    console.log('InvitationComposer - Props received:', {
      selectedSchool: selectedSchool ? { 
        id: selectedSchool.id, 
        name: selectedSchool.schoolName || selectedSchool.name 
      } : null,
      initialSelectedGrade: initialSelectedGrade ? { 
        id: initialSelectedGrade.id, 
        name: initialSelectedGrade.name 
      } : null,
      gradesCount: propGrades?.length || 0,
      grades: propGrades?.map(g => ({ 
        id: g.id, 
        name: g.name,
        studentCount: g.learners_count || g.current_enrollment || 0
      })) || [],
      userExists: !!user
    });
  }, [selectedSchool, initialSelectedGrade, propGrades, user]);

  // Memoize values to prevent unnecessary re-renders
  const currentSchoolName = useMemo(() => {
    return selectedSchool?.schoolName || selectedSchool?.name || schools[0]?.schoolName || schools[0]?.name || 'Your School';
  }, [selectedSchool, schools]);

  // Process grades to ensure consistent data structure
  const processedGrades = useMemo(() => {
    if (!propGrades || !Array.isArray(propGrades)) {
      console.warn('InvitationComposer: propGrades is not an array or is undefined', propGrades);
      return [];
    }

    return propGrades.map(grade => ({
      id: grade.id,
      name: grade.name || grade.gradeName || 'Unnamed Grade',
      description: grade.description || grade.gradeDescription || '',
      learnerCount: grade.learners_count || grade.current_enrollment || grade.studentCount || 0,
      // Include original grade object for reference
      original: grade
    }));
  }, [propGrades]);

  const steps = [
    { id: 1, name: 'Select Grade', icon: <GraduationCap size={16} />, color: 'blue' },
    { id: 2, name: 'Compose Message', icon: <MessageCircle size={16} />, color: 'green' },
    { id: 3, name: 'Schedule & Send', icon: <Users size={16} />, color: 'purple' },
    { id: 4, name: 'Results', icon: <CheckCircle size={16} />, color: 'green' },
  ];

  // Set initial selected grade if supplied and advance to step 2
  useEffect(() => {
    if (initialSelectedGrade && processedGrades.length > 0) {
      // Find the matching grade in processed grades
      const matchingGrade = processedGrades.find(g => g.id === initialSelectedGrade.id);
      if (matchingGrade) {
        setSelectedGrade(matchingGrade);
        setCurrentStep(2);
      } else {
        console.warn('Initial selected grade not found in processed grades:', initialSelectedGrade);
      }
    }
  }, [initialSelectedGrade, processedGrades]);

  // Update invitation data state
  const updateInvitationData = useCallback((field, value) => {
    setInvitationData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Validate input before sending
  const validateInvitation = useCallback(() => {
    const newErrors = {};
    
    if (!invitationData.recipients.length && !selectedGrade) {
      newErrors.recipients = 'Please select at least one recipient or grade';
    }
    if (!invitationData.subject?.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!invitationData.message?.trim()) {
      newErrors.message = 'Message content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [invitationData, selectedGrade]);

  // Send invitation API call
  const handleSendInvitation = useCallback(async () => {
    if (!validateInvitation()) return;
    
    setIsLoading(true);
    try {
      const result = await invitationService.sendInvitation({
        ...invitationData,
        gradeId: selectedGrade?.id,
        schoolId: selectedSchool?.id,
      });
      
      // Call the parent callback with results
      onInvitationSent?.(result);
      
      // Show success message or close modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setErrors({ general: error.message || 'Failed to send invitation' });
    } finally {
      setIsLoading(false);
    }
  }, [invitationData, selectedGrade, selectedSchool, validateInvitation, onInvitationSent, onClose]);

  // Bulk send API call
  const handleBulkSend = useCallback(async (sendOptions) => {
    if (!validateInvitation()) return;

    setIsSendingBulk(true);
    try {
      const results = await invitationService.bulkSendInvitations({
        ...invitationData,
        gradeId: selectedGrade?.id,
        schoolId: selectedSchool?.id,
        ...sendOptions,
      });
      
      setBulkSendResults(results);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      setErrors({ general: error.message || 'Failed to send invitations' });
    } finally {
      setIsSendingBulk(false);
    }
  }, [invitationData, selectedGrade, selectedSchool, validateInvitation]);

  // When a grade is selected
  const handleGradeSelect = useCallback((grade) => {
    console.log('Grade selected:', grade);
    setSelectedGrade(grade);
    setCurrentStep(2);
    // Clear any previous errors
    setErrors({});
  }, []);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !selectedGrade) {
      setErrors({ grade: 'Please select a grade before proceeding' });
      return;
    }
    setCurrentStep(prev => Math.min(4, prev + 1));
  }, [currentStep, selectedGrade]);

  const handleStartOver = useCallback(() => {
    setCurrentStep(1);
    setSelectedGrade(initialSelectedGrade || null);
    setBulkSendResults([]);
    setErrors({});
    setInvitationData({
      recipients: [],
      subject: '',
      message: '',
      template: null,
      scheduledDate: null,
      sendImmediately: true,
    });
  }, [initialSelectedGrade]);

  // Check if we have the minimum required data
  const hasRequiredData = selectedSchool && processedGrades.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircleHeart className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send Invitations</h2>
            <p className="text-sm text-gray-600">{currentSchoolName}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Show error if required data is missing */}
      {!hasRequiredData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-yellow-800 font-medium">Setup Required</h3>
            <p className="text-yellow-700 text-sm mt-1">
              {!selectedSchool && 'Please select a school first. '}
              {processedGrades.length === 0 && 'No grades are available for this school. Please create grades first.'}
            </p>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === step.id
                    ? 'text-blue-600'
                    : currentStep > step.id
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step.id
                      ? 'border-blue-600 bg-blue-50'
                      : currentStep > step.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-sm font-medium hidden sm:block">{step.name}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Grade to Invite</h3>
            
            {processedGrades.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No grades available</p>
                <p className="text-sm text-gray-500">
                  {!selectedSchool 
                    ? 'Please select a school first.' 
                    : 'Create grades in the Grades Management section to start sending invitations.'}
                </p>
                {!selectedSchool && (
                  <button
                    onClick={() => onClose?.()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Select School
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  Choose a grade to send invitations to all students in that grade.
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {processedGrades.map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => handleGradeSelect(grade)}
                      className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                        selectedGrade?.id === grade.id 
                          ? 'border-blue-600 bg-blue-50 shadow-sm ring-2 ring-blue-100' 
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <GraduationCap 
                          className={`flex-shrink-0 ${
                            selectedGrade?.id === grade.id ? 'text-blue-600' : 'text-gray-400'
                          }`} 
                          size={20} 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{grade.name}</div>
                          {grade.description && (
                            <div className="text-sm text-gray-500 truncate">{grade.description}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                            <Users size={12} />
                            <span>{grade.learnerCount} student{grade.learnerCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        {selectedGrade?.id === grade.id && (
                          <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors.grade && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.grade}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && selectedGrade && (
          <MessageEditor
            selectedGrade={selectedGrade}
            schoolName={currentSchoolName}
            subject={invitationData.subject}
            message={invitationData.message}
            template={invitationData.template}
            onSubjectChange={(subject) => updateInvitationData('subject', subject)}
            onMessageChange={(message) => updateInvitationData('message', message)}
            onTemplateChange={(template) => updateInvitationData('template', template)}
            onBack={handlePrevious}
            onNext={handleNext}
            onShowVideoRecorder={(type) => {
              setRecordingType(type);
              setShowVideoRecorder(true);
            }}
            onShowTemplateManager={() => setShowTemplateManager(true)}
            errors={{ subject: errors.subject, message: errors.message }}
          />
        )}

        {currentStep === 3 && selectedGrade && (
          <SchedulingOptions
            selectedGrade={selectedGrade}
            sendImmediately={invitationData.sendImmediately}
            scheduledDate={invitationData.scheduledDate}
            onSendImmediatelyChange={(immediate) => updateInvitationData('sendImmediately', immediate)}
            onScheduledDateChange={(date) => updateInvitationData('scheduledDate', date)}
            onBack={handlePrevious}
            onSend={handleBulkSend}
            isSending={isSendingBulk}
          />
        )}

        {currentStep === 4 && (
          <PreviewPanel
            results={bulkSendResults}
            invitationData={invitationData}
            selectedGrade={selectedGrade}
            recipientCount={selectedGrade?.learnerCount || 0}
            onBack={handlePrevious}
            onStartOver={handleStartOver}
          />
        )}
      </div>

      {/* Footer Navigation */}
      {hasRequiredData && (
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            {selectedGrade && (
              <div className="text-sm text-gray-500 text-center">
                <div>Selected: <span className="font-medium">{selectedGrade.name}</span></div>
                <div>{selectedGrade.learnerCount} students</div>
              </div>
            )}
            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
          </div>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 4 || (currentStep === 1 && !selectedGrade)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <SendingControls
              currentStep={currentStep}
              onStartOver={handleStartOver}
              onSend={handleSendInvitation}
              isLoading={isLoading}
              disabled={!selectedGrade}
              recipientCount={selectedGrade?.learnerCount || 0}
            />
          )}
        </div>
      )}

      {/* Global Error */}
      {errors.general && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-800 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
};

export default InvitationComposer;