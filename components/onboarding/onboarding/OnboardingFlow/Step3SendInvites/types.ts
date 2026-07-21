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

export interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
  school: any;
  user: any;
}

export type StepState = "grade-selection" | "channel-selection" | "message-composer" | "results";

