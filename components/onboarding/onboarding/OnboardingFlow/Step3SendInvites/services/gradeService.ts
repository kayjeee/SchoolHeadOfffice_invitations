import { Grade } from "../types";

export const gradeService = {
  getGrades: async (schoolId: string): Promise<Grade[]> => {
    // Simulate API call
    console.log(`[gradeService] Fetching grades for schoolId: ${schoolId}`);
    // In a real application, this would be an actual API call
    // For now, returning dummy data or fetching from a mock API
    const response = await fetch(`https://3ddf3987485e.ngrok-free.app/${schoolId}/grades`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data.grades;
  },
};
