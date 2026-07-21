import { normalizeHeader } from '../utils/helpers';

export const validatePhoneNumber = (phone: string): boolean => {
  return /^\+?(\d[\d\s\-\(\)]*)$/.test(phone);
};

export const validateRequiredFields = (learner: any): string[] => {
  const errors: string[] = [];
  if (!learner.firstName) errors.push('First name is required.');
  if (!learner.lastName) errors.push('Last name is required.');
  return errors;
};

export const validateLearnerData = (learner: any): { errors: string[]; warnings: string[] } => {
  const errors = validateRequiredFields(learner);
  const warnings: string[] = [];

  if (learner.phone && !validatePhoneNumber(learner.phone)) {
    warnings.push('Phone number format might be incorrect.');
  }
  if (learner.whatsapp && !validatePhoneNumber(learner.whatsapp)) {
    warnings.push('WhatsApp number format might be incorrect.');
  }

  return { errors, warnings };
};