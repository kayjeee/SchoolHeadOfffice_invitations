import React from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import StepLayout from "../layouts/StepLayout";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { slugify } from "@/utils/slugify";

const StepCompletion: React.FC = () => {
  const { onboardingStatus, primarySchool, schools } = useOnboardingFlow();

  // Resolve the active school (using primarySchool or falling back to the first available school)
  const schoolObj = primarySchool || (schools && schools.length > 0 ? schools[0] : null);

  // Safely resolve the school's slug
  const schoolSlug =
    schoolObj?.slug ||
    schoolObj?.school_slug ||
    (schoolObj?.schoolName ? slugify(schoolObj.schoolName) : "") ||
    (schoolObj?.name ? slugify(schoolObj.name) : "") ||
    "far-north-secondary-school";

  const handleGoToDashboard = () => {
    window.location.href = `/admin/dashboard/${schoolSlug}`;
  };

  return (
    <OnboardingLayout title="Onboarding Complete" description="You're all set!">
      <StepLayout stepTitle="Congratulations!" stepDescription="You have completed all the onboarding steps.">
        <div className="text-center space-y-4">
          <p className="text-green-600 font-semibold text-lg">
            🎉 {onboardingStatus?.role || "Admin"} onboarding completed successfully!
          </p>
          <p className="text-gray-700">
            You can now access all the features available for your role.
          </p>
          <button
            onClick={handleGoToDashboard}
            className="px-4 py-2 bg-blue-500 text-white rounded mt-2 transition-all duration-200 hover:bg-blue-600 active:scale-95"
          >
            Go to Dashboard
          </button>
        </div>
      </StepLayout>
    </OnboardingLayout>
  );
};

export default StepCompletion;
