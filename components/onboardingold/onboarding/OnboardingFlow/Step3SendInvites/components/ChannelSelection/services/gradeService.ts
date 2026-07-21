import { Grade } from '../../../types';
import { API_BASE_URL } from '../../../utils/constants';

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
      
      // Support both { success: true, grades: [...] } and { success: true, data: { grades: [...] } }
      const grades = data.grades || data.data?.grades || [];
      console.log(`[gradeService] Loaded ${grades.length} grades`);
      
      // Transform to match Grade interface
      return grades.map((grade: any) => ({
        id: grade.id || grade._id,
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
