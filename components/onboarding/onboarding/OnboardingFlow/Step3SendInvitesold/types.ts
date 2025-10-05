// Core entity types
// types.ts
export interface Grade {
  id: string;
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  learnerCount?: number;
}

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  gender_text: string;
  accession_number: string;
  status: string;
  status_text: string;
  grade_id: string;
  grade_name: string;
  school_id: string;
  school_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  contact?: {
    phone: string;
    whatsapp: string;
    tel_home: string | null;
    tel_emergency: string | null;
    telegram: string;
  };
}

export interface InviteChannel {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface InviteMessage {
  subject?: string;
  title?: string;
  body: string;
}

export interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
  school: any;
  user: any;
}

export interface PrCodeData {
  [gradeId: string]: string;
}

export interface InviteLinkData {
  [gradeId: string]: string;
}

// Constants
export const CHANNELS: InviteChannel[] = [
  { id: "email", name: "Email", icon: "📧", description: "Send via email" },
  { id: "sms", name: "SMS", icon: "💬", description: "Send text messages" },
  { id: "whatsapp", name: "WhatsApp", icon: "💚", description: "Send via WhatsApp" },
  { id: "portal", name: "School Portal", icon: "🏫", description: "Notify in school portal" },
];

export interface Grade {
  id: string;
  name: string;
  description?: string;
  level?: number;
  isActive: boolean;
  learnerCount: number;
  activeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InviteChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  recommended: boolean;
  characterLimit?: number;
  requiresSubject?: boolean;
  requiresTitle?: boolean;
  supportedVariables?: string[];
}

export interface InviteMessage {
  subject?: string;
  title?: string;
  body: string;
}

export interface Invite {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  learnerAvatar?: string;
  gradeId: string;
  gradeName: string;
  channel: string;
  status: InviteStatus;
  message: InviteMessage;
  inviteLink?: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  respondedAt?: string;
  errorMessage?: string;
  batchId?: string;
  metadata?: Record<string, any>;
}

// Enum-like types
export type StepState = 
  | 'learner-selection'
  | 'channel-selection'
  | 'message-composer'
  | 'results';

export type InviteStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'accepted'
  | 'declined'
  | 'failed'
  | 'cancelled';

// Component prop types
export interface Step3SendInvitesProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  initialStep?: StepState;
  preselectedLearners?: Learner[];
  preselectedChannel?: InviteChannel;
  onStepChange?: (step: StepState) => void;
}

export interface LearnerSelectionProps {
  learners: Learner[];
  selectedLearners: Learner[];
  grades: Grade[];
  selectedGrades: Grade[];
  onSelectLearner: (learner: Learner) => void;
  onDeselectLearner: (learnerId: string) => void;
  onSelectGrade: (grade: Grade) => void;
  onDeselectGrade: (gradeId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

export interface ChannelSelectionProps {
  selectedChannel: InviteChannel | null;
  onSelectChannel: (channel: InviteChannel) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  availableChannels?: InviteChannel[];
}

export interface MessageComposerProps {
  message: InviteMessage;
  onMessageChange: (message: InviteMessage) => void;
  selectedLearners: Learner[];
  selectedChannel: InviteChannel;
  onSend: () => void;
  onPrevious: () => void;
  sending: boolean;
  canSend: boolean;
}

export interface InviteResultsProps {
  invites: Invite[];
  onResend: (inviteId: string) => void;
  onCancel: (inviteId: string) => void;
  onDownload: () => void;
  onCopyLinks: () => void;
  onComplete: () => void;
  onPrevious: () => void;
}

// Service types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SendInviteRequest {
  learners: Learner[];
  channel: InviteChannel;
  message: InviteMessage;
  scheduledAt?: string;
  batchId?: string;
}

export interface SendInviteResponse {
  invites: Invite[];
  successCount: number;
  failureCount: number;
  batchId: string;
}

// Filter and search types
export interface LearnerFilters {
  gradeIds?: string[];
  searchTerm?: string;
  status?: 'active' | 'inactive' | 'all';
  lastActiveAfter?: Date;
  lastActiveBefore?: Date;
  hasInvite?: boolean;
  inviteStatus?: InviteStatus;
}

export interface InviteFilters {
  status?: InviteStatus[];
  channel?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  batchId?: string;
  learnerId?: string;
  gradeId?: string;
}

// Hook return types
export interface UseLearnerDataReturn {
  learners: Learner[];
  selectedLearners: Learner[];
  grades: Grade[];
  selectedGrades: Grade[];
  loading: boolean;
  learnersLoading: boolean;
  gradesLoading: boolean;
  error: string | null;
  learnersError: string | null;
  gradesError: string | null;
  selectLearner: (learner: Learner) => void;
  deselectLearner: (learnerId: string) => void;
  selectGrade: (grade: Grade) => void;
  deselectGrade: (gradeId: string) => void;
  selectAllLearners: () => void;
  deselectAllLearners: () => void;
  refreshLearners: () => Promise<void>;
  refreshGrades: () => Promise<void>;
  searchLearners: (searchTerm: string) => Promise<void>;
}

export interface UseInviteManagementReturn {
  invites: Invite[];
  sendingInvites: boolean;
  resendingInvites: Record<string, boolean>;
  cancelingInvites: Record<string, boolean>;
  sendError: string | null;
  resendErrors: Record<string, string>;
  cancelErrors: Record<string, string>;
  sendInvites: (request: SendInviteRequest) => Promise<void>;
  resendInvite: (inviteId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  downloadInviteData: () => Promise<void>;
  copyInviteLinks: () => Promise<void>;
  clearErrors: () => void;
  refreshInvites: (batchId?: string) => Promise<void>;
}

export interface UseFormStateReturn {
  selectedChannel: InviteChannel | null;
  inviteMessage: InviteMessage;
  isDirty: boolean;
  isValid: boolean;
  setSelectedChannel: (channel: InviteChannel | null) => void;
  setInviteMessage: (message: InviteMessage) => void;
  updateMessageField: (field: keyof InviteMessage, value: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export interface UseStepValidationReturn {
  isStepValid: (step: StepState) => boolean;
  canProceedToNext: boolean;
  validationErrors: string[];
  stepErrors: Record<StepState, string[]>;
}

// Utility types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'txt';
  includeHeaders: boolean;
  filename?: string;
}

export interface ClipboardOptions {
  format: 'simple' | 'detailed' | 'csv';
  includeHeaders?: boolean;
}

// Configuration types
export interface ServiceConfig {
  apiBaseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export interface ComponentConfig {
  enableBulkActions?: boolean;
  enablePreview?: boolean;
  enableAutoSave?: boolean;
  maxLearnersPerBatch?: number;
  defaultChannel?: string;
}

// Event types
export interface StepChangeEvent {
  from: StepState;
  to: StepState;
  timestamp: Date;
}

export interface InviteEvent {
  type: 'sent' | 'delivered' | 'opened' | 'accepted' | 'declined' | 'failed';
  inviteId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface ValidationError extends Error {
  field?: string;
  value?: any;
  rule?: string;
}

// Theme and styling types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ComponentTheme {
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  borderRadius: string;
  shadows: Record<string, string>;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface InviteAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  acceptanceRate: number;
  byChannel: Record<string, number>;
  byGrade: Record<string, number>;
  timeline: Array<{ date: string; count: number }>;
}

export default {
  // Re-export all types for convenience
  Learner,
  Grade,
  InviteChannel,
  InviteMessage,
  Invite,
  StepState,
  InviteStatus,
  ValidationResult,
  ApiError,
  ValidationError
};

