import { ParentProfile, Learner } from "../../../../lib/api/parent-api";

export interface ExtendedProfile extends ParentProfile {
  subscription?: "standard" | "premium";
  // Add compatibility fields if needed by UI
  first_name?: string;
  last_name?: string;
}

export interface DashboardProps {
  user: any;
  profile: ExtendedProfile;
  learners: Learner[];
}

export interface TabProps {
  learners?: Learner[];
  isPremium?: boolean;
}

export type TabKey =
  | "overview"
  | "academics"
  | "attendance"
  | "behavior"
  | "assignments"
  | "messages"
  | "reports"
  | "analytics"
  | "premium";
