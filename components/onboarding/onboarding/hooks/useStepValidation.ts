
import { useState, useCallback } from "react";
import { stepValidators } from "../utils/stepValidators";
import { StepValidationResult } from "../types";

export const useStepValidation = () => {
  const [validationResult, setValidationResult] = useState<StepValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateStep = useCallback(async (stepId: string, data: any) => {
    setIsValidating(true);
    const result = await stepValidators.validateStep(stepId, data);
    setValidationResult(result);
    setIsValidating(false);
    return result;
  }, []);

  return { validationResult, isValidating, validateStep };
};


