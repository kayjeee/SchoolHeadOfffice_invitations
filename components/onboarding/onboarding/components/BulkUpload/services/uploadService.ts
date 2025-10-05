import { Learner } from '../types';
import toast from 'react-hot-toast';

/**
 * Upload learners to the backend API.
 *
 * @param auth0Id - Current user's Auth0 ID
 * @param schoolId - Current school ID
 * @param learners - Array of learner objects
 * @returns JSON response from API, or null if validation/API fails
 */
export const uploadLearners = async (
  auth0Id: string,
  schoolId: string,
  learners: Learner[]
): Promise<any> => { // Remove | null return type
  // ---- Validation ----
  if (!auth0Id) {
    throw new Error('Missing Auth0 ID. Please log in again.');
  }

  if (!schoolId) {
    throw new Error('Missing school ID. Please try again.');
  }

  if (!Array.isArray(learners) || learners.length === 0) {
    throw new Error('No learners found. Please upload a valid file before confirming.');
  }

  // ---- Transform Payload ----
  const payload = {
    learners: learners.map((learner) => ({
      ...learner,
      school_id: schoolId,
      userAuth0Id: auth0Id,
    })),
    userAuth0Id: auth0Id,
    schoolId: schoolId
  };

  try {
    const response = await fetch('/api/learners/bulk_upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.message || `Upload failed: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    toast.success(`Upload successful! ${result.learnersInserted || result.inserted || 0} learners added.`);
    return result;
  } catch (error: any) {
    console.error('[uploadLearners] Error:', error);
    toast.error(error.message || 'Unexpected error during learners upload.');
    throw error; // Re-throw the error
  }
};