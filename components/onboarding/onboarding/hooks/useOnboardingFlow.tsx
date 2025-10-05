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
const InternalOnboardingFlowProvider = ({ children, schools }) => {
  console.log("🏫 [OnboardingFlowProvider] Provider mounted with schools:", {
    schools,
    schoolsCount: schools?.length || 0,
    schoolsType: typeof schools,
    isArray: Array.isArray(schools),
    isNull: schools === null,
    isUndefined: schools === undefined
  });

  // Heavy schools logging
  if (schools && Array.isArray(schools)) {
    console.log("📊 [OnboardingFlowProvider] SCHOOLS DETAILED ANALYSIS:");
    schools.forEach((school, index) => {
      console.log(`🏫 School [${index}]:`, {
        id: school?.id || school?._id || 'No ID',
        name: school?.name || 'No name',
        type: typeof school,
        keys: school ? Object.keys(school) : 'No school object'
      });
    });
    
    if (schools.length > 0) {
      const primarySchool = schools[0];
      console.log("🎯 [OnboardingFlowProvider] PRIMARY SCHOOL (schools[0]):", {
        id: primarySchool?.id || primarySchool?._id,
        name: primarySchool?.name,
        fullObject: primarySchool
      });
    }
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ---- Step navigation ----
  const goToNextStep = () => {
    console.log("➡️ [OnboardingFlowProvider] goToNextStep called");
    console.log("🏫 [OnboardingFlowProvider] Current schools context in goToNextStep:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name,
      primarySchoolId: schools?.[0]?.id || schools?.[0]?._id
    });
    
    if (currentStepIndex < STEPS.length - 1) {
      console.log(`📊 [OnboardingFlowProvider] Moving from step ${currentStepIndex} to ${currentStepIndex + 1}`);
      setCurrentStepIndex(prev => prev + 1);
    } else {
      console.log("🎉 [OnboardingFlowProvider] Final step reached - onboarding complete!");
    }
  };

  const goToPreviousStep = () => {
    console.log("⬅️ [OnboardingFlowProvider] goToPreviousStep called");
    console.log("🏫 [OnboardingFlowProvider] Current schools context in goToPreviousStep:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name,
      primarySchoolId: schools?.[0]?.id || schools?.[0]?._id
    });
    
    if (currentStepIndex > 0) {
      console.log(`📊 [OnboardingFlowProvider] Moving from step ${currentStepIndex} to ${currentStepIndex - 1}`);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex) => {
    console.log("🎯 [OnboardingFlowProvider] goToStep called with index:", stepIndex);
    console.log("🏫 [OnboardingFlowProvider] Current schools context in goToStep:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name,
      primarySchoolId: schools?.[0]?.id || schools?.[0]?._id
    });
    
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      console.log(`📊 [OnboardingFlowProvider] Jumping to step ${stepIndex}`);
      setCurrentStepIndex(stepIndex);
    } else {
      console.warn("⚠️ [OnboardingFlowProvider] Invalid step index:", stepIndex);
    }
  };

  // ---- Data management ----
  const updateOnboardingData = (newData) => {
    console.log("📝 [OnboardingFlowProvider] updateOnboardingData called with:", newData);
    console.log("🏫 [OnboardingFlowProvider] Schools context during data update:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name
    });
    
    setOnboardingData(prev => {
      const updatedData = { ...prev, ...newData };
      console.log("🔄 [OnboardingFlowProvider] Data updated:", updatedData);
      return updatedData;
    });
  };

  const getStepData = (stepId) => {
    const data = onboardingData[stepId] || null;
    console.log("📖 [OnboardingFlowProvider] getStepData called for:", stepId, "result:", data);
    console.log("🏫 [OnboardingFlowProvider] Schools context during getStepData:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name
    });
    return data;
  };

  const updateStepData = (stepId, data) => {
    console.log("✏️ [OnboardingFlowProvider] updateStepData called for:", stepId, "with:", data);
    console.log("🏫 [OnboardingFlowProvider] Schools context during updateStepData:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name
    });
    
    setOnboardingData(prev => {
      const updatedData = {
        ...prev,
        [stepId]: { 
          ...(prev[stepId] || {}), 
          ...data,
          // Include schools context in step data
          schoolsContext: {
            schoolsCount: schools?.length || 0,
            primarySchoolId: schools?.[0]?.id || schools?.[0]?._id,
            primarySchoolName: schools?.[0]?.name,
            allSchools: schools
          }
        }
      };
      console.log("🔄 [OnboardingFlowProvider] Step data updated for", stepId, ":", updatedData[stepId]);
      return updatedData;
    });
  };

  const markStepCompleted = (stepId, payload = {}) => {
    console.log("✅ [OnboardingFlowProvider] markStepCompleted called for:", stepId, "with payload:", payload);
    console.log("🏫 [OnboardingFlowProvider] Schools context during markStepCompleted:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name
    });
    
    updateStepData(stepId, { 
      completed: true, 
      completedAt: new Date().toISOString(),
      schoolsContext: {
        schoolsCount: schools?.length || 0,
        primarySchoolId: schools?.[0]?.id || schools?.[0]?._id,
        primarySchoolName: schools?.[0]?.name,
        allSchools: schools
      },
      ...payload 
    });
  };

  const skipStep = (stepId, reason = "Skipped by user") => {
    console.log("⏭️ [OnboardingFlowProvider] skipStep called for:", stepId, "reason:", reason);
    console.log("🏫 [OnboardingFlowProvider] Schools context during skipStep:", {
      schoolsCount: schools?.length || 0,
      primarySchool: schools?.[0]?.name
    });
    
    updateStepData(stepId, { 
      skipped: true, 
      reason,
      skippedAt: new Date().toISOString(),
      schoolsContext: {
        schoolsCount: schools?.length || 0,
        primarySchoolId: schools?.[0]?.id || schools?.[0]?._id,
        primarySchoolName: schools?.[0]?.name,
        allSchools: schools
      }
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
    
    // Schools context - UPDATED: Expose schools array to consumers
    schools,
    schoolsCount: schools?.length || 0,
    primarySchool: schools?.[0],
    primarySchoolName: schools?.[0]?.name,
    primarySchoolId: schools?.[0]?.id || schools?.[0]?._id
  };

  console.log("🔄 [OnboardingFlowProvider] Context value updated:", {
    currentStep: value.currentStep?.id,
    currentStepIndex: value.currentStepIndex,
    hasSchools: !!value.schools,
    schoolsCount: value.schoolsCount,
    primarySchoolName: value.primarySchoolName,
    primarySchoolId: value.primarySchoolId,
    onboardingDataKeys: Object.keys(value.onboardingData)
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