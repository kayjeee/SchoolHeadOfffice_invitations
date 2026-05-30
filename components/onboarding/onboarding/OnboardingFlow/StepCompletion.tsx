import React from "react";
import { useRouter } from "next/router";
import OnboardingLayout from "../layouts/OnboardingLayout";
import StepLayout from "../layouts/StepLayout";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { onboardingService } from "../services/onboardingService";
import { slugify } from '../utils/slugify';

const StepCompletion: React.FC = () => {
  const router = useRouter();
  const { onboardingStatus, primarySchool } = useOnboardingFlow();

  const handleGoToDashboard = async () => {
    // Extract the school name dynamically from available metadata layers
    const absoluteSchoolName =
      primarySchool?.name ||
      (onboardingStatus as any)?.client_metadata?.create_grades_metadata?.schoolName ||
      "Far North Secondary School";

    const schoolSlug = slugify(absoluteSchoolName);
    const dashboardUrl = `/admin/${schoolSlug}`;

    try {
      // Use the user ID from the status or current context
      const userId = onboardingStatus?.userId || '';
      await onboardingService.completeOnboarding(userId);
      router.push(dashboardUrl);
    } catch (error) {
      console.error('Redirection engine failed:', error);
      // Fallback redirect even if API fails
      router.push(dashboardUrl);
    }
  };

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
            onClick={handleGoToDashboard}
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
