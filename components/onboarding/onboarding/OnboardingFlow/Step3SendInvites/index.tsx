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

interface Step3SendInvitesProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
}

export const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({
  onNext,
  onPrevious,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<StepState>('learner-selection');
  const [gradeStats, setGradeStats] = useState<Record<string, any>>({});
  const [statsError, setStatsError] = useState<string | null>(null);

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
  } = useLearnerData();

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

  /**
   * Load grade stats when selectedGrades changes
   */
  useEffect(() => {
    if (!selectedGrades || selectedGrades.length === 0) {
      setGradeStats({});
      return;
    }

    (async () => {
      try {
        setStatsError(null);
        const stats: Record<string, any> = {};

        for (const gradeId of selectedGrades) {
          if (!gradeId) continue; // avoid undefined
          try {
            const stat = await gradeService.getGradeStats(gradeId);
            stats[gradeId] = stat;
          } catch (err: any) {
            console.warn(`Failed to fetch stats for grade ${gradeId}`, err);
            stats[gradeId] = { learnerCount: 0, activeCount: 0 };
          }
        }

        setGradeStats(stats);
      } catch (err: any) {
        setStatsError(err.message || 'Error loading grade stats');
      }
    })();
  }, [selectedGrades]);

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
    <div className="step3-send-invites">
      <div className="step-header">
        <h2>Send Invites to Learners</h2>
        <div className="step-progress">
          <div className={`step ${currentStep === 'learner-selection' ? 'active' : ''}`}>
            1. Select Learners
          </div>
          <div className={`step ${currentStep === 'channel-selection' ? 'active' : ''}`}>
            2. Choose Channel
          </div>
          <div className={`step ${currentStep === 'message-composer' ? 'active' : ''}`}>
            3. Compose Message
          </div>
          <div className={`step ${currentStep === 'results' ? 'active' : ''}`}>
            4. Review Results
          </div>
        </div>
      </div>

      <div className="step-content">
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

      {validationErrors.length > 0 && (
        <div className="validation-errors">
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
