import { Learner } from "../types";

export const getLearnersByGrade = async (gradeId: string): Promise<Learner[]> => {
  const res = await fetch(
    `https://shobackendv2-production.up.railway.app/api/v1/grades/${gradeId}/learners?page=1&per_page=100`
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.learners || [];
};

export const getLearnersBySchool = async (schoolId: string): Promise<Learner[]> => {
  const res = await fetch(
    `https://shobackendv2-production.up.railway.app/api/v1/schools/${schoolId}/learners?page=1&per_page=1000` // Assuming a high per_page to get all learners
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.learners || [];
};
