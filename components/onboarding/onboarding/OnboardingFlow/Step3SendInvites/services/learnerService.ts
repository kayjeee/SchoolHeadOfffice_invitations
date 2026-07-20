import { Learner } from "../types";
import { API_BASE_URL } from "../utils/constants";

const transformLearner = (l: any, fallbackGradeId?: string): Learner => {
  const resolveId = (val: any): string => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val.$oid) return val.$oid;
      if (val.id) return resolveId(val.id);
      if (val._id) return resolveId(val._id);
    }
    return val.toString();
  };

  const id = resolveId(l.id || l._id);
  const gradeId = resolveId(l.grade_id || l.gradeId || fallbackGradeId);

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
    phone: l.contact?.phone || l.phone || l.mobile || l.cell || l.contact_number || l.contact?.whatsapp || l.parent_phone || l.parentPhone || "",
    created_at: l.created_at || "",
    updated_at: l.updated_at || "",
    contact: {
      phone: l.contact?.phone || l.phone || l.mobile || l.cell || l.contact_number || l.parent_phone || l.parentPhone || "",
      whatsapp: l.contact?.whatsapp || l.whatsapp || "",
      tel_home: l.contact?.tel_home || l.tel_home || l.telHome || null,
      tel_emergency: l.contact?.tel_emergency || l.tel_emergency || l.telEmergency || null,
      telegram: l.contact?.telegram || l.telegram || ""
    },
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
