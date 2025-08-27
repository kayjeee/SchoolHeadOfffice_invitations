
console.log('📦 schoolService.js loaded');

/**
 * Fetches Auth0 management API access token from a custom API route.
 * @returns {Promise<string>} The Auth0 access token.
 */
export const getAccessToken = async () => {
  console.log('🔐 Requesting Auth0 access token...');
  try {
    const response = await fetch('/api/getAccessToken', {
      method: 'POST',
    });
    if (!response.ok) {
      console.error('❌ Failed to fetch access token:', response.statusText);
      throw new Error('Failed to fetch Auth0 access token');
    }
    const data = await response.json();
    console.log('✅ Auth0 access token retrieved successfully');
    return data.accessToken;
  } catch (error) {
    console.error('💥 Error in getAccessToken:', error);
    throw error;
  }
};

/**
 * Uploads a file to Cloudinary.
 * @param {File} file The file to upload.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
// services/schoolService.js
export const uploadFileToCloudinary = async (file) => {
  if (!file) return '';

  // Helpful debug — make sure we really have a File
  console.log('🖼️ Cloudinary upload — file details:', {
    isFile: typeof File !== 'undefined' && file instanceof File,
    name: file?.name,
    type: file?.type,
    size: file?.size
  });

  // ⛳ Make sure you set these in your .env.* and restart dev server
  const CLOUD_NAME   = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'chameleon-techie';
  const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || 'w1ofo4vi';

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Missing Cloudinary env vars REACT_APP_CLOUDINARY_CLOUD_NAME / REACT_APP_CLOUDINARY_PRESET');
  }

  // NOTE: UPLOAD_PRESET must be an **unsigned** preset for direct browser uploads
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  // Optional nice-to-have:
  // formData.append('folder', 'schools/logos');

  const res = await fetch(endpoint, { method: 'POST', body: formData });

  // Read the raw text first so we can log Cloudinary's exact error if any
  const raw = await res.text();
  if (!res.ok) {
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      message = parsed?.error?.message || raw;
    } catch {}
    console.error('❌ Cloudinary upload failed:', res.status, message);
    throw new Error(message);
  }

  const data = JSON.parse(raw);
  console.log('✅ Cloudinary upload success:', data.secure_url);
  return data.secure_url;
};


/**
 * Assigns a specific role to a user in Auth0.
 * @param {string} userId The Auth0 user ID.
 * @param {string} accessToken The Auth0 Management API access token.
 * @param {string[]} roles An array of Auth0 role IDs to assign.
 */
export const assignAuth0Role = async (userId, accessToken, roles) => {
  console.log(`👑 Assigning roles [${roles.join(', ')}] to user ${userId} in Auth0.`);
  const encodedUserId = encodeURIComponent(userId);
  try {
    const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN || 'dev-t0o26rre86m7t8lo.us.auth0.com'}/api/v2/users/${encodedUserId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Auth0 role assignment failed:', response.statusText, errorText);
      throw new Error('Error updating user role in Auth0');
    }
    console.log('✅ Auth0 role assigned successfully.');
  } catch (error) {
    console.error('💥 Error assigning Auth0 role:', error);
    throw error;
  }
};

/**
 * Synchronizes user roles with the backend database.
 * @param {string} userId The Auth0 user ID.
 * @param {string[]} roles An array of role strings (e.g., ['Admin']).
 */
export const syncBackendRole = async (userId, roles) => {
  console.log(`🔄 Synchronizing backend roles [${roles.join(', ')}] for user ${userId}.`);
  const encodedUserId = encodeURIComponent(userId);
  try {
    const response = await fetch(`http://localhost:4000/api/v1/users/${encodedUserId}/update_roles`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend role synchronization failed:', response.statusText, errorText);
      throw new Error('Error updating user role in backend');
    }
    console.log('✅ Backend role synchronized successfully.');
  } catch (error) {
    console.error('💥 Error synchronizing backend role:', error);
    throw error;
  }e
};
/**
 * Creates a new school in the backend.
 * @param {Object} schoolPayload The school data to send.
 * @returns {Promise<Object>} The created school data from backend.
 */
export const createSchool = async (schoolPayload) => {
  console.log('🏫 Sending school creation payload to backend:', schoolPayload);

  try {
    const response = await fetch(`http://localhost:4000/api/v1/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ School creation failed:', response.status, errorText);
      throw new Error(errorText || 'Error creating school in backend');
    }

    const data = await response.json();
    console.log('✅ School created successfully in backend:', data);
    return data;
  } catch (error) {
    console.error('💥 Error creating school:', error);
    throw error;
  }
};

/**
 * Adds a school ID to the user's list of schools in the backend.
 * @param {string} userId The Auth0 user ID.
 * @param {string} schoolId The ID of the newly created school.
 */
export const addSchoolToUser = async (userId, schoolId) => {
  console.log(`➕ Adding school ${schoolId} to user ${userId}'s schools array.`);
  const encodedUserId = encodeURIComponent(userId);
  try {
    const response = await fetch(`http://localhost:4000/api/v1/users/${encodedUserId}/add_school`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to add school to user:', response.statusText, errorText);
      throw new Error('Error adding school to user in backend');
    }
    console.log('✅ School added to user successfully.');
  } catch (error) {
    console.error('💥 Error adding school to user:', error);
    throw error;
  }
};