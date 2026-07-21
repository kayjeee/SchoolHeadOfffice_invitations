// SchoolInfoHeader.tsx
import React from 'react';
import { logger } from './utils/logger';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface SchoolInfoHeaderProps {
  schoolName: string;
  schoolId: string;
  totalSchools: number;
  prCode: string | null;
  isGeneratingPrCode: boolean;
  prCodeError: string | null;
}

export const SchoolInfoHeader: React.FC<SchoolInfoHeaderProps> = ({
  schoolName,
  schoolId,
  totalSchools,
  prCode,
  isGeneratingPrCode,
  prCodeError
}) => {
  logger.debug('SchoolInfoHeader', 'Rendering school info', {
    schoolName,
    schoolId,
    hasPrCode: !!prCode
  });

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2">School Information</h3>
      <div className="text-sm text-blue-700">
        <p><strong>School:</strong> {schoolName}</p>
        <p><strong>ID:</strong> {schoolId}</p>
        <p><strong>Total Schools:</strong> {totalSchools}</p>
        <div className="mt-2 p-2 bg-white rounded border">
          <strong>PR Code Status:</strong>
          {isGeneratingPrCode && (
            <LoadingSpinner size="sm" text="Generating PR Code..." />
          )}
          {prCode && (
            <span className="ml-2 text-green-600">✅ PR Code: {prCode}</span>
          )}
          {prCodeError && (
            <span className="ml-2 text-red-600">❌ Error: {prCodeError}</span>
          )}
          {!isGeneratingPrCode && !prCode && !prCodeError && (
            <span className="ml-2 text-gray-600">⏳ PR Code not generated</span>
          )}
        </div>
      </div>
    </div>
  );
};