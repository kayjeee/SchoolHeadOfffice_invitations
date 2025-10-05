import { Grade } from "../types";

export const gradeService = {
  getGrades: async (schoolId: string): Promise<Grade[]> => {
    // Simulate API call
    console.log(`[gradeService] Fetching grades for schoolId: ${schoolId}`);
    // In a real application, this would be an actual API call
    // For now, returning dummy data or fetching from a mock API
    const response = await fetch(`http://localhost:4000/api/v1/schools/${schoolId}/grades`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data.grades;
  },
};
