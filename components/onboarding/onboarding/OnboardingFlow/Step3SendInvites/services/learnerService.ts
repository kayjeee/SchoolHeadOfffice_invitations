import { Learner } from "../types";

export const learnerService = {
  getLearnersByGrade: async (gradeId: string): Promise<Learner[]> => {
    console.log(`[learnerService] Fetching learners for gradeId: ${gradeId}`);
    const res = await fetch(
      `https://shobackendv2-production.up.railway.app/api/v1/grades/${gradeId}/learners?page=1&per_page=100`
    );
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.data?.learners || [];
  },
};
