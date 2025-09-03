import React, { useState, createContext, useContext, useEffect } from "react";

// ----------------------
// Steps Configuration
// ----------------------
const STEPS = [
  { id: "step1", name: "Create Grades", component: null }, // Will be set after component definitions
  { id: "step2", name: "Upload Learners", component: null },
  { id: "step3", name: "Send Invites", component: null },
  { id: "step4", name: "Completion", component: null },
];

// ----------------------
// Context Setup
// ----------------------
const OnboardingFlowContext = createContext(null);

const useOnboardingFlow = () => {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error("useOnboardingFlow must be used within an OnboardingFlowProvider");
  }
  return context;
};

// ----------------------
// Internal Provider
// ----------------------
const InternalOnboardingFlowProvider = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  const value = {
    currentStep: STEPS[currentStepIndex],
    currentStepIndex,
    totalSteps: STEPS.length,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    onboardingData,
    updateOnboardingData,
    isLoading,
    setIsLoading
  };

  return (
    <OnboardingFlowContext.Provider value={value}>
      {children}
    </OnboardingFlowContext.Provider>
  );
};

// ----------------------
// Helper Functions
// ----------------------
const generateGrades = (option) => {
  const gradeMap = {
    'Elementary (K-5)': ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    'Middle School (6-8)': ['6th Grade', '7th Grade', '8th Grade'],
    'High School (9-12)': ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    'Custom': []
  };
  return gradeMap[option] || [];
};

// ----------------------
// Step Components
// ----------------------
const Step1CreateGrades = ({ school, onboardingStatus, onNext, onBack, isLoading, onUpdateData }) => {
  const [grades, setGrades] = useState([]);

  const handleCreateGrades = async () => {
    if (onUpdateData) {
      onUpdateData({ grades });
    }
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Up Grades</h2>
        <p className="text-gray-600">Define the grade levels for {school?.name || 'your school'}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Setup Options</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'Custom'].map(option => (
              <button
                key={option}
                className="px-4 py-2 bg-white border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={() => setGrades(generateGrades(option))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {grades.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Selected Grades</h4>
            <div className="flex flex-wrap gap-2">
              {grades.map(grade => (
                <span key={grade} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {grade}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCreateGrades}
          disabled={grades.length === 0 || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

const Step2UploadLearners = ({ onNext, onBack, isLoading, onUpdateData }) => {
  const [file, setFile] = useState(null);

  const handleFileUpload = async () => {
    if (onUpdateData) {
      onUpdateData({ learnersFile: file });
    }
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Learners</h2>
        <p className="text-gray-600">Import your student roster using our template</p>
      </div>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">📁</span>
          </div>
          <p className="text-gray-600 mb-4">Drag & drop your CSV file here or</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
            Choose File
          </label>
          {file && (
            <p className="mt-4 text-sm text-green-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Download Template</h3>
          <p className="text-sm text-blue-700 mb-3">Ensure your file matches our required format</p>
          <button className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors">
            Download CSV Template
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button 
          onClick={onBack} 
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleFileUpload}
          disabled={!file || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Uploading...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

const Step3SendInvites = ({ onNext, onBack, isLoading, onUpdateData }) => {
  const [inviteMethod, setInviteMethod] = useState('email');

  const handleSendInvites = async () => {
    if (onUpdateData) {
      onUpdateData({ inviteMethod });
    }
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Invitations</h2>
        <p className="text-gray-600">Invite teachers and students to join your school</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'email', label: 'Email Invites', icon: '📧', description: 'Send individual email invitations' },
            { id: 'link', label: 'Shareable Link', icon: '🔗', description: 'Generate a join link to share' }
          ].map(option => (
            <div
              key={option.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                inviteMethod === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setInviteMethod(option.id)}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold mb-1">{option.label}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
          ))}
        </div>

        {inviteMethod === 'email' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Email Invitation Settings</h4>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Recipient email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Custom message (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
          </div>
        )}

        {inviteMethod === 'link' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Shareable Link</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value="https://yourplatform.com/join/school-123"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button 
          onClick={onBack} 
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSendInvites}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send Invites →'}
        </button>
      </div>
    </div>
  );
};

const StepCompletion = ({ onboardingStatus, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Setup Complete!</h2>
        <p className="text-gray-600 mb-8">
          Your school has been successfully set up. You can now start using all features.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-4">What's Next?</h3>
          <div className="space-y-3">
            {[
              'Explore the teacher dashboard',
              'Customize your school settings',
              'Add more courses and classes',
              'Invite additional staff members'
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={onBack} 
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Setup
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

// Update STEPS with components
STEPS[0].component = Step1CreateGrades;
STEPS[1].component = Step2UploadLearners;
STEPS[2].component = Step3SendInvites;
STEPS[3].component = StepCompletion;

// ----------------------
// Internal Content Component
// ----------------------
const OnboardingContent = ({ schools, onboardingStatus }) => {
  const { 
    currentStep, 
    currentStepIndex, 
    goToNextStep, 
    goToPreviousStep, 
    isLoading, 
    setIsLoading, 
    updateOnboardingData 
  } = useOnboardingFlow();

  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      goToNextStep();
    } catch (error) {
      console.error("Error in onboarding step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleUpdateData = (data) => {
    updateOnboardingData(data);
  };

  if (currentStep?.component) {
    const StepComponent = currentStep.component;
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">School Setup</h1>
              <div className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {STEPS.length}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-center flex-1 ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs font-medium">{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <StepComponent 
            school={schools?.[0]} 
            onboardingStatus={onboardingStatus}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
            onUpdateData={handleUpdateData}
          />
        </div>
      </div>
    );
  }
  
  return null;
};

// ----------------------
// Main OnboardingGuard Component
// ----------------------
export const OnboardingGuard = ({ 
  user, 
  schools, 
  onboardingStatus, 
  isOnboardingComplete, 
  isCheckingOnboarding 
}) => {
  if (isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  if (isOnboardingComplete) {
    return null;
  }

  return (
    <InternalOnboardingFlowProvider>
      <OnboardingContent 
        schools={schools} 
        onboardingStatus={onboardingStatus} 
      />
    </InternalOnboardingFlowProvider>
  );
};

// ----------------------
// Exports
// ----------------------
export { InternalOnboardingFlowProvider as OnboardingFlowProvider, useOnboardingFlow };
export default OnboardingGuard;