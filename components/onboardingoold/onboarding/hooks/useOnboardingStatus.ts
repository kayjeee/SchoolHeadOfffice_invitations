import { useState, useEffect } from "react";
import { onboardingService } from "../services/onboardingService";
import { OnboardingStatus } from "../types";

export const useOnboardingStatus = (userId: string) => {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch onboarding status on mount or when userId changes
  useEffect(() => {
    const fetchStatus = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        const fetchedStatus = await onboardingService.getOnboardingStatus(userId);
        setStatus(fetchedStatus);
      } catch (err) {
        setError("Failed to fetch onboarding status.");
        console.error("❌ useOnboardingStatus fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  // Update onboarding status with partial changes
  const updateStatus = async (updates: Partial<OnboardingStatus>) => {
    if (!userId) return null;
    try {
      setIsLoading(true);
      const updated = await onboardingService.updateOnboardingStatus(userId, updates);
      setStatus(updated);
      return updated;
    } catch (err) {
      setError("Failed to update onboarding status.");
      console.error("❌ useOnboardingStatus update error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete the current onboarding step
  const completeStep = async (stepName: string, metadata: any = {}) => {
    if (!userId) return null;
    try {
      setIsLoading(true);
      await onboardingService.completeStep(userId, stepName, metadata);
      setStatus((prev) => prev ? { ...prev, isComplete: true } : null);
    } catch (err) {
      setError(`Failed to complete step: ${stepName}`);
      console.error("❌ useOnboardingStatus completeStep error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Skip a specific onboarding step
  const skipStep = async (stepName: string, reason: string = "") => {
    if (!userId) return null;
    try {
      setIsLoading(true);
      await onboardingService.skipStep(userId, stepName, reason);
    } catch (err) {
      setError(`Failed to skip step: ${stepName}`);
      console.error("❌ useOnboardingStatus skipStep error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset onboarding for the user
  const resetOnboarding = async (reason: string = "Reset from app") => {
    if (!userId) return null;
    try {
      setIsLoading(true);
      await onboardingService.resetOnboarding(userId, reason);
      setStatus(null);
    } catch (err) {
      setError("Failed to reset onboarding.");
      console.error("❌ useOnboardingStatus resetOnboarding error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    isLoading,
    error,
    updateStatus,
    completeStep,
    skipStep,
    resetOnboarding,
  };
};
