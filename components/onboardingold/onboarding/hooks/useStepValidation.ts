import { useState, useCallback } from "react";
import { stepValidators } from "../utils/stepValidators";
import { StepValidationResult } from "../types";

export const useStepValidation = (stepId: string) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateStep = useCallback(async (data: any) => {
    setIsValidating(true);
    const result = await stepValidators.validateStep(stepId, data);
    setErrors(result.errors || {});
    setIsValidating(false);
    return result;
  }, [stepId]);

  return { validationErrors: errors, isValidating, validateStep };
};
