import React from "react";
import { useRouter } from "next/router";
import { useOnboardingFlow, OnboardingFlowProvider } from "./hooks/useOnboardingFlow";
import { slugify } from "@/utils/slugify";
import { STEPS } from "./OnboardingFlow";
import { useAppTheme } from "../../Layouts/context/ThemeContext";
import { onboardingService } from "./services/onboardingService";
import {
  generateColorPalette,
  getComplementaryColor,
  getTriadicColors,
  getLogoColor
} from "./NavbarTheming/colorUtils";

const OnboardingContent = ({ user, schools, onboardingStatus }) => {
  const router = useRouter();
  const { currentSchool, getPrimaryColorValue } = useAppTheme();
  const {
    currentStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    isLoading,
    setIsLoading,
    updateOnboardingData,
  } = useOnboardingFlow();

  // Use the `currentSchool` from the App's theme context and normalize it.
  const school = currentSchool ? {
    ...currentSchool,
    id: currentSchool.id || currentSchool._id,
    _id: currentSchool._id || currentSchool.id,
  } : null;

  // ✅ Verify logo URL with detailed logging
  const logoUrl = school?.logo;
  
  // Track logo load state
  const [logoLoaded, setLogoLoaded] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  // ✅ Generate theme palette
  const themePalette = React.useMemo(() => {
    const primaryColorValue = getPrimaryColorValue();
    const palette = generateColorPalette(primaryColorValue);

    if (!palette) {
      const logoColor = getLogoColor(primaryColorValue) || "#190961ff";
      return {
        primary: primaryColorValue,
        logo: logoColor,
        progress: primaryColorValue,
        secondary: getComplementaryColor(primaryColorValue) || "#3B82F6"
      };
    }

    return {
      ...palette,
      progress: palette.primary,
      secondary: palette.secondary || getComplementaryColor(primaryColorValue) || "#3B82F6"
    };
  }, [getPrimaryColorValue]);

  const getTextColor = (backgroundColor) =>
    getLogoColor(backgroundColor) || "#000000";

  const userId = user?._id || user?.id || user?.auth0_id;

  const handleCompleteOnboarding = async () => {
    const schoolSlug = slugify(school?.schoolName || 'my-school');
    const dashboardUrl = `/admin/${schoolSlug}`;
    setIsLoading(true);
    try {
      await onboardingService.completeOnboarding(userId);
      router.push(dashboardUrl);
    } catch (error) {
      console.error('Redirection engine failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStepIndex === STEPS.length - 1) {
      handleCompleteOnboarding();
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      goToNextStep();
    } catch (error) {
      console.error("❌ [OnboardingContent] Error advancing onboarding step:", error);
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

  const handleLogoLoad = () => {
    setLogoLoaded(true);
    setLogoError(false);
  };

  const handleLogoError = (e) => {
    setLogoError(true);
    setLogoLoaded(false);
  };

  if (!currentStep?.component) {
    return null;
  }

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ✅ Enhanced Header with Professional Logo Display */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {/* Professional Logo Container */}
            <div className="relative w-20 h-20 rounded-xl bg-white shadow-lg ring-4 ring-gray-100 overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:ring-gray-200">
              {logoUrl && !logoError ? (
                <>
                  <img
                    src={logoUrl}
                    alt={`${school?.schoolName || "School"} logo`}
                    className="w-full h-full object-contain p-2"
                    onLoad={handleLogoLoad}
                    onError={handleLogoError}
                    style={{ display: logoError ? 'none' : 'block' }}
                  />
                  {!logoLoaded && !logoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-4xl" title="Logo not available">🏫</span>
              )}
            </div>

            {/* School Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">School Setup</h1>
              <p className="text-sm text-gray-600 font-medium">
                {school?.schoolName || "Unnamed School"}
              </p>
              {logoUrl && (
                <p className="text-xs text-gray-400 mt-1">
                  {logoLoaded && "✓ Logo loaded"}
                  {logoError && "⚠ Logo unavailable"}
                </p>
              )}
            </div>
          </div>

          {/* Step Counter */}
          <div className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
            Step <span className="text-lg font-bold" style={{ color: themePalette.primary }}>{currentStepIndex + 1}</span> of {STEPS.length}
          </div>
        </div>

        {/* ✅ Enhanced Progress Bar */}
        <div className="w-full rounded-full h-3 mb-8 bg-gray-200 shadow-inner overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500 ease-out"
            style={{
              backgroundColor: themePalette.progress,
              width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
              boxShadow: `0 0 12px ${themePalette.progress}60, inset 0 1px 0 rgba(255,255,255,0.4)`
            }}
          />
        </div>

        {/* ✅ Step Indicators */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => {
            let stepColor;
            if (index <= currentStepIndex) {
              stepColor = themePalette.primary;
            } else if (index === currentStepIndex + 1) {
              stepColor = themePalette.secondary || "#3B82F6";
            } else {
              stepColor = "#D1D5DB";
            }

            const textColor =
              index <= currentStepIndex ? getTextColor(stepColor) : "#9CA3AF";

            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;

            return (
              <div key={step.id} className="text-center flex-1" style={{ color: textColor }}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: stepColor,
                    color: textColor,
                    border: `3px solid ${stepColor}`,
                    boxShadow: index <= currentStepIndex ? `0 0 12px ${stepColor}60` : "none"
                  }}
                >
                  {isComplete ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* ✅ Step Content */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <StepComponent
            user={user}
            userId={userId}
            schools={schools}
            school={school}
            onboardingStatus={onboardingStatus}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
            onUpdateData={handleUpdateData}
            themePalette={themePalette}
          />
        </div>

        {/* ✅ Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
            className="px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transform hover:scale-105"
            style={{
              backgroundColor: themePalette.progress,
              boxShadow: `0 4px 6px ${themePalette.progress}40`
            }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : currentStepIndex === STEPS.length - 1 ? (
              "Complete Setup ✓"
            ) : (
              "Next Step →"
            )}
          </button>
        </div>
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
  const { primaryColor, getPrimaryColorValue } = useAppTheme();

  if (isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  if (isOnboardingComplete) {
    return null;
  }

  return (
    <OnboardingFlowProvider schools={schools} user={user}>
      <OnboardingContent
        user={user}
        schools={schools}
        onboardingStatus={onboardingStatus}
      />
    </OnboardingFlowProvider>
  );
};

export default OnboardingGuard;