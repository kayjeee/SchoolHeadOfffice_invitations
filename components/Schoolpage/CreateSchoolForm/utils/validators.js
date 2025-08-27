console.log('🔧 validators.js loaded');

/**
 * Validates the fields for Step 1 (Basic Information).
 * @param {Object} formData - The form data state.
 * @returns {boolean} True if validation passes, false otherwise.
 */
export const validateStep1 = (formData) => {
  const { schoolName, schoolEmail } = formData;
  console.log('🔍 Validating Step 1:', { schoolName, schoolEmail });
  if (!schoolName || !schoolEmail) {
    console.warn('⚠️ Validation failed for Step 1: Missing school name or email.');
    return false;
  }
  console.log('✅ Step 1 validation passed.');
  return true;
};

/**
 * Validates the fields for Step 2 (Address).
 * @param {Object} formData - The form data state.
 * @returns {boolean} True if validation passes, false otherwise.
 */
export const validateStep2 = (formData) => {
  const { schoolAddressLine1, country, province, city, postalCode } = formData;
  console.log('🔍 Validating Step 2:', { schoolAddressLine1, country, province, city, postalCode });
  if (!schoolAddressLine1 || !country || !province || !city || !postalCode) {
    console.warn('⚠️ Validation failed for Step 2: Missing required address fields.');
    return false;
  }
  console.log('✅ Step 2 validation passed.');
  return true;
};

/**
 * Validates the final form data before submission.
 * This can be more comprehensive than step-by-step validation.
 * @param {Object} formData - The complete form data state.
 * @returns {boolean} True if validation passes, false otherwise.
 */
export const validateFinalForm = (formData) => {
  console.log('🔍 Performing final form validation...');
  // Ensure all steps have valid data
  if (!validateStep1(formData)) {
    console.warn('⚠️ Final validation failed: Step 1 incomplete.');
    return false;
  }
  if (!validateStep2(formData)) {
    console.warn('⚠️ Final validation failed: Step 2 incomplete.');
    return false;
  }
  // You could add validation for Step 3 and 4 here as well if needed
  console.log('✅ Final validation passed.');
  return true;
};