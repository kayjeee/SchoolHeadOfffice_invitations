
import { OnboardingStatus, OnboardingRole } from "../types";

// This is a mock API service. In a real application, you would replace these
// with actual API calls (e.g., using axios or fetch).

const MOCK_API_DELAY = 500;

export const onboardingService = {
async fetchOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const res = await fetch(`/api/v1/users/${userId}/onboarding_status`);
  if (!res.ok) throw new Error("Failed to fetch onboarding status");
  return res.json();
},

  async updateOnboardingStatus(
    userId: string,
    status: Partial<OnboardingStatus>
  ): Promise<OnboardingStatus> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentStatusString = localStorage.getItem(
          `onboardingStatus_${userId}`
        );
        const currentStatus: OnboardingStatus = currentStatusString
          ? JSON.parse(currentStatusString)
          : {
              currentStepId: "",
              completedSteps: [],
              isComplete: false,
              role: "admin",
            };

        const newStatus = { ...currentStatus, ...status };
        localStorage.setItem(
          `onboardingStatus_${userId}`,
          JSON.stringify(newStatus)
        );
        resolve(newStatus);
      }, MOCK_API_DELAY);
    });
  },

  async completeOnboarding(userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentStatusString = localStorage.getItem(
          `onboardingStatus_${userId}`
        );
        const currentStatus: OnboardingStatus = currentStatusString
          ? JSON.parse(currentStatusString)
          : {
              currentStepId: "",
              completedSteps: [],
              isComplete: false,
              role: "admin",
            };
        const newStatus = { ...currentStatus, isComplete: true };
        localStorage.setItem(
          `onboardingStatus_${userId}`,
          JSON.stringify(newStatus)
        );
        resolve(true);
      }, MOCK_API_DELAY);
    });
  },
};


