import { useState } from 'react';
import { processExcelFile } from '../services/fileProcessingService';
import { uploadLearners } from '../services/uploadService';
import { School, User, Grade, ValidationResults } from '../types';

export const useBulkUpload = (
  schools: School[],
  user: User | null,
  selectedGrade: Grade | null,
  refetchOnboardingStatus?: () => Promise<void>,
  onUploadSuccess?: (result: any) => void
) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const getAuth0Id = (): string => {
    return user?.auth0_id || user?.sub || schools?.[0]?.userAuth0Id || '';
  };

  const getSchoolAndUserInfo = () => {
    const auth0Id = getAuth0Id();
    
    if (!Array.isArray(schools) || schools.length === 0) {
      return { 
        schoolName: '', 
        schoolEmail: '', 
        userEmail: user?.email || '', 
        province: '',
        auth0Id
      };
    }
    
    const firstSchool = schools[0];
    return {
      schoolName: firstSchool.schoolName || firstSchool.name || '',
      schoolEmail: firstSchool.schoolEmail || firstSchool.email || '',
      userEmail: user?.email || firstSchool.userEmail || '',
      province: firstSchool.province || '',
      auth0Id
    };
  };

  const processFile = async (file: File) => {
    setUploadedFile(file);
    try {
      const schoolInfo = getSchoolAndUserInfo();
      const results = await processExcelFile(file, schoolInfo, selectedGrade);
      setValidationResults(results);
      return results;
    } catch (error) {
      throw error;
    }
  };

  const handleConfirmUpload = async () => {
    if (!validationResults || validationResults.validRows === 0) {
      throw new Error('No valid learners to upload.');
    }

    const auth0Id = getAuth0Id();
    if (!auth0Id) {
      throw new Error('User authentication ID not found. Please try logging in again.');
    }

    try {
      const result = await uploadLearners(auth0Id, validationResults.dataToUpload);
      
      setValidationResults(prev => ({
        ...prev!,
        inserted: result.inserted || prev!.validRows,
        duplicates: result.duplicatesSkipped || 0,
        errors: (prev!.errors || []).concat(result.errors || []),
      }));

      if (onUploadSuccess) onUploadSuccess(result);

      if (refetchOnboardingStatus) {
        try {
          await refetchOnboardingStatus();
        } catch (err) {
          console.error('Failed to refetch onboarding status:', err);
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setValidationResults(null);
    setDragActive(false);
  };

  return {
    uploadedFile,
    validationResults,
    dragActive,
    setDragActive,
    processFile,
    handleConfirmUpload,
    resetUpload,
    getSchoolAndUserInfo
  };
};