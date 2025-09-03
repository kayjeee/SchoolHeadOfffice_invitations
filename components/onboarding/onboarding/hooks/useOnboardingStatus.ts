
import { useState, useEffect } from "react";
import { onboardingService } from "../services/onboardingService";
import { OnboardingStatus, OnboardingRole } from "../types";

export const useOnboardingStatus = (userId: string) => {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const fetchedStatus = await onboardingService.fetchOnboardingStatus(userId);
        setStatus(fetchedStatus);
      } catch (err) {
        setError("Failed to fetch onboarding status.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStatus();
    }
  }, [userId]);

  const updateStatus = async (newStatus: Partial<OnboardingStatus>) => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const updated = await onboardingService.updateOnboardingStatus(userId, newStatus);
      setStatus(updated);
      return updated;
    } catch (err) {
      setError("Failed to update onboarding status.");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      await onboardingService.completeOnboarding(userId);
      setStatus((prev) => (prev ? { ...prev, isComplete: true } : null));
    } catch (err) {
      setError("Failed to complete onboarding.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { status, isLoading, error, updateStatus, completeOnboarding };
};


