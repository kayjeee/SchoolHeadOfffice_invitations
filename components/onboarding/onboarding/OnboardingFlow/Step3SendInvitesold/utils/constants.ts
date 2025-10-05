import { InviteChannel } from '../types';

// Step states
export const STEP_STATES = {
  LEARNER_SELECTION: 'learner-selection',
  CHANNEL_SELECTION: 'channel-selection',
  MESSAGE_COMPOSER: 'message-composer',
  RESULTS: 'results'
} as const;

// Invite statuses
export const INVITE_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

// Channel configurations
export const CHANNEL_CONFIGS = {
  EMAIL: {
    id: 'email',
    name: 'Email',
    description: 'Send invites via email with customizable message',
    icon: 'mail',
    features: ['Customizable message', 'Automatic reminders', 'Delivery tracking'],
    recommended: true,
    characterLimit: null,
    requiresSubject: true,
    requiresTitle: false,
    supportedVariables: ['learnerName', 'inviteLink', 'gradeName', 'platformName']
  },
  SMS: {
    id: 'sms',
    name: 'SMS',
    description: 'Send invites via text message',
    icon: 'message-square',
    features: ['Instant delivery', 'High open rates', 'Character limit applies'],
    recommended: false,
    characterLimit: 160,
    requiresSubject: false,
    requiresTitle: false,
    supportedVariables: ['learnerName', 'inviteLink']
  },
  APP_NOTIFICATION: {
    id: 'app-notification',
    name: 'App Notification',
    description: 'Send push notifications through the mobile app',
    icon: 'smartphone',
    features: ['Real-time delivery', 'Rich media support', 'Requires app installation'],
    recommended: false,
    characterLimit: 200,
    requiresSubject: false,
    requiresTitle: true,
    supportedVariables: ['learnerName', 'inviteLink', 'gradeName']
  },
  PORTAL_MESSAGE: {
    id: 'portal-message',
    name: 'Portal Message',
    description: 'Send message through the learning portal',
    icon: 'monitor',
    features: ['Rich formatting', 'File attachments', 'Read receipts'],
    recommended: false,
    characterLimit: null,
    requiresSubject: true,
    requiresTitle: false,
    supportedVariables: ['learnerName', 'inviteLink', 'gradeName', 'platformName']
  }
} as const;

// Available channels array
export const AVAILABLE_CHANNELS: InviteChannel[] = [
  CHANNEL_CONFIGS.EMAIL,
  CHANNEL_CONFIGS.SMS,
  CHANNEL_CONFIGS.APP_NOTIFICATION,
  CHANNEL_CONFIGS.PORTAL_MESSAGE
];

// Message templates
export const MESSAGE_TEMPLATES = {
  [CHANNEL_CONFIGS.EMAIL.id]: {
    subject: 'You\'re invited to join our learning platform!',
    body: `Hi {{learnerName}},

You've been invited to join our learning platform. We're excited to have you as part of our learning community!

Click the link below to get started:
{{inviteLink}}

If you have any questions, feel free to reach out to us.

Best regards,
The Learning Team`
  },
  [CHANNEL_CONFIGS.SMS.id]: {
    body: 'Hi {{learnerName}}! You\'re invited to join our learning platform. Get started: {{inviteLink}}'
  },
  [CHANNEL_CONFIGS.APP_NOTIFICATION.id]: {
    title: 'Learning Platform Invitation',
    body: 'Hi {{learnerName}}! You\'ve been invited to join our learning platform. Tap to get started.'
  },
  [CHANNEL_CONFIGS.PORTAL_MESSAGE.id]: {
    subject: 'Welcome to the Learning Platform',
    body: `Dear {{learnerName}},

Welcome to our learning platform! We're thrilled to have you join our community of learners.

Your personalized learning journey awaits. Click here to get started:
{{inviteLink}}

Explore courses, connect with peers, and track your progress all in one place.

Happy learning!`
  }
} as const;

// Validation rules
export const VALIDATION_RULES = {
  MAX_LEARNERS_PER_BATCH: 100,
  MIN_LEARNERS_PER_BATCH: 1,
  MAX_SUBJECT_LENGTH: 200,
  MAX_TITLE_LENGTH: 100,
  MAX_SMS_LENGTH: 160,
  MAX_NOTIFICATION_LENGTH: 200,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]{10,}$/,
  REQUIRED_VARIABLES: ['learnerName', 'inviteLink']
} as const;

// UI constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 200,
  ANIMATION_DURATION: 300,
  PAGINATION_SIZE: 20,
  MAX_VISIBLE_LEARNERS: 50
} as const;

// API endpoints (relative to base URL)
export const API_ENDPOINTS = {
  LEARNERS: '/learners',
  GRADES: '/grades',
  INVITES: '/invites',
  INVITE_SEND: '/invites/send',
  INVITE_RESEND: '/invites/:id/resend',
  INVITE_CANCEL: '/invites/:id/cancel',
  INVITE_PREVIEW: '/invites/preview',
  LEARNER_STATS: '/learners/stats',
  GRADE_STATS: '/grades/stats'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Please contact your administrator.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CLIPBOARD_ERROR: 'Failed to copy to clipboard. Please try again.',
  DOWNLOAD_ERROR: 'Failed to download file. Please try again.',
  INVITE_SEND_ERROR: 'Failed to send invites. Please try again.',
  LEARNER_LOAD_ERROR: 'Failed to load learners. Please refresh the page.',
  GRADE_LOAD_ERROR: 'Failed to load grades. Please refresh the page.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  INVITES_SENT: 'Invites sent successfully!',
  INVITE_RESENT: 'Invite resent successfully!',
  INVITE_CANCELLED: 'Invite cancelled successfully!',
  DATA_COPIED: 'Data copied to clipboard!',
  FILE_DOWNLOADED: 'File downloaded successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
} as const;

// File export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  TXT: 'txt'
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  SELECTED_LEARNERS: 'step3_selected_learners',
  SELECTED_CHANNEL: 'step3_selected_channel',
  DRAFT_MESSAGE: 'step3_draft_message',
  USER_PREFERENCES: 'step3_user_preferences'
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_BULK_ACTIONS: true,
  ENABLE_MESSAGE_PREVIEW: true,
  ENABLE_AUTO_SAVE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_EXPORT: true,
  ENABLE_CLIPBOARD: true
} as const;

// Theme colors (for status indicators)
export const STATUS_COLORS = {
  [INVITE_STATUSES.PENDING]: '#f59e0b',
  [INVITE_STATUSES.SENT]: '#3b82f6',
  [INVITE_STATUSES.DELIVERED]: '#10b981',
  [INVITE_STATUSES.OPENED]: '#8b5cf6',
  [INVITE_STATUSES.ACCEPTED]: '#059669',
  [INVITE_STATUSES.DECLINED]: '#dc2626',
  [INVITE_STATUSES.FAILED]: '#dc2626',
  [INVITE_STATUSES.CANCELLED]: '#6b7280'
} as const;

// Icon mappings for statuses
export const STATUS_ICONS = {
  [INVITE_STATUSES.PENDING]: 'clock',
  [INVITE_STATUSES.SENT]: 'mail',
  [INVITE_STATUSES.DELIVERED]: 'check',
  [INVITE_STATUSES.OPENED]: 'eye',
  [INVITE_STATUSES.ACCEPTED]: 'check-circle',
  [INVITE_STATUSES.DECLINED]: 'x-circle',
  [INVITE_STATUSES.FAILED]: 'alert-circle',
  [INVITE_STATUSES.CANCELLED]: 'x'
} as const;

export default {
  STEP_STATES,
  INVITE_STATUSES,
  CHANNEL_CONFIGS,
  AVAILABLE_CHANNELS,
  MESSAGE_TEMPLATES,
  VALIDATION_RULES,
  UI_CONSTANTS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EXPORT_FORMATS,
  DATE_FORMATS,
  STORAGE_KEYS,
  FEATURE_FLAGS,
  STATUS_COLORS,
  STATUS_ICONS
};

