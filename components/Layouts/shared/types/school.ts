// types/school.ts
export interface School {
  id: string;
  _id: string;
  name: string;
  schoolName: string; // Make this required
  logo?: string;
  schoolImage?: string;
}