
export type OnboardingRole = 'admin' | 'teacher' | 'student';
export interface Grade {
  id: string;
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  learnerCount?: number;
}

export interface CreateLearnerData {
  school_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  grade_id?: string;
  student_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  parent_emails?: string[];
  parent_phones?: string[];
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{
    row: number;
    errors: Record<string, string[]>;
    data: CreateLearnerData;
  }>;
  duplicates: number;
}

export interface LearnerStats {
  total: number;
  byGrade: { gradeId: string; gradeName: string; count: number }[];
  byStatus: { status: string; count: number }[];
  recentAdditions: number;
}
export interface CreateInviteData {
  school_id: string;
  learner_id?: string;
  parent_id?: string;
  channels: string[];
  role: 'admin' | 'teacher' | 'student';
}

// Invitations
export interface Invite {
  id: string;
  school_id: string;
  learner_id?: string;
  parent_id?: string;
  pr_code: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  channels?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateGradeData {
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface UpdateGradeData {
  name?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface OnboardingStep {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  roles: OnboardingRole[];
  validationSchema?: any; // Using 'any' for simplicity, can be replaced with a more specific validation schema type (e.g., Yup.Schema)
}

export interface OnboardingStatus {
  currentStepId: string;
  completedSteps: string[];
  isComplete: boolean;
  role: OnboardingRole;
}

export interface StepValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export interface OnboardingFlowContextType {
  currentStep: OnboardingStep | null;
  onboardingStatus: OnboardingStatus;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStepCompleted: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  isLoading: boolean;
  error: string | null;
}


