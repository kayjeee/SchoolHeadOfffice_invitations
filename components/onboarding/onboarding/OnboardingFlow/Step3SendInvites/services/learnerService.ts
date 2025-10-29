import { Learner } from "../types";

export const getLearnersByGrade = async (gradeId: string): Promise<Learner[]> => {
  console.log(`[learnerService] Fetching learners for gradeId: ${gradeId}`);
  const res = await fetch(
    `https://shobackendv2-production.up.railway.app/api/v1/grades/${gradeId}/learners?page=1&per_page=100`
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[learnerService] Fetched ${data.data?.learners?.length || 0} learners for grade ${gradeId}`, data.data?.learners);
  return data.data?.learners || [];
};

export const getLearnersBySchool = async (schoolId: string): Promise<Learner[]> => {
  console.log(`[learnerService] Fetching all learners for schoolId: ${schoolId}`);
  const res = await fetch(
    `https://shobackendv2-production.up.railway.app/api/v1/schools/${schoolId}/learners?page=1&per_page=1000` // Assuming a high per_page to get all learners
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[learnerService] Fetched ${data.data?.learners?.length || 0} learners for school ${schoolId}`, data.data?.learners);
  return data.data?.learners || [];
};
