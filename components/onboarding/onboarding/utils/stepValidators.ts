
import { OnboardingStep, StepValidationResult } from "../types";

// In a real application, you would integrate with a validation library like Yup or Zod.
// For now, this is a placeholder.

export const stepValidators = {
  async validateStep(stepId: string, data: any): Promise<StepValidationResult> {
    // This is a mock validation. Replace with actual validation logic.
    console.log(`Validating step ${stepId} with data:`, data);

    switch (stepId) {
      case "Step1CreateGrades":
        if (!data || !data.gradesCreated) {
          return { isValid: false, errors: { gradesCreated: "Please create grades." } };
        }
        break;
      case "Step2UploadLearners":
        // This step is skippable, so validation might be less strict or conditional
        break;
      case "Step3SendInvites":
        if (!data || !data.invitesSent) {
          return { isValid: false, errors: { invitesSent: "Please send invites." } };
        }
        break;
      case "StepCompletion":
        // No specific validation needed for completion step
        break;
      default:
        break;
    }

    return { isValid: true };
  },
};


