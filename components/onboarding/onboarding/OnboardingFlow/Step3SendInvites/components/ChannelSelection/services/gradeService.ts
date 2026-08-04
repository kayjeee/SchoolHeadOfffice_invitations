import { Grade } from '../../../types';

export const gradeService = {
  getGrades: async (schoolId: string): Promise<Grade[]> => {
    console.log(`[gradeService] Fetching grades for school: ${schoolId}`);
    
    if (!schoolId) {
      console.error('[gradeService] No schoolId provided');
      return [];
    }

    try {
      let isLocal = false;
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        isLocal = host === 'localhost' || host === '127.0.0.1' || host.includes('gitpod') || host.includes('codesandbox');
      }

      let fetchUrl = `https://shobackendv2-production.up.railway.app/api/v1/schools/${schoolId}/grades`;
      if (isLocal && schoolId === "6a708f76ce9b120d388d5983") {
        fetchUrl = "http://localhost:4000/api/v1/schools/6a708f76ce9b120d388d5983/grades";
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Support both data-wrapped and root-level grades list formats!
      const grades = data.grades || data.data?.grades || data.data || [];
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