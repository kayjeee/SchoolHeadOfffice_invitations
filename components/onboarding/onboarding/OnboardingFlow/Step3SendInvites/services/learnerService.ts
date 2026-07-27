import { Learner } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://shobackendv2-production.up.railway.app');

const transformLearner = (l: any, fallbackGradeId?: string): Learner => {
  const id = l.id?.toString() || l._id?.toString() || "";
  const gradeId = (l.grade_id || l.gradeId || fallbackGradeId)?.toString() || "";

  return {
    id,
    first_name: l.first_name || l.firstName || "",
    last_name: l.last_name || l.lastName || "",
    full_name: l.full_name || l.fullName || `${l.first_name || l.firstName || ""} ${l.last_name || l.lastName || ""}`.trim() || "Unnamed Learner",
    gender: l.gender_text || l.gender || "Unknown",
    gender_text: l.gender_text || l.gender || "Unknown",
    accession_number: l.accession_number || l.accessionNumber || "",
    status: l.status_text || l.status || "Unknown",
    status_text: l.status_text || l.status || "Unknown",
    grade_id: gradeId,
    gradeId: gradeId,
    grade_name: l.grade_name || l.gradeName || "Unknown Grade",
    school_id: (l.school_id || l.schoolId)?.toString(),
    school_name: l.school_name || l.schoolName || "Unknown School",
    email: l.email || l.contact?.email || "",
    phone: l.contact?.phone || l.phone || l.mobile || l.cell || l.contact_number || l.contact?.whatsapp || "",
    created_at: l.created_at || "",
    updated_at: l.updated_at || "",
    contact: l.contact || { phone: "", whatsapp: "", tel_home: null, tel_emergency: null, telegram: "" },
  };
};

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
    const learnersData = data.learners || data.data?.learners;

    if (learnersData && Array.isArray(learnersData)) {
      const transformedLearners = learnersData.map((l: any) => transformLearner(l, gradeId));
      allLearners.push(...transformedLearners);
    }

    totalPages = data.pagination?.total_pages || data.total_pages || 1;
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
  const learnersData = data.learners || data.data?.learners || [];
  return Array.isArray(learnersData) ? learnersData.map((l: any) => transformLearner(l)) : [];
};
