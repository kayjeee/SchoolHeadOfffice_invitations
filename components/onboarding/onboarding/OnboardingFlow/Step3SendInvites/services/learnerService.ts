import { Learner } from "../types";
import { API_BASE_URL } from "../utils/constants";

export const getLearnersByGrade = async (gradeId: string): Promise<Learner[]> => {
  let page = 1;
  const perPage = 100;
  let allLearners: Learner[] = [];
  let totalPages = 1;

  do {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/grades/${gradeId}/learners?page=${page}&per_page=${perPage}`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (data.data?.learners) {
      const learnersData = data.data.learners;
      const transformedLearners = learnersData.map((l: any): Learner => ({
        id: l.id,
        first_name: l.first_name || "",
        last_name: l.last_name || "",
        full_name: l.full_name || `${l.first_name || ""} ${l.last_name || ""}`.trim() || "Unnamed Learner",
        gender: l.gender_text || "Unknown",
        gender_text: l.gender_text || "Unknown",
        accession_number: l.accession_number || "",
        status: l.status_text || "Unknown",
        status_text: l.status_text || "Unknown",
        grade_id: l.grade_id || gradeId,
        grade_name: l.grade_name || "Unknown Grade",
        school_id: l.school_id,
        school_name: l.school_name || "Unknown School",
        email: l.email || l.contact?.email || "",
        phone: l.contact?.phone || l.phone || l.contact?.whatsapp || "",
        created_at: l.created_at || "",
        updated_at: l.updated_at || "",
        contact: l.contact || { phone: "", whatsapp: "", tel_home: null, tel_emergency: null, telegram: "" },
      }));
      allLearners.push(...transformedLearners);
    }

    totalPages = data.pagination?.total_pages || 1;
    page++;
  } while (page <= totalPages);

  return allLearners;
};

export const getLearnersBySchool = async (schoolId: string): Promise<Learner[]> => {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/schools/${schoolId}/learners?page=1&per_page=1000` // Assuming a high per_page to get all learners
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.learners || [];
};
