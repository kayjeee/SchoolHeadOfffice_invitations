import React from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import StepLayout from "../layouts/StepLayout";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";

const StepCompletion: React.FC = () => {
  const { onboardingStatus } = useOnboardingFlow();

  return (
    <OnboardingLayout title="Onboarding Complete" description="You're all set!">
      <StepLayout stepTitle="Congratulations!" stepDescription="You have completed all the onboarding steps.">
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold text-lg">
            🎉 {onboardingStatus?.role} onboarding completed successfully!
          </p>
          <p className="text-gray-700">
            You can now access all the features available for your role.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"} // Redirect to main app
            className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
          >
            Go to Dashboard
          </button>
        </div>
      </StepLayout>
    </OnboardingLayout>
  );
};

export default StepCompletion;
