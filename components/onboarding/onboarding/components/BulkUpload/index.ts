// Main exports
export { default as BulkUploadModal } from './components/BulkUploadModal';

// Component exports
export { FileUploader } from './components/FileUploader';
export { ValidationResults } from './components/ValidationResults';
export { ProgressSteps } from './components/ProgressSteps';
export { DataPreview } from './components/DataPreview';
export { ErrorDisplay } from './components/ErrorDisplay';
export { SuccessScreen } from './components/SuccessScreen';

// Hook exports
export { useBulkUpload } from './hooks/useBulkUpload';
export { useFileValidation } from './hooks/useFileValidation';
export { useUploadProgress } from './hooks/useUploadProgress';

// Service exports
export { processExcelFile } from './services/fileProcessingService';
export { uploadLearners } from './services/uploadService';
export { 
  validatePhoneNumber, 
  validateRequiredFields, 
  validateLearnerData 
} from './services/validationService';

// Type exports
export type { 
  School, 
  User, 
  Grade, 
  ValidationError, 
  ValidationWarning, 
  ValidationResults as ValidationResultsType,
  BulkUploadProps,
  UploadStepProps,
  FileUploaderProps 
} from './types';

// Utility exports
export { 
  FIRST_NAME_HEADERS,
  LAST_NAME_HEADERS,
  GENDER_HEADERS,
  CELL_PHONE_HEADERS,
  TEL_HOME_HEADERS,
  TEL_EMERGENCY_HEADERS,
  WHATSAPP_HEADERS,
  TELEGRAM_HEADERS,
  ACCESSION_NUMBER_HEADERS,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE 
} from './utils/constants';

export { 
  normalizeHeader,
  findHeaderIndex,
  headerExists 
} from './utils/helpers';

// Default export for convenience
import BulkUploadModal from './components/BulkUploadModal';
export default BulkUploadModal;