
import React, { useEffect, useState } from 'react';
import { useOnboardingFlow, OnboardingFlowProvider } from '../hooks/useOnboardingFlow';
import OnboardingLayout from '../layouts/OnboardingLayout';
import StepLayout from '../layouts/StepLayout';
import ProgressIndicator from '../components/ProgressIndicator';
import StepNavigation from '../components/StepNavigation';
import SkipStepModal from '../components/SkipStepModal';
import { ONBOARDING_STEPS, getRoleBasedSteps } from '../utils/roleBasedSteps';
import { stepProgressService } from '../services/stepProgressService';

// Placeholder Step Components
const Step1CreateGrades: React.FC = () => {
  const { setStepCompleted } = useOnboardingFlow();
  const [gradesCreated, setGradesCreated] = useState(false);

  useEffect(() => {
    if (gradesCreated) {
      setStepCompleted("Step1CreateGrades");
    }
  }, [gradesCreated, setStepCompleted]);

  return (
    <div>
      <p>This is Step 1: Create Grades.</p>
      <button
        onClick={() => setGradesCreated(true)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {gradesCreated ? "Grades Created!" : "Simulate Create Grades"}
      </button>
    </div>
  );
};

const Step2UploadLearners: React.FC = () => {
  const { setStepCompleted } = useOnboardingFlow();
  const [learnersUploaded, setLearnersUploaded] = useState(false);

  useEffect(() => {
    if (learnersUploaded) {
      setStepCompleted("Step2UploadLearners");
    }
  }, [learnersUploaded, setStepCompleted]);

  return (
    <div>
      <p>This is Step 2: Upload Learners.</p>
      <button
        onClick={() => setLearnersUploaded(true)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {learnersUploaded ? "Learners Uploaded!" : "Simulate Upload Learners"}
      </button>
    </div>
  );
};

const Step3SendInvites: React.FC = () => {
  const { setStepCompleted } = useOnboardingFlow();
  const [invitesSent, setInvitesSent] = useState(false);

  useEffect(() => {
    if (invitesSent) {
      setStepCompleted("Step3SendInvites");
    }
  }, [invitesSent, setStepCompleted]);

  return (
    <div>
      <p>This is Step 3: Send Invites.</p>
      <button
        onClick={() => setInvitesSent(true)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {invitesSent ? "Invites Sent!" : "Simulate Send Invites"}
      </button>
    </div>
  );
};

const StepCompletion: React.FC = () => {
  return (
    <div>
      <p>Congratulations! You have completed the onboarding process.</p>
      <p>You can now access all features of the application.</p>
    </div>
  );
};

// Map step IDs to their actual components
const StepComponents: { [key: string]: React.ComponentType<any> } = {
  Step1CreateGrades,
  Step2UploadLearners,
  Step3SendInvites,
  StepCompletion,
};

const OnboardingFlowContent: React.FC = () => {
  const { currentStep, onboardingStatus, goToNextStep, goToPreviousStep, skipStep, isLoading, error } = useOnboardingFlow();
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);

  if (isLoading) {
    return <OnboardingLayout title="Loading..." description="Fetching your onboarding status..."></OnboardingLayout>;
  }

  if (error) {
    return <OnboardingLayout title="Error" description={`An error occurred: ${error}`}></OnboardingLayout>;
  }

  if (onboardingStatus.isComplete) {
    return (
      <OnboardingLayout title="Onboarding Complete!" description="You've successfully set up your account.">
        <StepCompletion />
      </OnboardingLayout>
    );
  }

  if (!currentStep) {
    return <OnboardingLayout title="No Steps Found" description="There are no onboarding steps configured for your role."></OnboardingLayout>;
  }

  const CurrentStepComponent = StepComponents[currentStep.id];
  const relevantSteps = getRoleBasedSteps(onboardingStatus.role);
  const progress = stepProgressService.calculateProgress(onboardingStatus, relevantSteps);
  const canGoPrevious = stepProgressService.getPreviousStep(currentStep.id, relevantSteps, onboardingStatus.role) !== null;
  const canGoNext = true; // For now, assume next is always possible until validation is integrated
  const isLastStep = !stepProgressService.getNextStep(currentStep.id, relevantSteps, onboardingStatus.completedSteps, onboardingStatus.role);
  const canSkipCurrentStep = stepProgressService.isStepSkippable(currentStep.id, ONBOARDING_STEPS);

  const handleSkip = () => {
    setIsSkipModalOpen(true);
  };

  const confirmSkip = () => {
    skipStep(currentStep.id);
    setIsSkipModalOpen(false);
  };

  return (
    <OnboardingLayout
      title={`Welcome to the App! (${onboardingStatus.role})`}
      description="Let's get you set up."
    >
      <ProgressIndicator progress={progress} currentStepName={currentStep.name} />
      <div className="mt-8">
        <StepLayout stepTitle={currentStep.name}>
          {CurrentStepComponent ? <CurrentStepComponent /> : <p>Component not found for {currentStep.name}</p>}
        </StepLayout>
      </div>
      <StepNavigation
        onNext={goToNextStep}
        onPrevious={goToPreviousStep}
        onSkip={handleSkip}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        canSkip={canSkipCurrentStep}
        isLastStep={isLastStep}
      />
      <SkipStepModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        onConfirm={confirmSkip}
        stepName={currentStep.name}
      />
    </OnboardingLayout>
  );
};

const OnboardingFlow: React.FC = () => {
  return (
    <OnboardingFlowProvider>
      <OnboardingFlowContent />
    </OnboardingFlowProvider>
  );
};

export default OnboardingFlow;


