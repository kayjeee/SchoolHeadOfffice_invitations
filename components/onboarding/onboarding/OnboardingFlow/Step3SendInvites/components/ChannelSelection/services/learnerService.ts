import { Learner } from '../../../types';

export const learnerService = {
  getLearnersByGrade: async (gradeId: string): Promise<Learner[]> => {
    console.log(`[learnerService] Fetching learners for grade:`, gradeId);
    
    if (!gradeId) {
      console.error('[learnerService] No gradeId provided');
      return [];
    }

    try {
      const response = await fetch(`http://localhost:4000/api/v1/grades/${gradeId}/learners?page=1&per_page=1000`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Your API returns { status: "success", data: { learners: [...] } }
      const learners = data.data?.learners || [];
      console.log(`[learnerService] Loaded ${learners.length} learners for grade ${gradeId}`);
      
      // Transform to match Learner interface
      return learners.map((learner: any) => ({
        id: learner.id,
        name: learner.full_name,
        email: learner.contact?.email || '',
        phone: learner.contact?.phone || learner.contact?.whatsapp || '',
        gradeId: learner.grade_id || gradeId // Use the provided gradeId as fallback
      }));
    } catch (error) {
      console.error(`[learnerService] Error for grade ${gradeId}:`, error);
      return []; // Return empty array instead of throwing
    }
  },
};