'use client';

import React from 'react';
import { BulkUploadModal as OnboardingBulkUploadModal } from '@/components/onboarding/onboarding/components/BulkUpload';
import { useSchoolContext } from '@/components/context/SchoolContext';
import { useUser } from '@auth0/nextjs-auth0/client';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  selectedGrade?: any;
}

/**
 * Administrative wrapper for the Bulk Upload functionality.
 * Adapts the CSV drag-and-drop interface for use within the Grades Management screen.
 */
export function BulkUploadModal({ isOpen, onClose, onSuccess, selectedGrade = null }: BulkUploadModalProps) {
  const { currentSchool } = useSchoolContext();
  const { user } = useUser();

  // Adapt currentSchool to match the expected format
  const schools = currentSchool ? [{
    id: currentSchool.id || currentSchool._id,
    name: currentSchool.schoolName || currentSchool.name,
    email: (currentSchool as any).schoolEmail || (currentSchool as any).email,
    schoolName: currentSchool.schoolName || currentSchool.name,
    schoolEmail: (currentSchool as any).schoolEmail || (currentSchool as any).email,
  }] : [];

  // Adapt user to match the expected format
  const adaptedUser = user ? {
    auth0_id: user.sub,
    sub: user.sub,
    email: user.email || '',
    name: user.name || '',
  } : null;

  return (
    <OnboardingBulkUploadModal
      isOpen={isOpen}
      onClose={onClose}
      selectedGrade={selectedGrade}
      onUploadSuccess={onSuccess}
      schools={schools}
      user={adaptedUser}
      refetchOnboardingStatus={async () => {}}
    />
  );
}
