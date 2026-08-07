// components/parent/Onboarding/steps/ProfileSetup.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { apiClient } from '../../../../lib/api/api-client';

async function matchByPhone(phoneNumber: string, auth0Id: string, schoolId: string): Promise<{ success: boolean, matched_count: number }> {
  console.log(`🤝 [ProfileSetup.matchByPhone] Attempting match for phone: ${phoneNumber}, user: ${auth0Id}, school: ${schoolId}`);

  const schema = z.object({
    success: z.boolean(),
    matched_count: z.number().optional(),
    invitations: z.array(z.any()).optional()
  }).passthrough();

  try {
    const response = await apiClient.post(
      '/invitations/match_by_phone',
      { phone_number: phoneNumber, auth0_id: auth0Id, school_id: schoolId },
      schema
    );
    return {
      success: response.success,
      matched_count: response.matched_count || 0
    };
  } catch (error) {
    console.error(`❌ [ProfileSetup.matchByPhone] Failed:`, error);
    throw error;
  }
}

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
    school_name?: string;
    grade_name?: string;
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
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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

  // Set initial form values from prefill data
  useEffect(() => {
    if (prefillData) {
      if (prefillData.name) setValue('name', prefillData.name);
      if (prefillData.phone) setValue('phone', prefillData.phone);
      if (prefillData.email) setValue('email', prefillData.email);
    }
  }, [prefillData, setValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await handleSave(data);
  });

  const handleSave = async (data: ProfileFormData) => {
    if (!user?.sub) {
      setSaveError('User authentication required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const encodedUserId = encodeURIComponent(user.sub);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const cleanBase = apiBase.endsWith('/api/v1') ? apiBase : `${apiBase}/api/v1`;
      const apiUrl = `${cleanBase}/users/update_profile?auth0_id=${encodedUserId}`;
      
      const payload = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
      };

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Get the raw response text first
      const responseText = await response.text();
      
      // Check if response is empty
      if (!responseText || responseText.trim() === '') {
        throw new Error('Server returned an empty response');
      }
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }

      // Check for HTTP errors
      if (!response.ok) {
        const errorMessage = 
          result?.errors?.join?.() || 
          result?.error || 
          result?.message || 
          `Server error: ${response.status} ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      // Check for API-level errors
      if (result.success === false) {
        const errorMessage = 
          result?.errors?.join?.() || 
          result?.error || 
          result?.message || 
          'Profile update failed';
        
        throw new Error(errorMessage);
      }

      // Success - trigger non-blocking phone match background call immediately after the profile setup completes!
      let schoolId = (router.query?.school as string) ||
                     (router.query?.school_slug as string) ||
                     (router.query?.schoolSlug as string) ||
                     '';

      if (!schoolId && prefillData?.school_name && prefillData.school_name !== 'School') {
        try {
          const lookupUrl = `${cleanBase}/schools/${encodeURIComponent(prefillData.school_name)}`;
          console.log(`📡 [ProfileSetup] Resolving single school ID: ${lookupUrl}`);
          const schoolResponse = await fetch(lookupUrl);

          if (schoolResponse.status === 200) {
            const schoolJson = await schoolResponse.json();
            const resolvedSchool = schoolJson.school || schoolJson.data?.school || schoolJson.data;
            if (resolvedSchool && (resolvedSchool.id || resolvedSchool._id)) {
              schoolId = resolvedSchool.id || resolvedSchool._id || '';
              console.log(`✅ [ProfileSetup] Resolved single school ID: ${schoolId}`);
            }
          } else if (schoolResponse.status === 404) {
            console.log(`ℹ️ [ProfileSetup] School not found (404) for name: ${prefillData.school_name}. skipping phone match.`);
          } else if (schoolResponse.status === 409 || schoolResponse.status === 422) {
            console.warn(`⚠️ [ProfileSetup] School resolution is ambiguous (status: ${schoolResponse.status}) for name: ${prefillData.school_name}. skipping phone match.`);
          } else {
            console.log(`ℹ️ [ProfileSetup] Unexpected status (${schoolResponse.status}) for school lookup. skipping phone match.`);
          }
        } catch (e) {
          console.error('❌ [ProfileSetup] Client-side school resolution failed:', e);
        }
      }

      if (user?.sub && data.phone && schoolId) {
        try {
          console.log(`📡 [ProfileSetup] Silent phone match check: phone=${data.phone}, school=${schoolId}`);
          matchByPhone(data.phone.trim(), user.sub, schoolId)
            .then((matchResult) => {
              console.log(`✅ [ProfileSetup] Silent phone match complete: matched_count=${matchResult.matched_count}`);
            })
            .catch((error) => {
              console.log('⚠️ [ProfileSetup] Silent phone match background call failed:', error);
            });
        } catch (e) {
          console.log('⚠️ [ProfileSetup] Silent phone match error:', e);
        }
      } else {
        console.log('ℹ️ [ProfileSetup] Skipping silent phone match background call:', {
          hasUserId: !!user?.sub,
          hasPhone: !!data?.phone,
          hasSchoolId: !!schoolId,
          userId: user?.sub,
          capturedPhone: data?.phone,
          schoolId
        });
      }

      onComplete(data);

    } catch (error: any) {
      console.error('Failed to save profile:', error);
      setSaveError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <h3 className="text-xl font-bold">Setup Your Profile</h3>
          <p className="text-gray-500 text-sm">Please provide your contact information</p>
        </div>

        {(prefillData?.school_name || prefillData?.grade_name) && (
          <div className="mt-4 md:mt-0 text-left md:text-right">
            {prefillData.school_name && (
              <p className="text-blue-600 font-bold">{prefillData.school_name}</p>
            )}
            {prefillData.grade_name && (
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">{prefillData.grade_name}</p>
            )}
          </div>
        )}
      </div>

      {saveError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
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

        <div className="mt-8 text-right">
          <button
            type="submit"
            disabled={isSaving || !isValid}
            className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
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

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <p className="font-semibold mb-1">Note:</p>
        <p className="text-xs">
          Please ensure all fields are filled correctly. Your name, phone number, and email will be saved to your profile.
        </p>
      </div>
    </div>
  );
}