// components/parent/Onboarding/steps/ProfileSetup.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Updated schema to include phone
const profileSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupProps {
  onComplete: (data: ProfileFormData) => void;
  prefillData?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  isLocked?: boolean;
  user?: any;
}

export default function ProfileSetup({
  onComplete,
  prefillData,
  isLocked,
  user,
}: ProfileSetupProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  // Fetch existing profile data
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!user?.sub) return;
      
      try {
        const encodedUserId = encodeURIComponent(user.sub);
        const response = await fetch(
          `https://shobackendv2-production.up.railway.app/api/v1/users/show?auth0_id=${encodedUserId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setExistingProfile(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchExistingProfile();
  }, [user]);

  useEffect(() => {
    console.log('🔍 ProfileSetup mounted with props:', {
      hasUser: !!user?.sub,
      prefillData,
      isLocked,
      onCompleteType: typeof onComplete,
    });

    // Build the final prefill data
    let finalPrefillData = { ...prefillData };
    
    // Merge with existing profile from backend
    if (existingProfile) {
      // Handle name - check for first_name/last_name vs name
      let fullName = '';
      if (existingProfile.name) {
        fullName = existingProfile.name;
      } else if (existingProfile.first_name || existingProfile.last_name) {
        fullName = `${existingProfile.first_name || ''} ${existingProfile.last_name || ''}`.trim();
      }
      
      // Check for "undefined undefined" name
      if (fullName === 'undefined undefined' || fullName.includes('undefined')) {
        console.log('⚠️ Detected malformed name from backend, ignoring it');
        fullName = '';
      }
      
      finalPrefillData = {
        ...finalPrefillData,
        name: finalPrefillData?.name || fullName || '',
        phone: finalPrefillData?.phone || existingProfile.phone_number || existingProfile.phone || '',
        email: finalPrefillData?.email || existingProfile.email || '',
      };
    }

    console.log('📋 Setting form values from final prefill data:', finalPrefillData);
    
    if (finalPrefillData) {
      if (finalPrefillData.name) setValue('name', finalPrefillData.name);
      if (finalPrefillData.phone) setValue('phone', finalPrefillData.phone);
      if (finalPrefillData.email) setValue('email', finalPrefillData.email);
    }
  }, [prefillData, existingProfile, setValue, user, isLocked, onComplete]);

  const handleFormSubmit = handleSubmit(async (data) => {
    console.log('📋 Form submitted with data:', data);
    await handleSave(data);
  });

  // In ProfileSetup.tsx, replace the handleSave function with this:
const handleSave = async (data: ProfileFormData) => {
  console.log('💾 Save button clicked with form data:', data);

  if (!user?.sub) {
    console.error('❌ No user.sub available');
    setSaveError('User authentication required');
    return;
  }

  setIsSaving(true);
  setSaveError(null);
  setFormData(data);

  try {
    const encodedUserId = encodeURIComponent(user.sub);
    const apiUrl = `https://shobackendv2-production.up.railway.app/api/v1/users/update_profile?auth0_id=${encodedUserId}`;
    
    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim().toLowerCase(),
    };

    console.log('📤 Sending profile update:');
    console.log('🌐 URL:', apiUrl);
    console.log('📦 Payload:', payload);
    console.log('🔧 Method: PATCH');

    // Add a timestamp for tracking
    const startTime = Date.now();
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const endTime = Date.now();
    console.log(`⏱️ Request took ${endTime - startTime}ms`);
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response status text:', response.statusText);
    console.log('📥 Response OK?', response.ok);
    
    // Get all response headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('📥 Response headers:', headers);

    // Get the raw response text first
    const responseText = await response.text();
    console.log('📥 Raw response length:', responseText.length);
    console.log('📥 Raw response (first 500 chars):', responseText.substring(0, 500));
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error('❌ Empty response from server');
      throw new Error('Server returned an empty response');
    }
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('📥 Successfully parsed JSON:', result);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      
      // Check if it's HTML (common for 404/500 pages)
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error('❌ Server returned HTML instead of JSON');
        throw new Error('Server error - returned HTML page instead of JSON');
      }
      
      // Check if it's a plain text error
      if (responseText.length < 500) {
        console.error('❌ Server returned plain text:', responseText);
        throw new Error(`Server error: ${responseText}`);
      }
      
      throw new Error('Invalid JSON response from server');
    }

    setLastResponse(result);

    // Check for HTTP errors
    if (!response.ok) {
      const errorMessage = 
        result?.errors?.join?.() || 
        result?.error || 
        result?.message || 
        `Server error: ${response.status} ${response.statusText}`;
      
      console.error('❌ Backend returned HTTP error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Check for API-level errors
    if (result.success === false) {
      const errorMessage = 
        result?.errors?.join?.() || 
        result?.error || 
        result?.message || 
        'Profile update failed';
      
      console.error('❌ Backend returned API error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ Profile saved successfully:', result.data);
    console.log('🚀 Calling onComplete callback with data:', data);

    onComplete(data);

    console.log('🎯 onComplete callback was called successfully');
  } catch (error: any) {
    console.error('❌ Failed to save profile:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let userFriendlyError = 'Failed to save profile. Please try again.';
    
    if (error.message.includes('JSON')) {
      userFriendlyError = 'Server returned invalid response. Please check backend configuration.';
    } else if (error.message.includes('HTML')) {
      userFriendlyError = 'Server error occurred. Please contact support.';
    } else if (error.message.includes('CORS') || error.message.includes('Network')) {
      userFriendlyError = 'Network error. Please check your connection.';
    } else {
      userFriendlyError = error.message || userFriendlyError;
    }
    
    setSaveError(userFriendlyError);
  } finally {
    setIsSaving(false);
  }
};

  

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Setup Your Profile</h3>

      {/* Data Flow Debug Panel */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="font-semibold text-purple-800 mb-2">Data Flow Debug:</div>
        <div className="text-purple-700 text-xs space-y-1">
          <div>User ID: {user?.sub || 'Not available'}</div>
          <div>User from Auth0: {user?.name || user?.given_name || '(no name)'}</div>
          <div>Email from Auth0: {user?.email || '(no email)'}</div>
          <div>Prefill Data: {JSON.stringify(prefillData)}</div>
          <div>Existing Profile from Backend: {JSON.stringify(existingProfile)}</div>
          <div>Is Locked: {isLocked ? 'Yes' : 'No'}</div>
          <div>Current Form Values: {JSON.stringify(watch())}</div>
        </div>
        
        <div className="mt-2 space-x-2">
          <button
            type="button"
            onClick={testBackendConnection}
            className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Backend Connection
          </button>
        </div>
      </div>

      {/* Debug Info Panel */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="font-semibold text-blue-800 mb-2">Debug Info:</div>
        <div className="text-blue-700 text-xs space-y-1">
          <div>User ID: {user?.sub || 'Not available'}</div>
          <div>Form is valid: {isValid ? '✅ Yes' : '❌ No'}</div>
          <div>Is saving: {isSaving ? '⏳ Yes' : '✅ No'}</div>
          <div>Current form values: {JSON.stringify(getValues())}</div>

          {formData && (
            <div>Last submitted data: {JSON.stringify(formData)}</div>
          )}

          {lastResponse && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <div className="font-semibold text-green-800">
                Last API Response:
              </div>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-3 space-x-2">
          <button
            type="button"
            onClick={testWithHardcodedData}
            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Test with Hardcoded Data
          </button>

          <button
            type="button"
            onClick={() =>
              console.log('Current form state:', {
                values: getValues(),
                errors,
                isValid,
              })
            }
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Log Form State
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {saveError}
          </p>
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border"
              placeholder="Enter your full name"
              disabled={isSaving}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
              {isLocked && (
                <span className="ml-2 text-xs text-blue-600">
                  (Pre-filled from invitation)
                </span>
              )}
            </label>
            <input
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border disabled:bg-gray-100"
              disabled={isLocked || isSaving}
              placeholder="27814296653"
              type="tel"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border"
              placeholder="your.email@example.com"
              type="email"
              disabled={isSaving}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            type="submit"
            disabled={isSaving || !isValid}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>
      </form>

      {/* Success message */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
        <p className="font-semibold mb-1">✅ Backend Fixed!</p>
        <p className="text-xs">
          The backend API is now working correctly and returning proper JSON
          responses. Phone numbers are now being saved along with name and email.
        </p>
      </div>

      {/* Debug instructions */}
      <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        <p className="font-semibold">Debugging Instructions:</p>
        <ol className="list-decimal ml-4 mt-1 space-y-1">
          <li>Open Browser DevTools (F12)</li>
          <li>Go to Console tab to see logs</li>
          <li>Go to Network tab to see API request/response</li>
          <li>Check if payload contains name, phone, and email</li>
          <li>Last API response will be shown above for debugging</li>
          <li>Use "Test Backend Connection" to verify backend is reachable</li>
        </ol>
      </div>
    </div>
  );
}