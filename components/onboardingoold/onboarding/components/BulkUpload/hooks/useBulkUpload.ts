import { useState } from 'react';
import { processExcelFile } from '../services/fileProcessingService';
import { uploadLearners } from '../services/uploadService';
import { School, User, Grade, ValidationResults, ValidationError } from '../types';
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
  const [dataToUpload, setDataToUpload] = useState<any[]>([]);

  // ----------------------
  // Helpers
  // ----------------------
  const getAuth0Id = (): string => {
    return user?.auth0_id || user?.sub || schools?.[0]?.userAuth0Id || '';
  };

  const getSchoolAndUserInfo = () => {
    const auth0Id = getAuth0Id();

    if (!schools || schools.length === 0) {
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

      // Map errors to match ValidationError interface
      const mappedResults: ValidationResults = {
        ...results,
        errors: results.errors.map((e: any): ValidationError => ({
          row: e.row,
          field: e.field,
          message: e.messages || e.message || 'Unknown error',
        })),
        warnings: results.warnings.map((w: any) => ({
          row: w.row,
          field: w.field,
          message: w.message,
        })),
      };

      setValidationResults(mappedResults);
      setDataToUpload(results.dataToUpload || []);

      return mappedResults;
    } catch (error: any) {
      console.error('[useBulkUpload] processFile error:', error);
      toast.error(error.message || 'Failed to process file.');
      return null;
    }
  };

  // ----------------------
  // Upload Handling
  // ----------------------
  const handleConfirmUpload = async () => {
    if (!validationResults || validationResults.validRows === 0) {
      throw new Error('No valid learners to upload.');
    }

    if (!dataToUpload || dataToUpload.length === 0) {
      throw new Error('No learners available for upload. Please reprocess the file.');
    }

    const auth0Id = getAuth0Id();
    if (!auth0Id) throw new Error('User authentication ID not found.');

    // Resolve school ID
    let schoolId = schools?.[0]?.id || '';
    if (!schoolId && selectedGrade) schoolId = selectedGrade.school_id || selectedGrade.schoolId || '';
    if (!schoolId) schoolId = localStorage.getItem('currentSchoolId') || '';
    if (!schoolId) throw new Error('School ID not found. Please ensure you have selected a school.');

    try {
      const result = await uploadLearners(auth0Id, schoolId, dataToUpload);

      setValidationResults((prev) => ({
        ...prev!,
        inserted: result.inserted || prev!.validRows,
        duplicates: result.duplicatesSkipped || 0,
        errors: (prev!.errors || []).concat(result.errors || []),
      }));

      if (onUploadSuccess) onUploadSuccess(result);
      if (refetchOnboardingStatus) await refetchOnboardingStatus();

      return result;
    } catch (error: any) {
      console.error('[useBulkUpload] handleConfirmUpload error:', error);
      throw error;
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
