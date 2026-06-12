'use client';

import React from 'react';
import { BulkUploadModal } from '@/components/onboarding/onboarding/components/BulkUpload';
import { useSchoolContext } from '@/components/context/SchoolContext';
import { useUser } from '@auth0/nextjs-auth0/client';

interface BulkLearnerUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  selectedGrade?: any; // Optional grade context
}

/**
 * Administrative wrapper for the Bulk Upload functionality.
 * Bridges the onboarding-specific component to the general admin management context.
 */
export function BulkLearnerUpload({ isOpen, onClose, onSuccess, selectedGrade = null }: BulkLearnerUploadProps) {
  const { currentSchool } = useSchoolContext();
  const { user } = useUser();

  // Adapt currentSchool to match the School interface expected by BulkUploadModal
  const schools = currentSchool ? [{
    id: currentSchool.id || currentSchool._id,
    name: currentSchool.schoolName || currentSchool.name,
    email: (currentSchool as any).schoolEmail || (currentSchool as any).email,
    schoolName: currentSchool.schoolName || currentSchool.name,
    schoolEmail: (currentSchool as any).schoolEmail || (currentSchool as any).email,
  }] : [];

  // Adapt user to match the User interface expected by BulkUploadModal
  const adaptedUser = user ? {
    auth0_id: user.sub,
    sub: user.sub,
    email: user.email || '',
    name: user.name || '',
  } : null;

  return (
    <BulkUploadModal
      isOpen={isOpen}
      onClose={onClose}
      selectedGrade={selectedGrade}
      onUploadSuccess={onSuccess}
      schools={schools}
      user={adaptedUser}
      // Since we are in the admin dashboard, we don't necessarily need to refetch onboarding status,
      // but we can provide a no-op or a refresh function if needed later.
      refetchOnboardingStatus={async () => {}}
    />
  );
}
