// types/school.ts
export interface School {
  id: string;
  _id: string;
  name: string;
  schoolName: string; // Make  o this required
  logo?: string;
  schoolImage: string;
  theme?: string; // Optional theme color for the school
}