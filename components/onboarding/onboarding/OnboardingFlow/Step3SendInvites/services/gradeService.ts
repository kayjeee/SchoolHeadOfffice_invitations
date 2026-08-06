import { Grade } from "../types";

export const getGrades = async (schoolId: string): Promise<Grade[]> => {
  // Simulate API call
  console.log(`[gradeService] Fetching grades for schoolId: ${schoolId}`);
  // In a real application, this would be an actual API call
  // For now, returning dummy data or fetching from a mock API
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:4000"
      : "https://shobackendv2-production.up.railway.app");

  const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/grades`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.grades || data.data?.grades || [];
};
