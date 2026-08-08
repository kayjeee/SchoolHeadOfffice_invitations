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
  onComplete: (data: ProfileFormData & { school_id?: string; school_name?: string }) => void;
  prefillData?: {
    name?: string;
    phone?: string;
    email?: string;
    school_name?: string;
    grade_name?: string;
    school_id?: string;
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

  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);

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

  const handleSchoolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSchoolSearchQuery(val);
    setShowSchoolSuggestions(true);
    if (selectedSchool && selectedSchool.name !== val) {
      setSelectedSchool(null);
    }
  };

  const handleSelectSchool = (school: { id: string; name: string }) => {
    setSelectedSchool(school);
    setSchoolSearchQuery(school.name);
    setShowSchoolSuggestions(false);
  };

  // Set initial form values from prefill data
  useEffect(() => {
    if (prefillData) {
      if (prefillData.name) setValue('name', prefillData.name);
      if (prefillData.phone) setValue('phone', prefillData.phone);
      if (prefillData.email) setValue('email', prefillData.email);
      if (prefillData.school_id && prefillData.school_name) {
        setSelectedSchool({
          id: prefillData.school_id,
          name: prefillData.school_name,
        });
        setSchoolSearchQuery(prefillData.school_name);
      }
    }
  }, [prefillData, setValue]);

  // Fetch school suggestions debounced
  useEffect(() => {
    if (isLocked) return; // Do not fetch suggestions if school is locked
    if (!schoolSearchQuery.trim()) {
      setSchoolSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingSchools(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const cleanBase = apiBase.endsWith('/api/v1') ? apiBase : `${apiBase}/api/v1`;
        const response = await fetch(`${cleanBase}/schools/search?q=${encodeURIComponent(schoolSearchQuery)}`);
        if (response.ok) {
          const json = await response.json();
          setSchoolSuggestions(json.schools || []);
        }
      } catch (err) {
        console.error('Error searching schools:', err);
      } finally {
        setIsSearchingSchools(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [schoolSearchQuery, isLocked]);

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
      const schoolId = selectedSchool?.id || '';

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

          {isLocked ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <input
                type="text"
                value={selectedSchool?.name || prefillData?.school_name || ''}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-gray-600 p-2 border"
                disabled={true}
              />
            </div>
          ) : (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Child's School *
              </label>
              <input
                type="text"
                value={schoolSearchQuery}
                onChange={handleSchoolInputChange}
                onFocus={() => setShowSchoolSuggestions(true)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500 p-2 border"
                placeholder="Type to search e.g. Kagiso High School"
                disabled={isSaving}
              />

              {/* Autocomplete dropdown suggestions */}
              {showSchoolSuggestions && (schoolSuggestions.length > 0 || isSearchingSchools) && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isSearchingSchools ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Searching schools...</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {schoolSuggestions.map((schoolSuggestion) => (
                        <li key={schoolSuggestion.id || schoolSuggestion._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSchool({
                              id: schoolSuggestion.id || schoolSuggestion._id,
                              name: schoolSuggestion.schoolName || schoolSuggestion.name
                            })}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-black font-semibold"
                          >
                            {schoolSuggestion.schoolName || schoolSuggestion.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {schoolSearchQuery && !selectedSchool && !isSearchingSchools && (
                <p className="text-xs text-amber-600 font-bold mt-1">Please select a school from the list</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-right">
          <button
            type="submit"
            disabled={isSaving || !isValid || !selectedSchool}
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