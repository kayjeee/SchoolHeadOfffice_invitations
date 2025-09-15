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
): Promise<any | null> => {
  // ---- Validation ----
  if (!auth0Id) {
    toast.error('Missing Auth0 ID. Please log in again.');
    return null;
  }

  if (!schoolId) {
    toast.error('Missing school ID. Please try again.');
    return null;
  }

  if (!Array.isArray(learners) || learners.length === 0) {
    toast.error('No learners found. Please upload a valid file before confirming.');
    return null;
  }

  // ---- Transform Payload to match backend expectations ----
  const payload = {
    learners: learners.map((learner) => ({
      ...learner,
      school_id: schoolId, // Match backend field name
      userAuth0Id: auth0Id, // Match backend field name
    })),
    userAuth0Id: auth0Id, // Also include at root level if backend expects it
    schoolId: schoolId     // Also include at root level if backend expects it
  };

  try {
    const response = await fetch('/api/learners/bulk_upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // Send the complete payload object
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.message || `Upload failed: ${response.status} ${response.statusText}`;
      
      toast.error(errorMessage);
      return null;
    }

    const result = await response.json();
    toast.success(`Upload successful! ${result.learnersInserted || result.inserted || 0} learners added.`);
    return result;
  } catch (error: any) {
    console.error('[uploadLearners] Error:', error);
    toast.error(error.message || 'Unexpected error during learners upload.');
    return null;
  }
};