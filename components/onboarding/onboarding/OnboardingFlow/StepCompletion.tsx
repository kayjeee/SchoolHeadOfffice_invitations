import React from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import StepLayout from "../layouts/StepLayout";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";

const StepCompletion: React.FC = () => {
  const { onboardingStatus } = useOnboardingFlow();

  // Determine redirection target (fallback to /parent for now)
  const dashboardUrl = "/parent";

  return (
    <OnboardingLayout title="Onboarding Complete" description="You're all set!">
      <StepLayout stepTitle="Congratulations!" stepDescription="You have completed all the onboarding steps.">
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold text-lg">
            🎉 {onboardingStatus?.role || 'Parent'} onboarding completed successfully!
          </p>
          <p className="text-gray-700">
            You can now access all the features available for your role.
          </p>
          <button
            onClick={() => window.location.href = dashboardUrl}
            className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
          >
            Go to Dashboard
          </button>

          {/* DEMO / NESTED ROUTE LINK */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Test Nested Route:</p>
            <a
              href="/parent/far%20north%20secondary%20school"
              className="text-sm text-blue-600 underline font-medium"
            >
              Far North Secondary School
            </a>
          </div>
        </div>
      </StepLayout>
    </OnboardingLayout>
  );
};

export default StepCompletion;
