import { Learner } from '../../../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://shobackendv2-production.up.railway.app');

export const learnerService = {
  getLearnersByGrade: async (gradeId: string): Promise<Learner[]> => {
    console.log(`[learnerService] Fetching all learners for grade:`, gradeId);
    
    if (!gradeId) {
      console.error('[learnerService] No gradeId provided');
      return [];
    }

    let page = 1;
    const perPage = 100;
    let allLearners: Learner[] = [];
    let totalPages = 1;

    try {
      do {
        const response = await fetch(`${API_BASE_URL}/api/v1/grades/${gradeId}/learners?page=${page}&per_page=${perPage}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const learnersData = data.learners || data.data?.learners || [];

        // Transform to match the full Learner interface
        const transformedLearners = learnersData.map((l: any): Learner => {
          const id = l.id?.toString() || l._id?.toString() || "";
          const gid = (l.grade_id || l.gradeId || gradeId)?.toString() || "";

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
            grade_id: gid,
            gradeId: gid,
            grade_name: l.grade_name || l.gradeName || "Unknown Grade",
            school_id: (l.school_id || l.schoolId)?.toString(),
            school_name: l.school_name || l.schoolName || "Unknown School",
            email: l.email || l.contact?.email || "",
            phone: l.contact?.phone || l.phone || l.mobile || l.cell || l.contact_number || l.contact?.whatsapp || "",
            created_at: l.created_at || "",
            updated_at: l.updated_at || "",
            contact: l.contact || {
              phone: l.phone || l.mobile || l.cell || l.contact_number || "",
              whatsapp: l.whatsapp || "",
              tel_home: l.tel_home || l.telHome || null,
              tel_emergency: l.tel_emergency || l.telEmergency || null,
              telegram: l.telegram || ""
            },
          };
        });

        allLearners.push(...transformedLearners);
        totalPages = data.pagination?.total_pages || data.total_pages || 1;
        page++;
      } while (page <= totalPages);

      console.log(`[learnerService] Loaded a total of ${allLearners.length} learners for grade ${gradeId}`);
      return allLearners;

    } catch (error) {
      console.error(`[learnerService] Error fetching all learners for grade ${gradeId}:`, error);
      return []; // Return empty array on failure
    }
  },
};
