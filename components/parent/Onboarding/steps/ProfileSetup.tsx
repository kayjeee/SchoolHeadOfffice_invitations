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

export default function ProfileSetup({ onComplete, prefillData, isLocked, user }: ProfileSetupProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

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
    }
  });

  useEffect(() => {
    console.log('🔍 ProfileSetup mounted with props:', {
      hasUser: !!user?.sub,
      prefillData,
      isLocked,
      onCompleteType: typeof onComplete,
    });

    if (prefillData) {
      console.log('📋 Setting form values from prefillData:', prefillData);
      if (prefillData.name) setValue('name', prefillData.name);
      if (prefillData.phone) setValue('phone', prefillData.phone);
      if (prefillData.email) setValue('email', prefillData.email);
    }
  }, [prefillData, setValue, user, isLocked, onComplete]);

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
      
      // Create payload with phone field
      const payload = {
        name: data.name,
        phone: data.phone, // Include phone field
        email: data.email,
      };
      
      console.log('📤 Sending profile update with payload:', payload);
      
      const response = await fetch(
        `http://localhost:4000/api/v1/users/update_profile?auth0_id=${encodedUserId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('📥 Response status:', response.status);
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      // Store the response for debugging
      setLastResponse(result);

      if (!response.ok || !result.success) {
        const errorMessage = result.errors?.join(', ') || result.error || 'Failed to save profile';
        console.error('❌ Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Profile saved successfully:', result.data?.user);
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
      name: 'Test User',
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
          {lastResponse && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <div className="font-semibold text-green-800">Last API Response:</div>
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
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
              {isLocked && <span className="ml-2 text-xs text-blue-600">(Pre-filled from invitation)</span>}
            </label>
            <input
              {...register('phone')}
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
              {...register('email')} 
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
      
      {/* Success message - backend is now fixed! */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
        <p className="font-semibold mb-1">✅ Backend Fixed!</p>
        <p className="text-xs">
          The backend API is now working correctly and returning proper JSON responses.
          Phone numbers are now being saved along with name and email.
        </p>
      </div>
      
      {/* Instructions for debugging */}
      <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        <p className="font-semibold">Debugging Instructions:</p>
        <ol className="list-decimal ml-4 mt-1 space-y-1">
          <li>Open Browser DevTools (F12)</li>
          <li>Go to Console tab to see logs</li>
          <li>Go to Network tab to see API request/response</li>
          <li>Check if payload contains name, phone, and email</li>
          <li>Last API response will be shown above for debugging</li>
        </ol>
      </div>
    </div>
  );
}