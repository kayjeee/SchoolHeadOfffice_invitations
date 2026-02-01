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

      const payload = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
      };

      console.log('📤 Sending profile update with payload:', payload);
      console.log('🌐 URL:', `https://shobackendv2-production.up.railway.app/api/v1/users/update_profile?auth0_id=${encodedUserId}`);

      const response = await fetch(
        `https://shobackendv2-production.up.railway.app/api/v1/users/update_profile?auth0_id=${encodedUserId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }

      console.log('📥 Parsed response data:', result);
      setLastResponse(result);

      if (!response.ok) {
        const errorMessage =
          result.errors?.join(', ') ||
          result.error ||
          result.message ||
          `Server returned ${response.status}: ${response.statusText}`;

        console.error('❌ Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!result.success) {
        const errorMessage =
          result.errors?.join(', ') ||
          result.error ||
          'Profile update was not successful';
        
        console.error('❌ Backend returned unsuccessful:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Profile saved successfully:', result.data?.user);
      console.log('🚀 Calling onComplete callback with data:', data);

      onComplete(data);

      console.log('🎯 onComplete callback was called successfully');
    } catch (error: any) {
      console.error('❌ Failed to save profile:', error);
      setSaveError(
        error?.message || 'Failed to save profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Test with hardcoded data
  const testWithHardcodedData = () => {
    console.log('🧪 Testing with hardcoded data');
    const testData = {
      name: 'Test User',
      phone: '27814296653',
      email: 'test@example.com',
    };
    console.log('Test data:', testData);
    handleSave(testData);
  };

  // Test backend connection
  const testBackendConnection = async () => {
    console.log('🔗 Testing backend connection...');
    
    if (!user?.sub) {
      alert('❌ No user ID available');
      return;
    }
    
    const encodedUserId = encodeURIComponent(user.sub);
    const testUrl = `https://shobackendv2-production.up.railway.app/api/v1/users/show?auth0_id=${encodedUserId}`;
    
    console.log('🌐 Testing URL:', testUrl);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('📥 Test response status:', response.status);
      const result = await response.json();
      console.log('📥 Test response data:', result);
      
      if (result.success && result.data) {
        const userData = result.data.user || result.data;
        alert(`✅ Backend connection successful!\n\nName: ${userData.name || 'Not set'}\nEmail: ${userData.email || 'Not set'}\nPhone: ${userData.phone_number || userData.phone || 'Not set'}`);
      } else {
        alert('⚠️ Backend responded but no profile data found');
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      alert('❌ Failed to connect to backend. Check console for details.');
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