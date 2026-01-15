// components/parent/Onboarding/steps/ProfileSetup.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API_CONFIG } from '../../../../lib/config/api';

// Match the exact field names your backend expects
const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupProps {
  onComplete: (data: ProfileFormData) => void;
  prefillData?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
  };
  isLocked?: boolean;
  user?: any;
}

export default function ProfileSetup({ onComplete, prefillData, isLocked, user }: ProfileSetupProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // Validate on change for better UX
  });

  // Watch form values for debugging
  const watchedValues = watch();

  useEffect(() => {
    console.log('🔍 ProfileSetup mounted with props:', {
      hasUser: !!user?.sub,
      prefillData,
      isLocked,
      onCompleteType: typeof onComplete,
    });

    if (prefillData) {
      console.log('📋 Setting form values from prefillData:', prefillData);
      // Set initial values from prefillData
      if (prefillData.first_name) setValue('first_name', prefillData.first_name);
      if (prefillData.last_name) setValue('last_name', prefillData.last_name);
      if (prefillData.phone) setValue('phone', prefillData.phone);
      if (prefillData.email) setValue('email', prefillData.email);
    }
  }, [prefillData, setValue, user, isLocked, onComplete]);

  // Debug: Log form changes
  useEffect(() => {
    console.log('📝 Form values changed:', watchedValues);
  }, [watchedValues]);

  const handleFormSubmit = handleSubmit(async (data) => {
    console.log('📋 Form submitted with data:', data);
    console.log('🔍 first_name value:', data.first_name);
    console.log('🔍 last_name value:', data.last_name);
    console.log('🔍 phone value:', data.phone);
    console.log('🔍 email value:', data.email);
    
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
      // Encode the user ID properly (auth0 IDs contain pipe characters)
      const encodedUserId = encodeURIComponent(user.sub);
      
      // Create the exact payload structure that backend expects
      const payload = {
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          email: data.email,
        }
      };
      
      console.log('📤 Sending profile update with payload:', payload);
      console.log('🔍 Payload keys:', Object.keys(payload.user));
      console.log('🔍 first_name exists?', 'first_name' in payload.user, 'value:', payload.user.first_name);
      console.log('🔍 last_name exists?', 'last_name' in payload.user, 'value:', payload.user.last_name);
      console.log('🔍 Raw JSON string:', JSON.stringify(payload));
      
      // Save to backend - match the exact format from your working curl command
      const response = await fetch(
        `${API_CONFIG.FULL_CLIENT_API_URL}/users/${encodedUserId}/update_profile`,
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
      
      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok || !result.success) {
        const errorMessage = result.errors?.join(', ') || result.error || 'Failed to save profile';
        console.error('❌ Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Profile saved successfully:', result.data.user);
      console.log('🚀 Calling onComplete callback with data:', data);
      
      // Call the parent's onComplete callback
      onComplete(data);
      
      console.log('🎯 onComplete callback was called successfully');
    } catch (error: any) {
      console.error('❌ Failed to save profile:', error);
      setSaveError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Test with hardcoded data
  const testWithHardcodedData = () => {
    console.log('🧪 Testing with hardcoded data');
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      phone: '27814296653',
      email: 'test@example.com'
    };
    console.log('Test data:', testData);
    handleSave(testData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Setup Your Profile</h3>
      
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
        </div>
        
        {/* Test buttons */}
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
            onClick={() => console.log('Current form state:', {
              values: getValues(),
              errors,
              isValid
            })}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input 
              {...register('first_name', {
                onChange: (e) => console.log('first_name changed to:', e.target.value)
              })} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border" 
              placeholder="Enter your first name"
              disabled={isSaving}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input 
              {...register('last_name', {
                onChange: (e) => console.log('last_name changed to:', e.target.value)
              })} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border" 
              placeholder="Enter your last name"
              disabled={isSaving}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
              {isLocked && <span className="ml-2 text-xs text-blue-600">(Pre-filled from invitation)</span>}
            </label>
            <input
              {...register('phone', {
                onChange: (e) => console.log('phone changed to:', e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border disabled:bg-gray-100"
              disabled={isLocked || isSaving}
              placeholder="27814296653"
              type="tel"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input 
              {...register('email', {
                onChange: (e) => console.log('email changed to:', e.target.value)
              })} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border" 
              placeholder="your.email@example.com"
              type="email"
              disabled={isSaving}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save & Continue'}
          </button>
        </div>
      </form>
      
      {/* Instructions for debugging */}
      <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        <p className="font-semibold">Debugging Instructions:</p>
        <ol className="list-decimal ml-4 mt-1 space-y-1">
          <li>Open Browser DevTools (F12)</li>
          <li>Go to Console tab to see logs</li>
          <li>Go to Network tab to see API request</li>
          <li>Click "Test with Hardcoded Data" to bypass form validation</li>
          <li>Check if payload contains first_name and last_name</li>
        </ol>
      </div>
    </div>
  );
}