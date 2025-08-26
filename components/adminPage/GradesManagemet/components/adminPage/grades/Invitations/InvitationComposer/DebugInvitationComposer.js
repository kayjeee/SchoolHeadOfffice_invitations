import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageCircleHeart,
  GraduationCap,
  MessageCircle,
  Users,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';

/**
 * DebugInvitationComposer - Simplified version with extensive logging
 */
const DebugInvitationComposer = ({
  user = { name: 'John Doe' },
  schools = [],
  selectedSchool = null,
  selectedGrade: initialSelectedGrade = null,
  grades: propGrades = [],
  onInvitationSent,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(initialSelectedGrade);
  const [errors, setErrors] = useState({});

  // EXTENSIVE DEBUG LOGGING
  useEffect(() => {
    console.log('=== INVITATION COMPOSER DEBUG INFO ===');
    console.log('Selected School:', selectedSchool);
    console.log('Initial Selected Grade:', initialSelectedGrade);
    console.log('Grades passed:', propGrades);
    console.log('Grades count:', propGrades.length);
    console.log('User:', user);
    console.log('Current step:', currentStep);
    console.log('Selected grade:', selectedGrade);
    console.log('=====================================');
  }, [selectedSchool, initialSelectedGrade, propGrades, user, currentStep, selectedGrade]);

  // Process grades to ensure consistent structure
  const processedGrades = useMemo(() => {
    console.log('Processing grades:', propGrades);
    
    if (!propGrades || !Array.isArray(propGrades)) {
      console.warn('Grades is not an array:', propGrades);
      return [];
    }

    return propGrades.map(grade => ({
      id: grade.id,
      name: grade.name || grade.gradeName || 'Unnamed Grade',
      description: grade.description || grade.gradeDescription || '',
      learnerCount: grade.learners_count || grade.current_enrollment || grade.studentCount || 0,
      original: grade // Keep original for reference
    }));
  }, [propGrades]);

  const steps = [
    { id: 1, name: 'Select Grade', icon: <GraduationCap size={16} /> },
    { id: 2, name: 'Compose Message', icon: <MessageCircle size={16} /> },
    { id: 3, name: 'Schedule & Send', icon: <Users size={16} /> },
    { id: 4, name: 'Results', icon: <CheckCircle size={16} /> },
  ];

  // Set initial selected grade
  useEffect(() => {
    if (initialSelectedGrade && processedGrades.length > 0) {
      const matchingGrade = processedGrades.find(g => g.id === initialSelectedGrade.id);
      if (matchingGrade) {
        console.log('Setting initial selected grade:', matchingGrade);
        setSelectedGrade(matchingGrade);
        setCurrentStep(2);
      }
    }
  }, [initialSelectedGrade, processedGrades]);

  const handleGradeSelect = useCallback((grade) => {
    console.log('Grade selected:', grade);
    setSelectedGrade(grade);
    setCurrentStep(2);
    setErrors({});
  }, []);

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
    setErrors({});
  }, [initialSelectedGrade]);

  const hasRequiredData = selectedSchool && processedGrades.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircleHeart className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send Invitations</h2>
            <p className="text-sm text-gray-600">
              {selectedSchool?.schoolName || selectedSchool?.name || 'No school selected'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Data Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800 font-medium mb-2">Data Status:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <div>School: {selectedSchool ? '✓ Available' : '✗ Missing'}</div>
          <div>Grades: {processedGrades.length} available</div>
          <div>Selected Grade: {selectedGrade ? selectedGrade.name : 'None'}</div>
          <div>Step: {currentStep} of {steps.length}</div>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`flex items-center space-x-2 ${
                currentStep === step.id ? 'text-blue-600' :
                currentStep > step.id ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep === step.id ? 'border-blue-600 bg-blue-50' :
                  currentStep > step.id ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
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

      {/* Step 1: Select Grade */}
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
                  : 'No grades found for this school.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {processedGrades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => handleGradeSelect(grade)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedGrade?.id === grade.id 
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' 
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GraduationCap 
                        className={selectedGrade?.id === grade.id ? 'text-blue-600' : 'text-gray-400'} 
                        size={20} 
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{grade.name}</div>
                        {grade.description && (
                          <div className="text-sm text-gray-500">{grade.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {grade.learnerCount} students
                        </div>
                      </div>
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

      {/* Steps 2-4 Placeholder */}
      {currentStep >= 2 && (
        <div className="text-center py-12">
          <div className="text-2xl font-bold text-gray-700 mb-2">Step {currentStep}</div>
          <p className="text-gray-600 mb-4">
            {currentStep === 2 && 'Compose Message UI would appear here'}
            {currentStep === 3 && 'Scheduling Options UI would appear here'}
            {currentStep === 4 && 'Results Preview UI would appear here'}
          </p>
          {selectedGrade && (
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <p className="text-sm text-gray-700">
                Selected: <strong>{selectedGrade.name}</strong> ({selectedGrade.learnerCount} students)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !selectedGrade}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleStartOver}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
};

export default DebugInvitationComposer;