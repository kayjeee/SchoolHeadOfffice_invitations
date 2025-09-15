import { useState } from 'react';
import { processExcelFile } from '../services/fileProcessingService';
import { uploadLearners } from '../services/uploadService';
import { School, User, Grade, ValidationResults } from '../types';
import toast from 'react-hot-toast';

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
  const [dataToUpload, setDataToUpload] = useState<any[]>([]); // store processed learners

  // ----------------------
  // Helpers
  // ----------------------
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
        auth0Id,
      };
    }

    const firstSchool = schools[0];
    return {
      schoolName: firstSchool.schoolName || firstSchool.name || '',
      schoolEmail: firstSchool.schoolEmail || firstSchool.email || '',
      userEmail: user?.email || firstSchool.userEmail || '',
      province: firstSchool.province || '',
      auth0Id,
    };
  };

  // ----------------------
  // File Handling
  // ----------------------
  const processFile = async (file: File) => {
    setUploadedFile(file);
    try {
      const schoolInfo = getSchoolAndUserInfo();
      const results = await processExcelFile(file, schoolInfo, selectedGrade);

      setValidationResults(results);
      setDataToUpload(results.dataToUpload || []); // keep learners in state

      return results;
    } catch (error: any) {
      toast.error(error.message || 'Failed to process file.');
      return null;
    }
  };

  // ----------------------
  // Upload Handling
  // ----------------------
  const handleConfirmUpload = async () => {
    if (!validationResults || validationResults.validRows === 0) {
      toast.error('No valid learners to upload.');
      return null;
    }

    if (!dataToUpload || dataToUpload.length === 0) {
      toast.error('No learners available for upload. Please reprocess the file.');
      return null;
    }

    const auth0Id = getAuth0Id();
    if (!auth0Id) {
      toast.error('User authentication ID not found. Please try logging in again.');
      return null;
    }

    try {
      const schoolId = schools?.[0]?.id || schools?.[0]?._id || ''; // pick school id if available
      const result = await uploadLearners(auth0Id, schoolId, dataToUpload);

      // ✅ Guard: if upload failed (toast already shown in service), stop here
      if (!result) return null;

      setValidationResults((prev) => ({
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
    } catch (error: any) {
      toast.error(error.message || 'Upload failed.');
      return null;
    }
  };

  // ----------------------
  // Reset
  // ----------------------
  const resetUpload = () => {
    setUploadedFile(null);
    setValidationResults(null);
    setDataToUpload([]);
    setDragActive(false);
  };

  return {
    uploadedFile,
    validationResults,
    dragActive,
    dataToUpload,
    setDragActive,
    processFile,
    handleConfirmUpload,
    resetUpload,
    getSchoolAndUserInfo,
  };
};
