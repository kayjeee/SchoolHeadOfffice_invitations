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
  console.log("🏫 [useBulkUpload] Hook initialized");
  console.log("📦 [useBulkUpload] Parameters received:", {
    schools: schools,
    schoolsCount: schools?.length || 0,
    user: user ? { id: user._id || user.id, auth0_id: user.auth0_id, sub: user.sub } : 'No user',
    selectedGrade: selectedGrade,
    hasRefetchOnboardingStatus: typeof refetchOnboardingStatus === 'function',
    hasOnUploadSuccess: typeof onUploadSuccess === 'function'
  });

  // Heavy schools prop logging
  console.log("🔍 [useBulkUpload] SCHOOLS PROP DEEP ANALYSIS:");
  console.log("🏫 [useBulkUpload] schools value:", schools);
  console.log("🏫 [useBulkUpload] schools type:", typeof schools);
  console.log("🏫 [useBulkUpload] Array.isArray(schools):", Array.isArray(schools));
  console.log("🏫 [useBulkUpload] schools === null:", schools === null);
  console.log("🏫 [useBulkUpload] schools === undefined:", schools === undefined);
  
  if (schools && Array.isArray(schools)) {
    console.log("📊 [useBulkUpload] SCHOOLS ARRAY DETAILS:");
    schools.forEach((schoolItem, index) => {
      console.log(`🏫 School [${index}]:`, {
        id: schoolItem?.id || schoolItem?._id || 'No ID',
        _id: schoolItem?._id,
        name: schoolItem?.schoolName || schoolItem?.name || 'No name',
        email: schoolItem?.schoolEmail || schoolItem?.email,
        userAuth0Id: schoolItem?.userAuth0Id,
        userEmail: schoolItem?.userEmail,
        province: schoolItem?.province,
        type: typeof schoolItem,
        keys: schoolItem ? Object.keys(schoolItem) : 'No school object',
        fullObject: schoolItem
      });
    });
    
    if (schools.length > 0) {
      const primarySchool = schools[0];
      console.log("🎯 [useBulkUpload] PRIMARY SCHOOL (schools[0]):", {
        id: primarySchool?.id || primarySchool?._id,
        name: primarySchool?.schoolName || primarySchool?.name,
        fullObject: primarySchool
      });
    }
  } else {
    console.warn("⚠️ [useBulkUpload] NO SCHOOLS ARRAY or invalid schools prop");
  }

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dataToUpload, setDataToUpload] = useState<any[]>([]); // store processed learners

  // ----------------------
  // Helpers
  // ----------------------
  const getAuth0Id = (): string => {
    const auth0Id = user?.auth0_id || user?.sub || schools?.[0]?.userAuth0Id || '';
    console.log("👤 [useBulkUpload] getAuth0Id resolved:", {
      auth0Id: auth0Id,
      sources: {
        userAuth0Id: user?.auth0_id,
        userSub: user?.sub,
        schoolUserAuth0Id: schools?.[0]?.userAuth0Id
      }
    });
    return auth0Id;
  };

  const getSchoolAndUserInfo = () => {
    console.log("🏫 [useBulkUpload] getSchoolAndUserInfo called");
    
    const auth0Id = getAuth0Id();

    if (!Array.isArray(schools) || schools.length === 0) {
      console.error("❌ [useBulkUpload] No schools array or empty array");
      return {
        schoolName: '',
        schoolEmail: '',
        userEmail: user?.email || '',
        province: '',
        auth0Id,
      };
    }

    const firstSchool = schools[0];
    const schoolInfo = {
      schoolName: firstSchool.schoolName || firstSchool.name || '',
      schoolEmail: firstSchool.schoolEmail || firstSchool.email || '',
      userEmail: user?.email || firstSchool.userEmail || '',
      province: firstSchool.province || '',
      auth0Id,
    };

    console.log("✅ [useBulkUpload] getSchoolAndUserInfo resolved:", schoolInfo);
    return schoolInfo;
  };

  // ----------------------
  // File Handling
  // ----------------------
  const processFile = async (file: File) => {
    console.log("📁 [useBulkUpload] processFile called with file:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setUploadedFile(file);
    try {
      const schoolInfo = getSchoolAndUserInfo();
      console.log("🔧 [useBulkUpload] Processing file with school info:", schoolInfo);
      
      const results = await processExcelFile(file, schoolInfo, selectedGrade);
      console.log("✅ [useBulkUpload] File processing completed:", {
        validRows: results.validRows,
        totalRows: results.totalRows,
        errors: results.errors?.length || 0,
        dataToUploadCount: results.dataToUpload?.length || 0
      });

      setValidationResults(results);
      setDataToUpload(results.dataToUpload || []);

      return results;
    } catch (error: any) {
      console.error("❌ [useBulkUpload] File processing failed:", error);
      console.error("🔍 [useBulkUpload] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(error.message || 'Failed to process file.');
      return null;
    }
  };

  // ----------------------
  // Upload Handling
  // ----------------------
  // In useBulkUpload hook, update handleConfirmUpload function:

const handleConfirmUpload = async () => {
  console.log("🚀 [useBulkUpload] handleConfirmUpload called");
  console.log("📊 [useBulkUpload] Current state:", {
    validationResults: validationResults,
    dataToUploadCount: dataToUpload.length,
    schoolsCount: schools?.length || 0
  });

  if (!validationResults || validationResults.validRows === 0) {
    throw new Error('No valid learners to upload.');
  }

  if (!dataToUpload || dataToUpload.length === 0) {
    throw new Error('No learners available for upload. Please reprocess the file.');
  }

  const auth0Id = getAuth0Id();
  if (!auth0Id) {
    throw new Error('User authentication ID not found. Please try logging in again.');
  }

  // ENHANCED: Multiple fallback options for school ID
  let schoolId = '';
  
  // 1. Try from schools array first
  if (schools && schools.length > 0) {
    schoolId = schools[0]?.id || schools[0]?._id || '';
  }
  
  // 2. Try from selected grade
  if (!schoolId && selectedGrade) {
    schoolId = selectedGrade.school_id || selectedGrade.schoolId || '';
    console.log("🔄 [useBulkUpload] Using school ID from selected grade:", schoolId);
  }
  
  // 3. Try from user context or localStorage
  if (!schoolId) {
    const storedSchoolId = localStorage.getItem('currentSchoolId');
    if (storedSchoolId) {
      schoolId = storedSchoolId;
      console.log("🔄 [useBulkUpload] Using school ID from localStorage:", schoolId);
    }
  }

  console.log("🔍 [useBulkUpload] Final school ID resolution:", {
    fromSchoolsArray: schools?.[0]?.id || schools?.[0]?._id,
    fromSelectedGrade: selectedGrade?.school_id || selectedGrade?.schoolId,
    fromLocalStorage: localStorage.getItem('currentSchoolId'),
    finalSchoolId: schoolId
  });

  if (!schoolId) {
    console.error("❌ [useBulkUpload] No school ID found from any source");
    throw new Error('School ID not found. Please ensure you have selected a school and try again.');
  }

  console.log("✅ [useBulkUpload] Proceeding with upload:", {
    auth0Id: auth0Id,
    schoolId: schoolId,
    learnersCount: dataToUpload.length
  });

  try {
    const result = await uploadLearners(auth0Id, schoolId, dataToUpload);
    console.log("🎉 [useBulkUpload] Upload completed successfully:", result);

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
    console.error("❌ [useBulkUpload] Upload failed:", error);
    throw error;
  }
};
  // ----------------------
  // Reset
  // ----------------------
  const resetUpload = () => {
    console.log("🔄 [useBulkUpload] resetUpload called");
    setUploadedFile(null);
    setValidationResults(null);
    setDataToUpload([]);
    setDragActive(false);
    console.log("✅ [useBulkUpload] Upload state reset");
  };

  const returnValue = {
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

  console.log("🔄 [useBulkUpload] Hook return value:", {
    uploadedFile: returnValue.uploadedFile?.name,
    validationResults: returnValue.validationResults ? {
      validRows: returnValue.validationResults.validRows,
      totalRows: returnValue.validationResults.totalRows
    } : 'No validation results',
    dragActive: returnValue.dragActive,
    dataToUploadCount: returnValue.dataToUpload.length
  });

  return returnValue;
};