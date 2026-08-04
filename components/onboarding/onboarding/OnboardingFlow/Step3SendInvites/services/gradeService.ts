import { Grade } from "../types";

export const getGrades = async (schoolId: string): Promise<Grade[]> => {
  console.log(`[gradeService] Fetching grades for schoolId: ${schoolId}`);

  let isLocal = false;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    isLocal = host === 'localhost' || host === '127.0.0.1' || host.includes('gitpod') || host.includes('codesandbox');
  }

  let fetchUrl = `https://shobackendv2-production.up.railway.app/api/v1/schools/${schoolId}/grades`;
  if (isLocal) {
    fetchUrl = `http://localhost:4000/api/v1/schools/${schoolId}/grades`;
  }

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.grades || data.data?.grades || data.data || [];
};
