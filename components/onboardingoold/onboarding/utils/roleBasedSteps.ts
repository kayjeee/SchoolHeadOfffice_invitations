import { OnboardingStep, OnboardingRole } from "../types";
import Step1CreateGrades from "../OnboardingFlow/Step1CreateGrades";
import Step2UploadLearners from "../OnboardingFlow/Step2UploadLearners";
import Step3SendInvites from "../OnboardingFlow/Step3SendInvites";
import StepCompletion from "../OnboardingFlow/StepCompletion";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "Step1CreateGrades", name: "Create Grades", component: Step1CreateGrades, roles: ["admin", "teacher"] },
  { id: "Step2UploadLearners", name: "Upload Learners", component: Step2UploadLearners, roles: ["admin", "teacher"] },
  { id: "Step3SendInvites", name: "Send Invites", component: Step3SendInvites, roles: ["admin"] },
  { id: "StepCompletion", name: "Completion", component: StepCompletion, roles: ["admin", "teacher", "student"] },
];

export const getRoleBasedSteps = (role: OnboardingRole): OnboardingStep[] => {
  return ONBOARDING_STEPS.filter(step => step.roles.includes(role));
};
