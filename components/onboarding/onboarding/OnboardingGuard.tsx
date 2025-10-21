import React from "react";
import { useOnboardingFlow, OnboardingFlowProvider } from "./hooks/useOnboardingFlow";
import { STEPS } from "./OnboardingFlow";
import { useAppTheme } from "../../Layouts/context/ThemeContext";
import { 
  generateColorPalette, 
  getComplementaryColor,
  getTriadicColors,
  getLogoColor 
} from "./NavbarTheming/colorUtils";

const OnboardingContent = ({ user, schools, onboardingStatus }) => {
  console.log("🔵 [OnboardingContent] Component rendered");

  // Use your existing theme context
  const { primaryColor, currentSchool, getPrimaryColorValue } = useAppTheme();
  
  // Generate color palette using your existing system
  const themePalette = React.useMemo(() => {
    const primaryColorValue = getPrimaryColorValue();
    const palette = generateColorPalette(primaryColorValue);
    
    // Fallback to basic palette if generation fails
    if (!palette) {
      const logoColor = getLogoColor(primaryColorValue) || '#190961ff';
      return {
        primary: primaryColorValue,
        logo: logoColor,
        progress: primaryColorValue, // Use primary for progress
        secondary: getComplementaryColor(primaryColorValue) || '#3B82F6' // Fallback to blue
      };
    }
    
    // Enhance palette with progress-specific colors
    return {
      ...palette,
      progress: palette.primary,
      secondary: palette.secondary || getComplementaryColor(primaryColorValue) || '#3B82F6'
    };
  }, [getPrimaryColorValue]);

  // Calculate text colors based on background
  const getTextColor = (backgroundColor) => {
    return getLogoColor(backgroundColor) || '#000000';
  };

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
    console.log("➡️ [OnboardingContent] handleNext triggered");
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      goToNextStep();
    } catch (error) {
      console.error("❌ [OnboardingContent] Error advancing onboarding step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log("⬅️ [OnboardingContent] handleBack triggered");
    goToPreviousStep();
  };

  const handleUpdateData = (data) => {
    console.log("📝 [OnboardingContent] handleUpdateData called with:", data);
    updateOnboardingData(data);
  };

  if (!currentStep?.component) {
    console.warn("⚠️ [OnboardingContent] No currentStep.component - returning null");
    return null;
  }

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-white py-8"> {/* ✅ Changed to white background */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 
              className="text-2xl font-bold text-gray-800" // ✅ Added text color
            >
              School Setup
            </h1>
            <div className="text-sm text-gray-600"> {/* ✅ Added text color */}
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>
          </div>

          {/* Progress Bar - Using Color Wheel Principles */}
          <div 
            className="w-full rounded-full h-2 mb-4 bg-gray-200" // ✅ Changed to gray background
          >
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: themePalette.progress,
                width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
                boxShadow: `0 0 10px ${themePalette.progress}40` // Glow effect
              }}
            />
          </div>

          {/* Step Indicators - Using Triadic Colors */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              // Use different colors from your color wheel for each step
              let stepColor;
              if (index <= currentStepIndex) {
                // Completed steps use primary color
                stepColor = themePalette.primary;
              } else if (index === currentStepIndex + 1) {
                // Next step uses secondary color
                stepColor = themePalette.secondary || '#3B82F6';
              } else {
                // Future steps use gray
                stepColor = '#D1D5DB'; // gray-300
              }

              const textColor = index <= currentStepIndex ? 
                getTextColor(stepColor) : 
                '#9CA3AF'; // gray-400 for future steps
              
              return (
                <div 
                  key={step.id} 
                  className="text-center flex-1"
                  style={{ color: textColor }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300"
                    style={{ 
                      backgroundColor: stepColor,
                      color: textColor,
                      border: `2px solid ${stepColor}`,
                      boxShadow: index <= currentStepIndex ? `0 0 8px ${stepColor}60` : 'none'
                    }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs font-medium">{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"> {/* ✅ Simplified styling */}
          <StepComponent
            user={user}
            userId={userId}
            schools={schools}
            school={schools?.[0]}
            onboardingStatus={onboardingStatus}
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
            onUpdateData={handleUpdateData}
            themePalette={themePalette} // Pass palette to step components
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 text-gray-700 hover:bg-gray-50" // ✅ Simplified styling
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              backgroundColor: themePalette.progress,
              boxShadow: `0 2px 4px ${themePalette.progress}40`
            }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div 
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                ></div>
                Loading...
              </div>
            ) : (
              currentStepIndex === STEPS.length - 1 ? 'Complete Setup' : 'Next Step'
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
  console.log("🚀 [OnboardingGuard] Component mounted");

  // Use theme context for consistent styling
  const { primaryColor, getPrimaryColorValue } = useAppTheme();

  if (isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white"> {/* ✅ White background */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div> {/* ✅ Standard blue spinner */}
          <p className="text-gray-600">Checking onboarding status...</p> {/* ✅ Standard text color */}
        </div>
      </div>
    );
  }

  if (isOnboardingComplete) {
    return null;
  }

  return (
    <OnboardingFlowProvider schools={schools}>
      <OnboardingContent
        user={user}
        schools={schools}
        onboardingStatus={onboardingStatus}
      />
    </OnboardingFlowProvider>
  );
};

export default OnboardingGuard;