export interface Learner {
  id: string;
  name: string;
  email: string;
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