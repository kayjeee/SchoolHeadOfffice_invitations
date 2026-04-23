// lib/types/parent.types.ts
export interface ParentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  school_id: string;
}
