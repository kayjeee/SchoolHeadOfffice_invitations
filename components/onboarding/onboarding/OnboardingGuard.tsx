import React from "react";
import { useOnboardingFlow, InternalOnboardingFlowProvider } from "./hooks/useOnboardingFlow";
import { STEPS } from "./OnboardingFlow";

const OnboardingContent = ({ user, schools, onboardingStatus }) => {
  const {
    currentStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    isLoading,
    setIsLoading,
    updateOnboardingData
  } = useOnboardingFlow();

  // Resolve a safe user ID
  const userId = user?._id || user?.id || user?.auth0_id;

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      goToNextStep();
    } catch (error) {
      console.error("Error advancing onboarding step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => goToPreviousStep();

  const handleUpdateData = (data) => updateOnboardingData(data);

  if (!currentStep?.component) return null;

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
              <div key={step.id} className={`text-center flex-1 ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {index + 1}
                </div>
                <span className="text-xs font-medium">{step.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <StepComponent
          user={user}
          userId={userId}           // Pass safe userId
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
};

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

  if (isOnboardingComplete) return null;

  return (
    <InternalOnboardingFlowProvider>
      <OnboardingContent
        user={user}
        schools={schools}
        onboardingStatus={onboardingStatus}
      />
    </InternalOnboardingFlowProvider>
  );
};

export default OnboardingGuard;
