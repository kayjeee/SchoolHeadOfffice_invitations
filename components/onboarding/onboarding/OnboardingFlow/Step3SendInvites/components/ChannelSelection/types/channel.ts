export interface Learner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gradeId?: string;
}

export interface Grade {
  id: string;
  name: string;
  description?: string;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface School {
  id?: string;
  _id?: string;
  schoolName?: string;
  name?: string;
  schoolEmail?: string;
  email?: string;
}

export interface ChannelSelectionProps {
  channels: Channel[];
  selectedChannels: string[];
  learners: Learner[];
  selectedGrades: Grade[]; // NEW: Add selected grades
  schoolName: string;
  schools: School[];
  school: School;
  onChannelSelection: (channelId: string) => void;
  onSelectAllChannels: () => void;
}

export interface PrCodeData {
  purpose: string;
  metadata: {
    school_name: string;
    academic_year: string;
    generated_at: string;
    scope: string;
    channels: string[];
  };
}

export interface ChannelModalProps {
  channel: Channel;
  isOpen: boolean;
  onClose: () => void;
  schoolLink: string;
  schoolName: string;
  schoolId: string;
  prCode?: string | null;
  onChannelSelect: (channelId: string) => void;
  isSelected: boolean;
  selectedGrades: Grade[]; // NEW: Add selected grades
  selectedLearners: Learner[]; // NEW: Add selected learners
  school: any; // Add school prop for API calls
}