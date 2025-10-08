import React from "react";
import { useOnboardingFlow, OnboardingFlowProvider } from "./hooks/useOnboardingFlow";
import { STEPS } from "./OnboardingFlow";

const OnboardingContent = ({ user, schools, onboardingStatus }) => {
  console.log("🔵 [OnboardingContent] Component rendered");
  console.log("📦 [OnboardingContent] Props received:", {
    user: user ? { id: user._id || user.id, email: user.email } : 'No user',
    schools: schools,
    schoolsCount: schools?.length || 0,
    onboardingStatus: onboardingStatus
  });

  // Heavy logging for school data
  if (schools && schools.length > 0) {
    console.log("🏫 [OnboardingContent] SCHOOLS ANALYSIS:");
    schools.forEach((school, index) => {
      console.log(`🏫 School [${index}]:`, {
        id: school?.id || school?._id || 'No ID',
        name: school?.name || 'No name',
        type: typeof school,
        keys: school ? Object.keys(school) : 'No school object',
        fullObject: school
      });
    });
    
    const primarySchool = schools[0];
    console.log("🎯 [OnboardingContent] PRIMARY SCHOOL (schools[0]):", {
      id: primarySchool?.id || primarySchool?._id || 'No ID',
      name: primarySchool?.name || 'No name',
      email: primarySchool?.email,
      phone: primarySchool?.phone,
      address: primarySchool?.address,
      isObject: typeof primarySchool === 'object',
      isNull: primarySchool === null,
      isUndefined: primarySchool === undefined
    });
  } else {
    console.warn("⚠️ [OnboardingContent] NO SCHOOLS PROVIDED or empty array");
    console.log("📊 [OnboardingContent] schools value:", schools);
    console.log("📊 [OnboardingContent] schools type:", typeof schools);
    console.log("📊 [OnboardingContent] schools length:", schools?.length);
  }

  const {
    currentStep,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    isLoading,
    setIsLoading,
    updateOnboardingData
  } = useOnboardingFlow();

  console.log("🔄 [OnboardingContent] useOnboardingFlow hook returned:", {
    currentStep: currentStep?.id,
    currentStepIndex,
    isLoading,
    hasUpdateOnboardingData: typeof updateOnboardingData === 'function'
  });

  // Resolve a safe user ID
  const userId = user?._id || user?.id || user?.auth0_id;
  console.log("👤 [OnboardingContent] User ID resolved:", userId);

  const handleNext = async () => {
    console.log("➡️ [OnboardingContent] handleNext triggered");
    console.log("⏳ [OnboardingContent] Setting loading to true");
    setIsLoading(true);
    
    try {
      console.log("⏰ [OnboardingContent] Simulating async operation (500ms)");
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("✅ [OnboardingContent] Async operation completed, calling goToNextStep");
      goToNextStep();
      console.log("🎉 [OnboardingContent] Successfully advanced to next step");
    } catch (error) {
      console.error("❌ [OnboardingContent] Error advancing onboarding step:", error);
      console.error("🔍 [OnboardingContent] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } finally {
      console.log("🏁 [OnboardingContent] Finally block - setting loading to false");
      setIsLoading(false);
      console.log("📊 [OnboardingContent] Current loading state after update: false");
    }
  };

  const handleBack = () => {
    console.log("⬅️ [OnboardingContent] handleBack triggered");
    console.log("📊 [OnboardingContent] Current step before back:", currentStepIndex);
    goToPreviousStep();
    console.log("📊 [OnboardingContent] Current step after back:", currentStepIndex - 1);
  };

  const handleUpdateData = (data) => {
    console.log("📝 [OnboardingContent] handleUpdateData called with:", data);
    console.log("🏫 [OnboardingContent] Current school context during update:", {
      primarySchool: schools?.[0],
      primarySchoolName: schools?.[0]?.name,
      primarySchoolId: schools?.[0]?.id || schools?.[0]?._id
    });
    updateOnboardingData(data);
    console.log("✅ [OnboardingContent] updateOnboardingData completed");
  };

  console.log("🔍 [OnboardingContent] Checking currentStep:", {
    hasCurrentStep: !!currentStep,
    currentStepId: currentStep?.id,
    hasComponent: !!currentStep?.component,
    component: currentStep?.component
  });

  if (!currentStep?.component) {
    console.warn("⚠️ [OnboardingContent] No currentStep.component - returning null");
    console.log("📊 [OnboardingContent] currentStep value:", currentStep);
    return null;
  }

  const StepComponent = currentStep.component;
  console.log("🎭 [OnboardingContent] StepComponent to render:", StepComponent.name || 'Anonymous component');

  console.log("🏫 [OnboardingContent] FINAL SCHOOL DATA BEING PASSED TO STEP COMPONENT:", {
    school: schools?.[0],
    schoolName: schools?.[0]?.name || 'NO SCHOOL NAME',
    schoolId: schools?.[0]?.id || schools?.[0]?._id || 'NO SCHOOL ID',
    allSchools: schools,
    schoolsCount: schools?.length || 0
  });

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
          userId={userId}
          schools={schools} // ADD THIS LINE - pass the schools array
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
  console.log("🚀 [OnboardingGuard] Component mounted");
  console.log("📋 [OnboardingGuard] Props received:", {
    user: user ? { id: user._id || user.id, email: user.email } : 'No user',
    schools: schools,
    schoolsCount: schools?.length || 0,
    isOnboardingComplete,
    isCheckingOnboarding
  });

  // Heavy school prop logging
  console.log("🏫 [OnboardingGuard] SCHOOL PROP DEEP ANALYSIS:");
  console.log("🔍 [OnboardingGuard] schools type:", typeof schools);
  console.log("🔍 [OnboardingGuard] schools value:", schools);
  console.log("🔍 [OnboardingGuard] schools === null:", schools === null);
  console.log("🔍 [OnboardingGuard] schools === undefined:", schools === undefined);
  console.log("🔍 [OnboardingGuard] Array.isArray(schools):", Array.isArray(schools));
  
  if (schools && Array.isArray(schools)) {
    console.log("📊 [OnboardingGuard] schools array length:", schools.length);
    schools.forEach((school, index) => {
      console.log(`🏫 [OnboardingGuard] School at index ${index}:`, {
        id: school?.id || school?._id || 'NO ID FOUND',
        name: school?.name || 'NO NAME FOUND',
        fullObject: school,
        isNull: school === null,
        isUndefined: school === undefined,
        isObject: typeof school === 'object',
        objectKeys: school ? Object.keys(school) : 'No keys'
      });
    });
  } else {
    console.warn("⚠️ [OnboardingGuard] schools is not an array or is empty");
  }

  if (isCheckingOnboarding) {
    console.log("⏳ [OnboardingGuard] Rendering loading state - isCheckingOnboarding:", true);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  console.log("✅ [OnboardingGuard] Onboarding check complete");
  console.log("📊 [OnboardingGuard] isOnboardingComplete:", isOnboardingComplete);

  if (isOnboardingComplete) {
    console.log("🎉 [OnboardingGuard] Onboarding COMPLETE - returning null (main app will render)");
    console.log("🏫 [OnboardingGuard] Final school state before exiting:", {
      primarySchool: schools?.[0],
      primarySchoolName: schools?.[0]?.name,
      primarySchoolId: schools?.[0]?.id || schools?.[0]?._id
    });
    return null;
  }

  console.log("🚧 [OnboardingGuard] Onboarding INCOMPLETE - rendering onboarding flow");
  console.log("🏫 [OnboardingGuard] Schools being passed to OnboardingContent:", schools);

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