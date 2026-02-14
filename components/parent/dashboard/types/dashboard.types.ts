import { ParentProfile, Learner } from "../../../../lib/types/parent.types";

export interface ExtendedProfile extends ParentProfile {
  subscription?: "standard" | "premium";
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
  | "analytics";
