// interfaces/learner.ts
export interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  learner_number: string;
  school_name: string;
  grade: string;
  status: 'active' | 'inactive';
}
