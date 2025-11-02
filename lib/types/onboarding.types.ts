// lib/types/onboarding.types.ts
export type OnboardingStep =
  | 'INITIALIZING'
  | 'PROFILE_SETUP'
  | 'IDENTITY_VERIFICATION'
  | 'LINK_LEARNERS'
  | 'NOTIFICATION_PREFERENCES'
  | 'TERMS_ACCEPTANCE'
  | 'COMPLETE';

export interface InvitationData {
  id: string;
  school_id: string;
  school_name: string;
  phone_number: string;
  learner_ids: string[];
  expires_at: string;
}
