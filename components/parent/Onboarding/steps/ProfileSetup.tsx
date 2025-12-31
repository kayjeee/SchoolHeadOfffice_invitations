// components/parent/Onboarding/steps/ProfileSetup.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name is too short'),
  last_name: z.string().min(2, 'Last name is too short'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (prefillData) {
      if (prefillData.first_name) setValue('first_name', prefillData.first_name);
      if (prefillData.last_name) setValue('last_name', prefillData.last_name);
      if (prefillData.phone) setValue('phone', prefillData.phone);
      if (prefillData.email) setValue('email', prefillData.email);
    }
  }, [prefillData, setValue]);

  const handleSave = async (data: ProfileFormData) => {
    if (!user?.sub) {
      setSaveError('User authentication required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Save to backend
      const response = await fetch(
        `http://localhost:4000/api/v1/users/${encodeURIComponent(user.sub)}/update_profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: data }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.errors?.join(', ') || 'Failed to save profile');
      }

      console.log('✅ Profile saved successfully:', result.data.user);
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
      <h3 className="text-xl font-bold mb-4">Setup Your Profile</h3>
      
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input 
              {...register('first_name')} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500" 
              placeholder="Enter your first name"
            />
            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input 
              {...register('last_name')} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500" 
              placeholder="Enter your last name"
            />
            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
              {isLocked && <span className="ml-2 text-xs text-blue-600">(Pre-filled from invitation)</span>}
            </label>
            <input
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100 text-black focus:border-green-500 focus:ring-green-500"
              disabled={isLocked}
              placeholder="27123456789"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              {...register('email')} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black focus:border-green-500 focus:ring-green-500" 
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}