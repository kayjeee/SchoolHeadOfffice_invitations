// Step3SendInvites/index.tsx
import React from 'react';
import { useStepState } from './hooks/useStepState';
import { useFormData } from './hooks/useFormData';
import { StepIndicator } from './components/UI/StepIndicator';
import { LearnerSelection } from './components/LearnerSelection';
import { ChannelSelection } from './components/ChannelSelection';
import { MessageComposer } from './components/MessageComposer';
import { InviteResults } from './components/InviteResults';
import { LoadingState, ErrorState } from './components/UI';
import { Step3SendInvitesProps } from './types';

const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({
  onNext,
  onBack,
  isLoading,
  onUpdateData,
  school,
  user,
}) => {
  const {
    currentStep,
    canProceedToNext,
    validationErrors,
    goNext,
    goBack
  } = useStepState({ onNext, onBack, onUpdateData });

  const {
    // State
    grades,
    selectedGrades,
    learners,
    selectedChannels,
    inviteMessage,
    prCodes,
    inviteLinks,
    isLoadingGrades,
    isLoadingLearners,
    isGeneratingCodes,
    gradesError,
    
    // Actions
    handleGradeSelection,
    handleSelectAllGrades,
    handleChannelSelection,
    handleSelectAllChannels,
    setInviteMessage,
    handleReloadGrades,
    handleSendInvites,
    
    // Helpers
    getPrCodeStatus
  } = useFormData({ school, currentStep });

  const renderStepContent = () => {
    if (!school?.id) {
      return (
        <ErrorState
          title="Configuration Error"
          message="School information is required to load grades."
          details={`Current school: ${school ? JSON.stringify(school) : "Not provided"}`}
        />
      );
    }

    if (isLoadingGrades) {
      return <LoadingState message="Loading grades..." />;
    }

    switch (currentStep) {
      case "grade-selection":
        return (
          <LearnerSelection
            grades={grades}
            selectedGrades={selectedGrades}
            learners={learners}
            isLoadingLearners={isLoadingLearners}
            gradesError={gradesError}
            prCodes={prCodes}
            isGeneratingCodes={isGeneratingCodes}
            onGradeSelection={handleGradeSelection}
            onSelectAllGrades={handleSelectAllGrades}
            onReloadGrades={handleReloadGrades}
            getPrCodeStatus={getPrCodeStatus}
          />
        );

      case "channel-selection":
        return (
          <ChannelSelection
            selectedChannels={selectedChannels}
            learners={learners}
            onChannelSelection={handleChannelSelection}
            onSelectAllChannels={handleSelectAllChannels}
          />
        );

      case "message-composer":
        return (
          <MessageComposer
            inviteMessage={inviteMessage}
            onInviteMessageChange={setInviteMessage}
            selectedGrades={selectedGrades}
            grades={grades}
            prCodes={prCodes}
            inviteLinks={inviteLinks}
            learners={learners}
            selectedChannels={selectedChannels}
            school={school}
            getPrCodeStatus={getPrCodeStatus}
          />
        );

      case "results":
        return (
          <InviteResults
            selectedGrades={selectedGrades}
            grades={grades}
            learners={learners}
            selectedChannels={selectedChannels}
            inviteMessage={inviteMessage}
            prCodes={prCodes}
            inviteLinks={inviteLinks}
            school={school}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Send Learner Invites
        </h2>
        <p className="text-gray-600">
          Invite learners from selected grades to join {school?.name || "your school"} portal
        </p>
      </div>

      <StepIndicator currentStep={currentStep} />

      {renderStepContent()}

      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 space-y-1">
            {validationErrors.map((err, idx) => (
              <div key={idx} className="text-sm">• {err}</div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          disabled={!canProceedToNext || isLoading || isGeneratingCodes}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading || isGeneratingCodes
            ? "Processing..."
            : currentStep === "message-composer"
            ? "Send Invites →"
            : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default Step3SendInvites;