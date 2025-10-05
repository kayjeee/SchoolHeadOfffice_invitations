import React, { useState, createContext, useContext } from "react";
import { STEPS } from "../OnboardingFlow";

// ----------------------
// Context Setup
// ----------------------
const OnboardingFlowContext = createContext(null);

export const useOnboardingFlow = () => {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error("useOnboardingFlow must be used within an OnboardingFlowProvider");
  }
  return context;
};

// ----------------------
// Internal Provider
// ----------------------
const InternalOnboardingFlowProvider = ({ children, schools = [] }) => {
  const safeSchools = Array.isArray(schools) ? schools : [];

  console.log("🏫 [OnboardingFlowProvider] Provider mounted with schools:", {
    rawSchools: schools,
    safeSchoolsCount: safeSchools.length,
    schoolsType: typeof schools,
    isArray: Array.isArray(schools),
    isNull: schools === null,
    isUndefined: schools === undefined,
  });

  // Detailed school logging
  if (safeSchools.length > 0) {
    console.log("📊 [OnboardingFlowProvider] SCHOOLS DETAILED ANALYSIS:");
    safeSchools.forEach((school, index) => {
      console.log(`🏫 School [${index}]:`, {
        id: school?.id || school?._id || "No ID",
        name: school?.name || "No name",
        type: typeof school,
        keys: school ? Object.keys(school) : "No school object",
      });
    });

    const primarySchool = safeSchools[0];
    console.log("🎯 [OnboardingFlowProvider] PRIMARY SCHOOL:", {
      id: primarySchool?.id || primarySchool?._id,
      name: primarySchool?.name,
      fullObject: primarySchool,
    });
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ---- Step navigation ----
  const goToNextStep = () => {
    console.log("➡️ goToNextStep called", {
      currentStepIndex,
      schoolsCount: safeSchools.length,
      primarySchool: safeSchools[0]?.name,
    });

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      console.log("🎉 Final step reached - onboarding complete!");
    }
  };

  const goToPreviousStep = () => {
    console.log("⬅️ goToPreviousStep called", {
      currentStepIndex,
      schoolsCount: safeSchools.length,
      primarySchool: safeSchools[0]?.name,
    });

    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    console.log("🎯 goToStep called", { stepIndex, totalSteps: STEPS.length });

    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStepIndex(stepIndex);
    } else {
      console.warn("⚠️ Invalid step index:", stepIndex);
    }
  };

  // ---- Data management ----
  const updateOnboardingData = (newData) => {
    console.log("📝 updateOnboardingData:", newData);

    setOnboardingData((prev) => {
      const updatedData = { ...prev, ...newData };
      console.log("🔄 Updated onboarding data:", updatedData);
      return updatedData;
    });
  };

  const getStepData = (stepId) => {
    const data = onboardingData[stepId] || null;
    console.log("📖 getStepData:", { stepId, data });
    return data;
  };

  const updateStepData = (stepId, data) => {
    console.log("✏️ updateStepData:", { stepId, data });

    setOnboardingData((prev) => {
      const updatedData = {
        ...prev,
        [stepId]: {
          ...(prev[stepId] || {}),
          ...data,
          schoolsContext: {
            schoolsCount: safeSchools.length,
            primarySchoolId: safeSchools[0]?.id || safeSchools[0]?._id,
            primarySchoolName: safeSchools[0]?.name,
            allSchools: safeSchools,
          },
        },
      };
      console.log("🔄 Step data updated:", updatedData[stepId]);
      return updatedData;
    });
  };

  const markStepCompleted = (stepId, payload = {}) => {
    console.log("✅ markStepCompleted:", { stepId, payload });
    updateStepData(stepId, {
      completed: true,
      completedAt: new Date().toISOString(),
      ...payload,
    });
  };

  const skipStep = (stepId, reason = "Skipped by user") => {
    console.log("⏭️ skipStep:", { stepId, reason });
    updateStepData(stepId, {
      skipped: true,
      reason,
      skippedAt: new Date().toISOString(),
    });
  };

  // ---- Context value ----
  const value = {
    // Step management
    currentStep: STEPS[currentStepIndex],
    currentStepIndex,
    totalSteps: STEPS.length,
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Data management
    onboardingData,
    updateOnboardingData,
    getStepData,
    updateStepData,
    markStepCompleted,
    skipStep,

    // Loading state
    isLoading,
    setIsLoading,

    // Schools context
    schools: safeSchools,
    schoolsCount: safeSchools.length,
    primarySchool: safeSchools[0],
    primarySchoolName: safeSchools[0]?.name,
    primarySchoolId: safeSchools[0]?.id || safeSchools[0]?._id,
  };

  console.log("🔄 [OnboardingFlowProvider] Context value updated:", {
    currentStep: value.currentStep?.id,
    currentStepIndex: value.currentStepIndex,
    schoolsCount: value.schoolsCount,
    primarySchoolName: value.primarySchoolName,
    onboardingDataKeys: Object.keys(value.onboardingData),
  });

  return (
    <OnboardingFlowContext.Provider value={value}>
      {children}
    </OnboardingFlowContext.Provider>
  );
};

// ----------------------
// Export with alias
// ----------------------
export { InternalOnboardingFlowProvider as OnboardingFlowProvider };
