import { Grade } from '../../../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://shobackendv2-production.up.railway.app');

export const gradeService = {
  getGrades: async (schoolId: string): Promise<Grade[]> => {
    console.log(`[gradeService] Fetching grades for school: ${schoolId}`);
    
    if (!schoolId) {
      console.error('[gradeService] No schoolId provided');
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/grades`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Your API returns { status: "success", data: { grades: [...] } }
      const grades = data.data?.grades || [];
      console.log(`[gradeService] Loaded ${grades.length} grades`);
      
      // Transform to match Grade interface
      return grades.map((grade: any) => ({
        id: grade.id,
        name: grade.name,
        description: grade.description,
        learnerCount: grade.learners_count || grade.stats?.learners_count || 0
      }));
    } catch (error) {
      console.error('[gradeService] Error:', error);
      throw error;
    }
  },
};