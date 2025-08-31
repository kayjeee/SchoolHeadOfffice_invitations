
# Next.js Frontend Onboarding Flow Implementation Plan

## Overview

This comprehensive implementation plan outlines the development of a sophisticated onboarding flow for the Next.js frontend application. The plan leverages the existing component structure while introducing new onboarding-specific components, hooks, and services. The implementation follows modern React patterns, incorporates responsive design principles, and ensures seamless integration with the Ruby on Rails backend through well-defined API interactions.

The onboarding flow is designed to guide users through essential setup steps while providing flexibility for different user roles and scenarios. The system maintains state consistency, handles error conditions gracefully, and provides clear visual feedback throughout the user journey.

## Architecture Overview

### Component Structure

The onboarding system will follow a modular architecture that mirrors the existing `CreateSchoolForm` structure but extends it with additional functionality for status tracking, step validation, and backend synchronization. The architecture emphasizes reusability, maintainability, and scalability.

```
components/
 ├── onboarding/
 │    ├── OnboardingFlow/
 │    │    ├── index.js                    # Main onboarding container
 │    │    ├── steps/
 │    │    │    ├── Step1CreateGrades.js   # Grade creation step
 │    │    │    ├── Step2UploadLearners.js # Learner upload step
 │    │    │    ├── Step3SendInvites.js    # Invitation sending step
 │    │    │    ├── Step4AdminSetup.js     # Admin-specific setup
 │    │    │    ├── Step5ParentSetup.js    # Parent-specific setup
 │    │    │    ├── Step6GuestSetup.js     # Guest-specific setup
 │    │    │    └── StepCompletion.js      # Final completion step
 │    │    ├── hooks/
 │    │    │    ├── useOnboardingFlow.js   # Main onboarding state management
 │    │    │    ├── useOnboardingStatus.js # Backend status synchronization
 │    │    │    └── useStepValidation.js   # Step validation logic
 │    │    ├── services/
 │    │    │    ├── onboardingService.js   # API calls for onboarding
 │    │    │    └── stepProgressService.js # Progress tracking utilities
 │    │    ├── utils/
 │    │    │    ├── stepValidators.js      # Validation functions
 │    │    │    ├── progressCalculator.js  # Progress calculation
 │    │    │    └── roleBasedSteps.js      # Role-specific step logic
 │    │    ├── components/
 │    │    │    ├── ProgressIndicator.js   # Visual progress display
 │    │    │    ├── StepNavigation.js      # Navigation controls
 │    │    │    ├── StatusBadge.js         # Step completion status
 │    │    │    └── SkipStepModal.js       # Step skipping interface
 │    │    └── OnboardingGuard.js          # Route protection component
 │    │
 │    ├── shared/
 │    │    ├── LoadingSpinner.js           # Reused from existing
 │    │    ├── ErrorBoundary.js            # Error handling
 │    │    └── ConfirmationModal.js        # User confirmations
 │    │
 │    └── layouts/
 │         ├── OnboardingLayout.js         # Main onboarding layout
 │         └── StepLayout.js               # Individual step layout
```

### State Management Strategy

The onboarding system will implement a sophisticated state management approach that combines local React state with backend synchronization. This hybrid approach ensures optimal user experience while maintaining data consistency across sessions and devices.

The state management architecture includes several layers:

**Local State Layer**: Manages immediate UI interactions, form inputs, and temporary data that doesn't require persistence. This layer provides instant feedback and smooth user interactions without network delays.

**Synchronization Layer**: Handles the bidirectional communication between local state and the backend API. This layer implements optimistic updates, conflict resolution, and automatic retry mechanisms for robust data synchronization.

**Persistence Layer**: Manages long-term storage of onboarding progress, user preferences, and cached data. This layer ensures that users can resume their onboarding process across sessions and devices.

**Validation Layer**: Implements client-side validation rules that mirror backend constraints while providing immediate feedback to users. This layer reduces server load and improves user experience by catching errors early.

## Core Components Implementation

### 1. Main Onboarding Flow Container

The main onboarding container serves as the orchestrator for the entire onboarding experience. It manages the overall flow state, handles step transitions, and coordinates communication with the backend.

```jsx
// components/onboarding/OnboardingFlow/index.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { useOnboardingStatus } from './hooks/useOnboardingStatus';
import OnboardingLayout from '../layouts/OnboardingLayout';
import ProgressIndicator from './components/ProgressIndicator';
import StepNavigation from './components/StepNavigation';
import ErrorBoundary from '../shared/ErrorBoundary';
import LoadingSpinner from '../shared/LoadingSpinner';

// Step components
import Step1CreateGrades from './steps/Step1CreateGrades';
import Step2UploadLearners from './steps/Step2UploadLearners';
import Step3SendInvites from './steps/Step3SendInvites';
import Step4AdminSetup from './steps/Step4AdminSetup';
import Step5ParentSetup from './steps/Step5ParentSetup';
import Step6GuestSetup from './steps/Step6GuestSetup';
import StepCompletion from './steps/StepCompletion';

const OnboardingFlow = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    currentStep,
    steps,
    canProceed,
    canGoBack,
    nextStep,
    previousStep,
    goToStep,
    skipStep,
    completeOnboarding,
    isLoading: flowLoading,
    error: flowError
  } = useOnboardingFlow(user);

  const {
    onboardingStatus,
    updateStatus,
    completeStep,
    skipStepInBackend,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useOnboardingStatus(user?.auth0_id);

  // Initialize onboarding flow when user and status are loaded
  useEffect(() => {
    if (user && onboardingStatus && !isInitialized) {
      // Sync local state with backend status
      syncWithBackendStatus();
      setIsInitialized(true);
    }
  }, [user, onboardingStatus, isInitialized]);

  // Redirect completed users to main application
  useEffect(() => {
    if (onboardingStatus?.completed && isInitialized) {
      router.push('/dashboard');
    }
  }, [onboardingStatus?.completed, isInitialized, router]);

  const syncWithBackendStatus = () => {
    if (!onboardingStatus) return;
    
    // Determine current step based on backend status
    const backendCurrentStep = determineCurrentStepFromStatus(onboardingStatus);
    if (backendCurrentStep !== currentStep) {
      goToStep(backendCurrentStep);
    }
  };

  const determineCurrentStepFromStatus = (status) => {
    if (!status.createGrades) return 'create_grades';
    if (!status.uploadLearners) return 'upload_learners';
    if (!status.sendInvites) return 'send_invites';
    
    // Check role-specific steps
    const userRoles = user?.roles || [];
    if (userRoles.includes('admin') && !status.adminOnboardingCompleted) {
      return 'admin_setup';
    }
    if (userRoles.includes('parent') && !status.parentOnboardingCompleted) {
      return 'parent_setup';
    }
    if (userRoles.includes('guest') && !status.guestOnboardingCompleted) {
      return 'guest_setup';
    }
    
    return 'completion';
  };

  const handleStepComplete = async (stepName, stepData) => {
    try {
      // Update local state optimistically
      nextStep();
      
      // Sync with backend
      await completeStep(stepName);
      
      // Update backend with step-specific data if needed
      if (stepData) {
        await updateStatus({ [stepName]: true, ...stepData });
      }
      
      // Refetch status to ensure consistency
      await refetchStatus();
      
    } catch (error) {
      console.error('Error completing step:', error);
      // Revert optimistic update on error
      previousStep();
      // Show error to user
      setError(`Failed to complete step: ${error.message}`);
    }
  };

  const handleStepSkip = async (stepName, reason) => {
    try {
      // Update local state
      nextStep();
      
      // Sync with backend
      await skipStepInBackend(stepName, reason);
      
      // Refetch status
      await refetchStatus();
      
    } catch (error) {
      console.error('Error skipping step:', error);
      previousStep();
      setError(`Failed to skip step: ${error.message}`);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      await refetchStatus();
      
      // Redirect to main application
      router.push('/dashboard?onboarding_completed=true');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(`Failed to complete onboarding: ${error.message}`);
    }
  };

  // Render step component based on current step
  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      onSkip: handleStepSkip,
      onBack: previousStep,
      canProceed,
      canGoBack,
      user,
      onboardingStatus
    };

    switch (currentStep) {
      case 'create_grades':
        return <Step1CreateGrades {...stepProps} />;
      case 'upload_learners':
        return <Step2UploadLearners {...stepProps} />;
      case 'send_invites':
        return <Step3SendInvites {...stepProps} />;
      case 'admin_setup':
        return <Step4AdminSetup {...stepProps} />;
      case 'parent_setup':
        return <Step5ParentSetup {...stepProps} />;
      case 'guest_setup':
        return <Step6GuestSetup {...stepProps} />;
      case 'completion':
        return <StepCompletion {...stepProps} onComplete={handleCompleteOnboarding} />;
      default:
        return <div>Unknown step: {currentStep}</div>;
    }
  };

  // Show loading state while initializing
  if (authLoading || !isInitialized || flowLoading || statusLoading) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="large" message="Initializing onboarding..." />
        </div>
      </OnboardingLayout>
    );
  }

  // Show error state if there are critical errors
  if (flowError || statusError) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Onboarding Error
            </h2>
            <p className="text-gray-600 mb-4">
              {flowError?.message || statusError?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <ErrorBoundary>
      <OnboardingLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Indicator */}
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            completedSteps={getCompletedSteps(onboardingStatus)}
            className="mb-8"
          />

          {/* Main Step Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            {renderCurrentStep()}
          </div>

          {/* Navigation Controls */}
          <StepNavigation
            canGoBack={canGoBack}
            canProceed={canProceed}
            onBack={previousStep}
            onNext={nextStep}
            currentStep={currentStep}
            isLoading={flowLoading || statusLoading}
          />
        </div>
      </OnboardingLayout>
    </ErrorBoundary>
  );
};

// Helper function to get completed steps from onboarding status
const getCompletedSteps = (status) => {
  if (!status) return [];
  
  const completed = [];
  if (status.createGrades) completed.push('create_grades');
  if (status.uploadLearners) completed.push('upload_learners');
  if (status.sendInvites) completed.push('send_invites');
  if (status.adminOnboardingCompleted) completed.push('admin_setup');
  if (status.parentOnboardingCompleted) completed.push('parent_setup');
  if (status.guestOnboardingCompleted) completed.push('guest_setup');
  if (status.completed) completed.push('completion');
  
  return completed;
};

export default OnboardingFlow;
```

### 2. Onboarding Status Hook

The onboarding status hook manages the synchronization between the frontend and backend onboarding state. It provides a clean interface for updating status, handling errors, and maintaining consistency.

```jsx
// components/onboarding/OnboardingFlow/hooks/useOnboardingStatus.js
import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '../services/onboardingService';

export const useOnboardingStatus = (userId) => {
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch onboarding status from backend
  const fetchStatus = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.getStatus(userId);
      if (response.success) {
        setOnboardingStatus(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch onboarding status');
      }
    } catch (err) {
      console.error('Error fetching onboarding status:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update onboarding status
  const updateStatus = useCallback(async (updates) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.updateStatus(userId, updates);
      if (response.success) {
        setOnboardingStatus(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update onboarding status');
      }
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Complete a specific step
  const completeStep = useCallback(async (stepName) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.completeStep(userId, stepName);
      if (response.success) {
        setOnboardingStatus(response.data);
        return response.data;
      } else {
        throw new Error(response.message || `Failed to complete step: ${stepName}`);
      }
    } catch (err) {
      console.error(`Error completing step ${stepName}:`, err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Skip a specific step
  const skipStep = useCallback(async (stepName, reason) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.skipStep(userId, stepName, reason);
      if (response.success) {
        setOnboardingStatus(response.data);
        return response.data;
      } else {
        throw new Error(response.message || `Failed to skip step: ${stepName}`);
      }
    } catch (err) {
      console.error(`Error skipping step ${stepName}:`, err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Complete entire onboarding
  const completeOnboarding = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.completeOnboarding(userId);
      if (response.success) {
        setOnboardingStatus(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Reset onboarding (admin only)
  const resetOnboarding = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.resetOnboarding(userId);
      if (response.success) {
        setOnboardingStatus(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to reset onboarding');
      }
    } catch (err) {
      console.error('Error resetting onboarding:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get next step
  const getNextStep = useCallback(() => {
    if (!onboardingStatus) return null;
    return onboardingStatus.nextStep;
  }, [onboardingStatus]);

  // Check if step is completed
  const isStepCompleted = useCallback((stepName) => {
    if (!onboardingStatus) return false;
    
    const stepMapping = {
      'create_grades': 'createGrades',
      'upload_learners': 'uploadLearners',
      'send_invites': 'sendInvites',
      'admin_setup': 'adminOnboardingCompleted',
      'parent_setup': 'parentOnboardingCompleted',
      'guest_setup': 'guestOnboardingCompleted'
    };
    
    const statusKey = stepMapping[stepName];
    return statusKey ? onboardingStatus[statusKey] : false;
  }, [onboardingStatus]);

  // Check if step is skipped
  const isStepSkipped = useCallback((stepName) => {
    if (!onboardingStatus) return false;
    return onboardingStatus.skippedSteps?.includes(stepName) || false;
  }, [onboardingStatus]);

  // Get progress percentage
  const getProgressPercentage = useCallback(() => {
    if (!onboardingStatus) return 0;
    return onboardingStatus.progress?.percentage || 0;
  }, [onboardingStatus]);

  // Initial fetch when userId changes
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    onboardingStatus,
    isLoading,
    error,
    updateStatus,
    completeStep,
    skipStep: skipStep,
    completeOnboarding,
    resetOnboarding,
    refetch: fetchStatus,
    getNextStep,
    isStepCompleted,
    isStepSkipped,
    getProgressPercentage
  };
};
```

### 3. Onboarding Flow Hook

The onboarding flow hook manages the local state of the onboarding process, including step navigation, validation, and user interface state.

```jsx
// components/onboarding/OnboardingFlow/hooks/useOnboardingFlow.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRoleBasedSteps } from '../utils/roleBasedSteps';

export const useOnboardingFlow = (user) => {
  const [currentStep, setCurrentStep] = useState('create_grades');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [skippedSteps, setSkippedSteps] = useState(new Set());
  const [stepData, setStepData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get steps based on user roles
  const steps = useMemo(() => {
    if (!user) return [];
    return getRoleBasedSteps(user.roles || []);
  }, [user]);

  // Get current step index
  const currentStepIndex = useMemo(() => {
    return steps.findIndex(step => step.id === currentStep);
  }, [steps, currentStep]);

  // Check if user can proceed to next step
  const canProceed = useMemo(() => {
    const step = steps[currentStepIndex];
    if (!step) return false;
    
    // Check if current step is completed or can be skipped
    return completedSteps.has(currentStep) || step.canSkip;
  }, [steps, currentStepIndex, currentStep, completedSteps]);

  // Check if user can go back to previous step
  const canGoBack = useMemo(() => {
    return currentStepIndex > 0;
  }, [currentStepIndex]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextStepId = steps[currentStepIndex + 1].id;
      setCurrentStep(nextStepId);
      setError(null);
    }
  }, [currentStepIndex, steps]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStepId = steps[currentStepIndex - 1].id;
      setCurrentStep(prevStepId);
      setError(null);
    }
  }, [currentStepIndex, steps]);

  // Navigate to specific step
  const goToStep = useCallback((stepId) => {
    const stepExists = steps.some(step => step.id === stepId);
    if (stepExists) {
      setCurrentStep(stepId);
      setError(null);
    }
  }, [steps]);

  // Mark step as completed
  const markStepCompleted = useCallback((stepId, data = {}) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    setSkippedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId); // Remove from skipped if it was skipped before
      return newSet;
    });
    
    // Store step data
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }));
  }, []);

  // Skip step
  const skipStep = useCallback((stepId, reason = '') => {
    setSkippedSteps(prev => new Set([...prev, stepId]));
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId); // Remove from completed if it was completed before
      return newSet;
    });
    
    // Store skip reason
    setStepData(prev => ({
      ...prev,
      [stepId]: { skipped: true, reason }
    }));
  }, []);

  // Complete entire onboarding
  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mark all required steps as completed
      const requiredSteps = steps.filter(step => !step.optional);
      requiredSteps.forEach(step => {
        markStepCompleted(step.id);
      });
      
      // Navigate to completion step
      setCurrentStep('completion');
      
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [steps, markStepCompleted]);

  // Reset onboarding flow
  const resetFlow = useCallback(() => {
    setCurrentStep('create_grades');
    setCompletedSteps(new Set());
    setSkippedSteps(new Set());
    setStepData({});
    setError(null);
  }, []);

  // Get step by ID
  const getStep = useCallback((stepId) => {
    return steps.find(step => step.id === stepId);
  }, [steps]);

  // Get step status
  const getStepStatus = useCallback((stepId) => {
    if (completedSteps.has(stepId)) return 'completed';
    if (skippedSteps.has(stepId)) return 'skipped';
    if (stepId === currentStep) return 'current';
    
    // Check if step is accessible (all previous required steps completed)
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const previousSteps = steps.slice(0, stepIndex);
    const requiredPreviousSteps = previousSteps.filter(step => !step.optional);
    
    const allRequiredCompleted = requiredPreviousSteps.every(step => 
      completedSteps.has(step.id) || skippedSteps.has(step.id)
    );
    
    return allRequiredCompleted ? 'accessible' : 'locked';
  }, [steps, completedSteps, skippedSteps, currentStep]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (steps.length === 0) return 0;
    
    const totalSteps = steps.length;
    const completedCount = completedSteps.size;
    const skippedCount = skippedSteps.size;
    
    return Math.round(((completedCount + skippedCount) / totalSteps) * 100);
  }, [steps.length, completedSteps.size, skippedSteps.size]);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const step = getStep(currentStep);
    if (!step) return { isValid: false, errors: ['Invalid step'] };
    
    // Get step data
    const data = stepData[currentStep] || {};
    
    // Run step-specific validation
    if (step.validate) {
      return step.validate(data, user);
    }
    
    return { isValid: true, errors: [] };
  }, [currentStep, stepData, user, getStep]);

  // Initialize flow when user changes
  useEffect(() => {
    if (user && steps.length > 0) {
      // Reset to first step if current step is not valid for user's roles
      const validStepIds = steps.map(step => step.id);
      if (!validStepIds.includes(currentStep)) {
        setCurrentStep(steps[0].id);
      }
    }
  }, [user, steps, currentStep]);

  return {
    // State
    currentStep,
    steps,
    completedSteps: Array.from(completedSteps),
    skippedSteps: Array.from(skippedSteps),
    stepData,
    isLoading,
    error,
    
    // Computed values
    currentStepIndex,
    canProceed,
    canGoBack,
    progressPercentage,
    
    // Actions
    nextStep,
    previousStep,
    goToStep,
    markStepCompleted,
    skipStep,
    completeOnboarding,
    resetFlow,
    
    // Utilities
    getStep,
    getStepStatus,
    validateCurrentStep,
    
    // Setters
    setError
  };
};
```

### 4. Onboarding Service

The onboarding service handles all API communications with the Ruby on Rails backend, providing a clean interface for frontend components to interact with onboarding endpoints.

```jsx
// components/onboarding/OnboardingFlow/services/onboardingService.js
import { apiClient } from '@/lib/apiClient';

class OnboardingService {
  constructor() {
    this.baseUrl = '/api/v1/users';
  }

  // Get onboarding status for a user
  async getStatus(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}/onboarding_status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw this.handleError(error);
    }
  }

  // Update onboarding status
  async updateStatus(userId, updates) {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${userId}/onboarding_status`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw this.handleError(error);
    }
  }

  // Complete a specific step
  async completeStep(userId, stepName) {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${userId}/onboarding_status/complete_step`,
        { step_name: stepName }
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing step ${stepName}:`, error);
      throw this.handleError(error);
    }
  }

  // Skip a specific step
  async skipStep(userId, stepName, reason = '') {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${userId}/onboarding_status/skip_step`,
        { step_name: stepName, reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error skipping step ${stepName}:`, error);
      throw this.handleError(error);
    }
  }

  // Complete entire onboarding
  async completeOnboarding(userId) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${userId}/onboarding_status/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw this.handleError(error);
    }
  }

  // Reset onboarding (admin only)
  async resetOnboarding(userId) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${userId}/onboarding_status/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw this.handleError(error);
    }
  }

  // Get next step
  async getNextStep(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}/onboarding_status/next_step`);
      return response.data;
    } catch (error) {
      console.error('Error getting next step:', error);
      throw this.handleError(error);
    }
  }

  // Check if user needs onboarding
  async checkOnboardingRequired(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}/onboarding_required`);
      return response.data;
    } catch (error) {
      console.error('Error checking onboarding requirement:', error);
      throw this.handleError(error);
    }
  }

  // Bulk operations for admin users
  async getBulkStatus(userIds) {
    try {
      const response = await apiClient.post('/api/v1/onboarding_status/bulk_status', {
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bulk onboarding status:', error);
      throw this.handleError(error);
    }
  }

  async updateBulkStatus(updates) {
    try {
      const response = await apiClient.post('/api/v1/onboarding_status/bulk_update', updates);
      return response.data;
    } catch (error) {
      console.error('Error updating bulk onboarding status:', error);
      throw this.handleError(error);
    }
  }

  // Handle API errors consistently
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Bad request');
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error('Access denied');
        case 404:
          return new Error('Resource not found');
        case 422:
          return new Error(data.errors?.join(', ') || data.message || 'Validation failed');
        case 500:
          return new Error('Server error occurred');
        default:
          return new Error(data.message || `HTTP ${status} error`);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error - please check your connection');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
```

This comprehensive Next.js frontend implementation plan provides a robust foundation for the onboarding flow. The architecture emphasizes modularity, reusability, and maintainability while ensuring seamless integration with the Ruby on Rails backend. The implementation includes sophisticated state management, error handling, and user experience optimizations that will guide users through the onboarding process effectively.


## Step Components Implementation

### 5. Individual Step Components

Each step component follows a consistent pattern while providing step-specific functionality. The components are designed to be self-contained, reusable, and easily testable.

#### Step 1: Create Grades Component

```jsx
// components/onboarding/OnboardingFlow/steps/Step1CreateGrades.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PlusIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import StepLayout from '../../layouts/StepLayout';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { gradeService } from '@/services/gradeService';

// Validation schema
const gradeSchema = yup.object().shape({
  grades: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Grade name is required'),
      description: yup.string(),
      minAge: yup.number().min(0, 'Minimum age must be positive').nullable(),
      maxAge: yup.number().min(0, 'Maximum age must be positive').nullable(),
      capacity: yup.number().min(1, 'Capacity must be at least 1').required('Capacity is required')
    })
  ).min(1, 'At least one grade is required')
});

const Step1CreateGrades = ({ onComplete, onSkip, canProceed, canGoBack, user, onboardingStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [existingGrades, setExistingGrades] = useState([]);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(gradeSchema),
    defaultValues: {
      grades: [
        {
          name: '',
          description: '',
          minAge: null,
          maxAge: null,
          capacity: 30
        }
      ]
    },
    mode: 'onChange'
  });

  const watchedGrades = watch('grades');

  // Load existing grades if any
  useEffect(() => {
    loadExistingGrades();
  }, []);

  const loadExistingGrades = async () => {
    try {
      setIsLoading(true);
      const userSchools = user.schools || [];
      
      if (userSchools.length > 0) {
        // Load grades for user's schools
        const grades = await gradeService.getGradesBySchool(userSchools[0].id);
        setExistingGrades(grades);
        
        // If grades exist, populate form with existing data
        if (grades.length > 0) {
          setValue('grades', grades.map(grade => ({
            id: grade.id,
            name: grade.name,
            description: grade.description || '',
            minAge: grade.minAge,
            maxAge: grade.maxAge,
            capacity: grade.capacity || 30
          })));
        }
      }
    } catch (err) {
      console.error('Error loading existing grades:', err);
      setError('Failed to load existing grades');
    } finally {
      setIsLoading(false);
    }
  };

  const addGrade = () => {
    const currentGrades = watchedGrades || [];
    setValue('grades', [
      ...currentGrades,
      {
        name: '',
        description: '',
        minAge: null,
        maxAge: null,
        capacity: 30
      }
    ]);
  };

  const removeGrade = (index) => {
    const currentGrades = watchedGrades || [];
    if (currentGrades.length > 1) {
      setValue('grades', currentGrades.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create or update grades
      const gradePromises = data.grades.map(async (gradeData) => {
        if (gradeData.id) {
          // Update existing grade
          return await gradeService.updateGrade(gradeData.id, gradeData);
        } else {
          // Create new grade
          return await gradeService.createGrade({
            ...gradeData,
            schoolId: user.schools[0]?.id,
            createdBy: user.auth0_id
          });
        }
      });

      const createdGrades = await Promise.all(gradePromises);
      
      // Complete the step
      await onComplete('create_grades', {
        gradesCreated: createdGrades.length,
        gradeIds: createdGrades.map(grade => grade.id)
      });

    } catch (err) {
      console.error('Error creating grades:', err);
      setError(err.message || 'Failed to create grades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip('create_grades', 'User chose to skip grade creation');
  };

  if (isLoading && existingGrades.length === 0) {
    return (
      <StepLayout
        title="Create Grades"
        description="Loading existing grades..."
        icon={<BookOpenIcon className="w-8 h-8" />}
      >
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      title="Create Grades"
      description="Set up the grade levels for your school. You can add multiple grades with different age ranges and capacities."
      icon={<BookOpenIcon className="w-8 h-8 text-blue-600" />}
      step="1"
      totalSteps="6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {existingGrades.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800">
              We found {existingGrades.length} existing grade(s) in your school. 
              You can modify them below or add new ones.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {watchedGrades?.map((grade, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Grade {index + 1}
                </h4>
                {watchedGrades.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGrade(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Name *
                  </label>
                  <input
                    type="text"
                    {...register(`grades.${index}.name`)}
                    placeholder="e.g., Grade 1, Kindergarten"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.grades?.[index]?.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.grades[index].name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    {...register(`grades.${index}.capacity`)}
                    placeholder="30"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.grades?.[index]?.capacity && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.grades[index].capacity.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register(`grades.${index}.description`)}
                    placeholder="Optional description for this grade"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Age (months)
                  </label>
                  <input
                    type="number"
                    {...register(`grades.${index}.minAge`)}
                    placeholder="60"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Age (months)
                  </label>
                  <input
                    type="number"
                    {...register(`grades.${index}.maxAge`)}
                    placeholder="72"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addGrade}
          className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Another Grade
        </button>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Skip This Step
          </button>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <LoadingSpinner size="small" className="mr-2" />}
            Create Grades & Continue
          </button>
        </div>
      </form>
    </StepLayout>
  );
};

export default Step1CreateGrades;
```

#### Step 2: Upload Learners Component

```jsx
// components/onboarding/OnboardingFlow/steps/Step2UploadLearners.js
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UserGroupIcon, DocumentArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import StepLayout from '../../layouts/StepLayout';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { learnerService } from '@/services/learnerService';
import { csvParser } from '@/utils/csvParser';

const Step2UploadLearners = ({ onComplete, onSkip, canProceed, canGoBack, user, onboardingStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);
    setValidationErrors([]);

    try {
      setIsLoading(true);
      
      // Parse CSV file
      const parsed = await csvParser.parseFile(file);
      
      // Validate data
      const validation = validateLearnerData(parsed.data);
      
      if (validation.errors.length > 0) {
        setValidationErrors(validation.errors);
      } else {
        setParsedData(validation.validData);
      }
      
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Failed to parse file. Please ensure it\'s a valid CSV file.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const validateLearnerData = (data) => {
    const errors = [];
    const validData = [];
    
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth'];
    
    data.forEach((row, index) => {
      const rowErrors = [];
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          rowErrors.push(`${field} is required`);
        }
      });
      
      // Validate date of birth
      if (row.dateOfBirth) {
        const dob = new Date(row.dateOfBirth);
        if (isNaN(dob.getTime())) {
          rowErrors.push('Invalid date of birth format');
        }
      }
      
      // Validate email if provided
      if (row.email && !isValidEmail(row.email)) {
        rowErrors.push('Invalid email format');
      }
      
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 1,
          errors: rowErrors,
          data: row
        });
      } else {
        validData.push({
          ...row,
          dateOfBirth: new Date(row.dateOfBirth)
        });
      }
    });
    
    return { errors, validData };
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUploadLearners = async () => {
    if (!parsedData || parsedData.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const userSchools = user.schools || [];
      const schoolId = userSchools[0]?.id;
      
      if (!schoolId) {
        throw new Error('No school found for user');
      }

      // Upload learners in batches
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < parsedData.length; i += batchSize) {
        batches.push(parsedData.slice(i, i + batchSize));
      }

      let uploadedCount = 0;
      const totalLearners = parsedData.length;

      for (const batch of batches) {
        const batchData = batch.map(learner => ({
          ...learner,
          schoolId,
          createdBy: user.auth0_id
        }));

        await learnerService.createBulkLearners(batchData);
        
        uploadedCount += batch.length;
        setUploadProgress(Math.round((uploadedCount / totalLearners) * 100));
      }

      // Complete the step
      await onComplete('upload_learners', {
        learnersUploaded: uploadedCount,
        fileName: uploadedFile.name
      });

    } catch (err) {
      console.error('Error uploading learners:', err);
      setError(err.message || 'Failed to upload learners');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSkip = () => {
    onSkip('upload_learners', 'User chose to skip learner upload');
  };

  const downloadTemplate = () => {
    const template = [
      ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone', 'address'],
      ['John', 'Doe', '2015-06-15', 'male', 'parent@example.com', '+1234567890', '123 Main St'],
      ['Jane', 'Smith', '2014-09-22', 'female', 'parent2@example.com', '+0987654321', '456 Oak Ave']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learners_template.csv';
    link.click();
    
    window.URL.revokeObjectURL(url);
  };

  return (
    <StepLayout
      title="Upload Learners"
      description="Upload your student/learner data using a CSV file. You can download a template to get started."
      icon={<UserGroupIcon className="w-8 h-8 text-green-600" />}
      step="2"
      totalSteps="6"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-blue-800 font-medium">Need a template?</h4>
              <p className="text-blue-600 text-sm">
                Download our CSV template to ensure your data is formatted correctly.
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download Template
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          {isDragActive ? (
            <p className="text-blue-600">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop your CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports CSV, XLS, and XLSX files up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* File Processing Status */}
        {isLoading && (
          <div className="text-center py-4">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Processing file...</p>
            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-yellow-800 font-medium mb-2">
              Data Validation Issues
            </h4>
            <div className="max-h-40 overflow-y-auto">
              {validationErrors.slice(0, 10).map((error, index) => (
                <div key={index} className="text-sm text-yellow-700 mb-1">
                  Row {error.row}: {error.errors.join(', ')}
                </div>
              ))}
              {validationErrors.length > 10 && (
                <p className="text-sm text-yellow-600">
                  ... and {validationErrors.length - 10} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Parsed Data Preview */}
        {parsedData && parsedData.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="text-green-800 font-medium mb-2">
              Ready to Upload
            </h4>
            <p className="text-green-700 text-sm mb-4">
              Found {parsedData.length} valid learner records in your file.
            </p>
            
            {/* Preview table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-green-200">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Date of Birth</th>
                    <th className="text-left py-2">Gender</th>
                    <th className="text-left py-2">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((learner, index) => (
                    <tr key={index} className="border-b border-green-100">
                      <td className="py-2">
                        {learner.firstName} {learner.lastName}
                      </td>
                      <td className="py-2">
                        {learner.dateOfBirth.toLocaleDateString()}
                      </td>
                      <td className="py-2">{learner.gender || 'N/A'}</td>
                      <td className="py-2">{learner.email || learner.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <p className="text-green-600 text-sm mt-2">
                  ... and {parsedData.length - 5} more records
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Skip This Step
          </button>

          <button
            onClick={handleUploadLearners}
            disabled={!parsedData || parsedData.length === 0 || isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <LoadingSpinner size="small" className="mr-2" />}
            Upload {parsedData?.length || 0} Learners
          </button>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step2UploadLearners;
```

## Routing and Navigation Implementation

### 6. Onboarding Guard Component

The onboarding guard component protects routes and redirects users to onboarding when necessary:

```jsx
// components/onboarding/OnboardingGuard.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { onboardingService } from './OnboardingFlow/services/onboardingService';
import LoadingSpinner from './shared/LoadingSpinner';

const OnboardingGuard = ({ children, requireOnboarding = true }) => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Routes that should bypass onboarding check
  const exemptRoutes = [
    '/onboarding',
    '/auth/login',
    '/auth/logout',
    '/auth/callback',
    '/api',
    '/_next',
    '/favicon.ico'
  ];

  // Check if current route is exempt
  const isExemptRoute = exemptRoutes.some(route => 
    router.pathname.startsWith(route)
  );

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, router.pathname]);

  const checkOnboardingStatus = async () => {
    // Skip check if user is not loaded or route is exempt
    if (authLoading || !user || isExemptRoute) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await onboardingService.checkOnboardingRequired(user.auth0_id);
      
      if (response.success) {
        const { needsOnboarding, onboardingStatus: status, canAccessMainFeatures } = response.data;
        
        setOnboardingStatus(status);

        // Redirect logic
        if (requireOnboarding && needsOnboarding) {
          // User needs onboarding but is not on onboarding page
          if (!router.pathname.startsWith('/onboarding')) {
            // Check if user can access main features with partial onboarding
            if (!canAccessMainFeatures) {
              router.replace('/onboarding');
              return;
            }
          }
        } else if (!needsOnboarding && router.pathname.startsWith('/onboarding')) {
          // User completed onboarding but is still on onboarding page
          router.replace('/dashboard');
          return;
        }
      }
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      setError(err);
      
      // On error, allow access but log the issue
      if (process.env.NODE_ENV === 'development') {
        console.warn('Onboarding check failed, allowing access in development mode');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Checking onboarding status..." />
      </div>
    );
  }

  // Show error state (but still render children to avoid blocking)
  if (error && process.env.NODE_ENV === 'production') {
    console.error('Onboarding guard error:', error);
    // In production, log error but don't block access
  }

  // Render children if all checks pass
  return children;
};

export default OnboardingGuard;
```

### 7. Next.js App Integration

Update the Next.js `_app.js` to include the onboarding guard:

```jsx
// pages/_app.js
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import OnboardingGuard from '@/components/onboarding/OnboardingGuard';
import '@/styles/globals.css';

function MyApp({ Component, pageProps, router }) {
  // Determine if the current page requires onboarding check
  const requireOnboarding = !router.pathname.startsWith('/auth') && 
                           !router.pathname.startsWith('/public') &&
                           router.pathname !== '/';

  return (
    <AuthProvider>
      <ToastProvider>
        <OnboardingGuard requireOnboarding={requireOnboarding}>
          <Component {...pageProps} />
        </OnboardingGuard>
      </ToastProvider>
    </AuthProvider>
  );
}

export default MyApp;
```

### 8. Onboarding Page Implementation

Create the main onboarding page:

```jsx
// pages/onboarding/index.js
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { withAuth } from '@/hoc/withAuth';

const OnboardingPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Complete Your Setup - School Management System</title>
        <meta 
          name="description" 
          content="Complete your school setup by creating grades, uploading learners, and configuring your account." 
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <OnboardingFlow />
    </>
  );
};

// Protect the page with authentication
export default withAuth(OnboardingPage);

// Optional: Server-side props for additional security
export const getServerSideProps = async (context) => {
  // You can add server-side authentication checks here
  // For now, we'll rely on client-side auth
  
  return {
    props: {}
  };
};
```

### 9. Dashboard Integration

Update the dashboard to show onboarding completion status:

```jsx
// pages/dashboard/index.js
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { onboardingService } from '@/components/onboarding/OnboardingFlow/services/onboardingService';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { withAuth } from '@/hoc/withAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
    
    // Check if user just completed onboarding
    if (router.query.onboarding_completed === 'true') {
      // Show success message
      showOnboardingCompletionMessage();
    }
  }, [user, router.query]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const response = await onboardingService.getStatus(user.auth0_id);
      if (response.success) {
        setOnboardingStatus(response.data);
        
        // Show banner if onboarding is not completed
        if (!response.data.completed) {
          setShowOnboardingBanner(true);
        }
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    }
  };

  const showOnboardingCompletionMessage = () => {
    // You can use a toast notification library here
    console.log('Onboarding completed successfully!');
  };

  const handleContinueOnboarding = () => {
    router.push('/onboarding');
  };

  const dismissOnboardingBanner = () => {
    setShowOnboardingBanner(false);
  };

  return (
    <>
      <Head>
        <title>Dashboard - School Management System</title>
        <meta name="description" content="Manage your school with our comprehensive dashboard." />
      </Head>

      <DashboardLayout>
        {/* Onboarding Status Banner */}
        {showOnboardingBanner && onboardingStatus && !onboardingStatus.completed && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-yellow-700">
                  <strong>Complete your setup:</strong> You're {onboardingStatus.progress?.percentage || 0}% done. 
                  Finish setting up your school to access all features.
                </p>
                <div className="mt-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleContinueOnboarding}
                      className="bg-yellow-100 px-3 py-1 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                    >
                      Continue Setup
                    </button>
                    <button
                      onClick={dismissOnboardingBanner}
                      className="bg-yellow-100 px-3 py-1 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Completion Celebration */}
        {onboardingStatus?.completed && router.query.onboarding_completed === 'true' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Welcome to your school!</strong> You've successfully completed the setup process. 
                  You can now access all features of the school management system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening at your school today.
            </p>
          </div>

          {/* Dashboard widgets and content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add your dashboard widgets here */}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default withAuth(Dashboard);
```

This comprehensive Next.js frontend implementation provides a complete onboarding flow that seamlessly integrates with the Ruby on Rails backend. The implementation includes sophisticated state management, error handling, file upload capabilities, data validation, and responsive design. The modular architecture ensures maintainability and scalability while providing an excellent user experience throughout the onboarding process.

