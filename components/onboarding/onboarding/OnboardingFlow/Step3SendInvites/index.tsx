import React, { useState, useEffect } from 'react';
import { LearnerSelection } from './components/LearnerSelection';
import { ChannelSelection } from './components/ChannelSelection';
import { MessageComposer } from './components/MessageComposer';
import { InviteResults } from './components/InviteResults';
import { LoadingState } from './components/UI/LoadingState';
import { ErrorState } from './components/UI/ErrorState';
import { useLearnerData } from './hooks/useLearnerData';
import { useInviteManagement } from './hooks/useInviteManagement';
import { useFormState } from './hooks/useFormState';
import { useStepValidation } from './hooks/useStepValidation';
import { StepState } from './types';
import { gradeService } from './services/gradeService';

interface School {
  id: string;
  name: string;
}

interface Step3SendInvitesProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  school?: School;
}

export const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({
  onNext,
  onPrevious,
  onComplete,
  school
}) => {
  const [currentStep, setCurrentStep] = useState<StepState>('learner-selection');
  const [gradeStats, setGradeStats] = useState<Record<string, any>>({});
  const [statsError, setStatsError] = useState<string | null>(null);

  const schoolId = school?.id;

  const {
    learners,
    selectedLearners,
    grades,
    selectedGrades,
    loading: learnersLoading,
    error: learnersError,
    selectLearner,
    deselectLearner,
    selectGrade,
    deselectGrade,
    selectAllLearners,
    deselectAllLearners
  } = useLearnerData(schoolId);

  const {
    invites,
    sendingInvites,
    sendInvites,
    resendInvite,
    cancelInvite,
    downloadInviteData,
    copyInviteLinks
  } = useInviteManagement();

  const {
    selectedChannel,
    inviteMessage,
    setSelectedChannel,
    setInviteMessage,
    resetForm
  } = useFormState();

  const {
    isStepValid,
    canProceedToNext,
    validationErrors
  } = useStepValidation({
    currentStep,
    selectedLearners,
    selectedChannel,
    inviteMessage
  });

  useEffect(() => {
    if (!selectedGrades || selectedGrades.length === 0 || !schoolId) {
      setGradeStats({});
      return;
    }

    (async () => {
      try {
        setStatsError(null);
        const stats: Record<string, any> = {};

        for (const grade of selectedGrades) {
          if (!grade?.id) continue;
          try {
            const stat = await gradeService.getGradeStats(schoolId, grade.id);
            stats[grade.id] = stat;
          } catch (err: any) {
            console.warn(`Failed to fetch stats for grade ${grade.id}`, err);
            stats[grade.id] = { learnerCount: 0, activeCount: 0 };
          }
        }

        setGradeStats(stats);
      } catch (err: any) {
        setStatsError(err.message || 'Error loading grade stats');
      }
    })();
  }, [selectedGrades, schoolId]);

  const handleStepChange = (step: StepState) => {
    if (isStepValid(step)) {
      setCurrentStep(step);
    }
  };

  const handleSendInvites = async () => {
    if (!canProceedToNext) return;

    try {
      await sendInvites({
        learners: selectedLearners,
        channel: selectedChannel!,
        message: inviteMessage
      });
      setCurrentStep('results');
    } catch (error) {
      console.error('Failed to send invites:', error);
    }
  };

  const handleComplete = () => {
    resetForm();
    onComplete();
  };

  if (learnersLoading) {
    return <LoadingState message="Loading learner data..." />;
  }

  if (learnersError) {
    return <ErrorState error={learnersError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="step3-send-invites text-black bg-white min-h-screen p-4">
      {/* Header */}
      <div className="step-header mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Send Invites to Learners</h2>
        <div className="step-progress flex gap-4 text-black">
          <div className={`step ${currentStep === 'learner-selection' ? 'font-bold' : ''}`}>
            1. Select Learners
          </div>
          <div className={`step ${currentStep === 'channel-selection' ? 'font-bold' : ''}`}>
            2. Choose Channel
          </div>
          <div className={`step ${currentStep === 'message-composer' ? 'font-bold' : ''}`}>
            3. Compose Message
          </div>
          <div className={`step ${currentStep === 'results' ? 'font-bold' : ''}`}>
            4. Review Results
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="step-content text-black">
        {currentStep === 'learner-selection' && (
          <LearnerSelection
            learners={learners}
            selectedLearners={selectedLearners}
            grades={grades}
            selectedGrades={selectedGrades}
            onSelectLearner={selectLearner}
            onDeselectLearner={deselectLearner}
            onSelectGrade={selectGrade}
            onDeselectGrade={deselectGrade}
            onSelectAll={selectAllLearners}
            onDeselectAll={deselectAllLearners}
            onNext={() => handleStepChange('channel-selection')}
            onPrevious={onPrevious}
            canProceed={selectedLearners.length > 0}
            gradeStats={gradeStats}
            statsError={statsError}
          />
        )}

        {currentStep === 'channel-selection' && (
          <ChannelSelection
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            onNext={() => handleStepChange('message-composer')}
            onPrevious={() => handleStepChange('learner-selection')}
            canProceed={!!selectedChannel}
          />
        )}

        {currentStep === 'message-composer' && (
          <MessageComposer
            message={inviteMessage}
            onMessageChange={setInviteMessage}
            selectedLearners={selectedLearners}
            selectedChannel={selectedChannel!}
            onSend={handleSendInvites}
            onPrevious={() => handleStepChange('channel-selection')}
            sending={sendingInvites}
            canSend={canProceedToNext}
          />
        )}

        {currentStep === 'results' && (
          <InviteResults
            invites={invites}
            onResend={resendInvite}
            onCancel={cancelInvite}
            onDownload={downloadInviteData}
            onCopyLinks={copyInviteLinks}
            onComplete={handleComplete}
            onPrevious={() => handleStepChange('message-composer')}
          />
        )}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors mt-4 text-red-600">
          {validationErrors.map((error, index) => (
            <div key={index} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step3SendInvites;
