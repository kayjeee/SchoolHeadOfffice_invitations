import React from 'react';
import { BulkUploadProps } from '../types';
import { useBulkUpload } from '../hooks/useBulkUpload';
import { useFileValidation } from '../hooks/useFileValidation';
import { useUploadProgress } from '../hooks/useUploadProgress';
import { ProgressSteps } from './ProgressSteps';
import { FileUploader } from './FileUploader';
import { ValidationResults } from './ValidationResults';
import { DataPreview } from './DataPreview';
import { SuccessScreen } from './SuccessScreen';

export const BulkUploadModal: React.FC<BulkUploadProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  onUploadSuccess,
  schools,
  refetchOnboardingStatus,
  user
}) => {
  console.log("🏫 [BulkUploadModal] Component mounted");
  console.log("📦 [BulkUploadModal] Props received:", {
    isOpen,
    selectedGrade,
    schools,
    schoolsCount: schools?.length || 0,
    user
  });

  let safeSchools = schools || [];

  if (safeSchools.length === 0 && selectedGrade?.school) {
    safeSchools = [selectedGrade.school];
    console.log("🔄 [BulkUploadModal] Using school from selectedGrade:", selectedGrade.school);
  }

  if (safeSchools.length === 0 && (selectedGrade?.school_id || selectedGrade?.schoolId)) {
    safeSchools = [{
      id: selectedGrade.school_id || selectedGrade.schoolId,
      name: selectedGrade.school_name || selectedGrade.schoolName || 'School'
    }];
    console.log("🔄 [BulkUploadModal] Created school from grade ID:", safeSchools[0]);
  }

  console.log("✅ [BulkUploadModal] School resolution complete:", {
    original: schools,
    safe: safeSchools,
    count: safeSchools.length
  });

  const { errorStatus, validateFile } = useFileValidation();
  const { uploadStep, setUploadStep, isProcessing, startProcessing, stopProcessing } = useUploadProgress();

  const {
    uploadedFile,
    validationResults,
    dragActive,
    setDragActive,
    processFile,
    handleConfirmUpload,
    resetUpload,
    getSchoolAndUserInfo
  } = useBulkUpload(safeSchools, user, selectedGrade, refetchOnboardingStatus, onUploadSuccess);

  const { schoolName, schoolEmail, auth0Id } = getSchoolAndUserInfo();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcessed(e.dataTransfer.files[0]);
    }
  };

  const handleFileProcessed = async (file: File) => {
    if (!validateFile(file)) return;

    setUploadStep('validate');
    startProcessing();

    try {
      await processFile(file);
      setUploadStep('confirm');
    } catch (error: any) {
      console.error('❌ File processing error:', error);
    } finally {
      stopProcessing();
    }
  };

  const handleConfirm = async () => {
    console.log('🔄 handleConfirm triggered');
    console.log('📊 Validation Results:', validationResults);
    console.log('🏫 School Info:', { schoolName, schoolEmail, auth0Id });
    console.log('📚 Selected Grade:', selectedGrade);

    startProcessing();
    try {
      console.log('🚀 Calling handleConfirmUpload...');
      await handleConfirmUpload();
      console.log('✅ handleConfirmUpload completed successfully');
      setUploadStep('complete');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('🔍 Error details:', error.response?.data || error.message);
    } finally {
      stopProcessing();
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      'First Name,Last Name,Gender,Phone Number,Tel Number (H)ome,Tel Number (E)mergency,WhatsApp,Telegram,Student ID\n' +
      'John,Smith,Male,+27123456789,+27112223333,+27114445555,+27123456789,@johnsmith,12345\n' +
      'Sarah,Johnson,Female,+27129876543,+27113334444,+27117778888,+27129876543,@sarahjohnson,67890';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learners_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bulk Upload Learners {selectedGrade && `to ${selectedGrade.name}`}
                </h3>
                <div className="text-sm text-gray-500 mt-1 space-y-1">
                  {schoolName && <p>School: {schoolName} ({schoolEmail})</p>}
                  {user?.name && <p>User: {user.name} ({user.email})</p>}
                  {auth0Id && <p className="font-mono text-xs">Auth ID: {auth0Id}</p>}
                  <p className="font-mono text-xs text-gray-500">
                    Grade: <span className="font-bold text-gray-800">{selectedGrade?.name || 'None'}</span> {selectedGrade?.id && `(ID: ${selectedGrade.id})`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>

            <ProgressSteps step={uploadStep} onStepChange={setUploadStep} />

            {uploadStep === 'upload' && (
              <FileUploader
                onFileProcessed={handleFileProcessed}
                onDownloadTemplate={downloadTemplate}
                dragActive={dragActive}
                onDrag={handleDrag}
                onDrop={handleDrop}
                errorStatus={errorStatus}
              />
            )}

            {uploadStep === 'validate' && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700">Validating File...</p>
                <p className="text-sm text-gray-500">This may take a few moments as we process your data.</p>
              </div>
            )}

            {uploadStep === 'confirm' && validationResults && (
              <>
                <ValidationResults
                  results={validationResults}
                  uploadedFile={uploadedFile}
                  onReset={resetUpload}
                  onConfirm={handleConfirm}
                  isProcessing={isProcessing}
                  errorStatus={errorStatus}
                />
                <DataPreview preview={validationResults.preview} />
              </>
            )}

            {uploadStep === 'complete' && validationResults && (
              <SuccessScreen results={validationResults} onClose={onClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;