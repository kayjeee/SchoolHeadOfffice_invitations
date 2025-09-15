export interface School {
  schoolName?: string;
  schoolEmail?: string;
  userEmail?: string;
  province?: string;
  userAuth0Id?: string;
  name?: string;
  email?: string;
}

export interface User {
  auth0_id?: string;
  sub?: string;
  email?: string;
  name?: string;
}

export interface Grade {
  id: string | null;
  name: string;
}

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface ValidationWarning {
  row: number;
  field: string;
  message: string;
}

export interface ValidationResults {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  inserted?: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  preview: any[];
  dataToUpload: any[];
}

export interface BulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: Grade | null;
  onUploadSuccess?: (result: any) => void;
  schools: School[];
  refetchOnboardingStatus?: () => Promise<void>;
  user: User | null;
}

export interface UploadStepProps {
  step: string;
  onStepChange: (step: string) => void;
}

export interface FileUploaderProps {
  onFileProcessed: (file: File) => void;
  onDownloadTemplate: () => void;
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  errorStatus: string;
}