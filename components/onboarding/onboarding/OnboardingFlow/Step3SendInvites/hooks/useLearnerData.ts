import { useState, useEffect, useCallback, useRef } from "react";
import { learnerService } from "../services/learnerService";
import { gradeService } from "../services/gradeService";
import { Grade, Learner } from "../types";

/**
 * Hook: useLearnerData
 * Handles fetching grades & learners for a specific school,
 * with full grade/learner selection and refresh support.
 */
export const useLearnerData = (schoolId?: string) => {
  // ---------- STATE ----------
  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingLearners, setIsLoadingLearners] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [learnersError, setLearnersError] = useState<string | null>(null);

  // Ref to hold latest grades for mapping purposes
  const gradesRef = useRef<Grade[]>([]);
  useEffect(() => {
    gradesRef.current = grades;
  }, [grades]);

  // ---------- FETCH GRADES ----------
  const fetchGrades = useCallback(async () => {
    if (!schoolId) {
      console.warn("❌ Missing schoolId: cannot fetch grades");
      setGradesError("Missing school information");
      return;
    }

    console.log("📚 Fetching grades for school:", schoolId);
    setIsLoadingGrades(true);
    setGradesError(null);

    try {
      const gradesData = await gradeService.getGrades(schoolId);
      console.log("✅ Grades fetched:", gradesData);

      const formattedGrades: Grade[] = gradesData.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        level: parseInt(g.grade_level?.match(/\d+/)?.[0] || "0"),
        learnerCount: g.stats?.learners_count || 0,
        isActive: g.status_text === "active",
      }));

      setGrades(formattedGrades);
    } catch (error) {
      console.error("❌ Error fetching grades:", error);
      setGradesError("Failed to load grades.");
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, [schoolId]);

  // ---------- FETCH LEARNERS ----------
  const fetchLearnersForGrades = useCallback(async (gradeIds: string[]) => {
    if (!schoolId || gradeIds.length === 0) {
      setLearners([]);
      return;
    }

    setIsLoadingLearners(true);
    setLearnersError(null);

    try {
      const allLearners: Learner[] = [];
      console.log("👩🏽‍🎓 Fetching learners for grade IDs:", gradeIds);

      for (const gradeId of gradeIds) {
        try {
          const learnersData = await learnerService.getLearnersByGrade(gradeId);
          console.log(`📋 Grade ${gradeId} learners:`, learnersData.length);

         const mapped = learnersData.map((l: any) => ({
  id: l.id,
  first_name: l.first_name || "",
  last_name: l.last_name || "",
  full_name: l.full_name || `${l.first_name || ""} ${l.last_name || ""}`.trim() || "Unnamed Learner",
  gender: l.gender_text || "Unknown",
  gender_text: l.gender_text || "Unknown",
  accession_number: l.accession_number || "",
  status: l.status_text || "Unknown",
  status_text: l.status_text || "Unknown",
  grade_id: gradeId,
  grade_name: gradesRef.current.find((g) => g.id === gradeId)?.name || "Unknown Grade",
  school_id: l.school_id || schoolId,
  school_name: l.school_name || "Unknown School",
  email: l.email || "",
  phone: l.contact?.phone || l.phone || "",
  created_at: l.created_at || "",
  updated_at: l.updated_at || "",
  contact: l.contact || { phone: "", whatsapp: "", tel_home: null, tel_emergency: null, telegram: "" },
}));


          allLearners.push(...mapped);
        } catch (error) {
          console.error(`❌ Failed to fetch learners for grade ${gradeId}:`, error);
        }
      }

      console.log("🎯 Total learners fetched:", allLearners.length);
      setLearners(allLearners);
    } catch (error) {
      console.error("❌ Error fetching learners:", error);
      setLearnersError("Failed to fetch learners.");
      setLearners([]);
    } finally {
      setIsLoadingLearners(false);
    }
  }, [schoolId]);

  // ---------- GRADE SELECTION HANDLERS ----------
  const handleGradeSelection = useCallback((gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  }, []);

  const handleSelectAllGrades = useCallback(() => {
    setSelectedGrades((prev) =>
      prev.length === grades.length ? [] : grades.map((g) => g.id)
    );
  }, [grades]);

  const handleReloadGrades = useCallback(() => {
    fetchGrades();
  }, [fetchGrades]);

  // ---------- EFFECTS ----------
  useEffect(() => {
    if (schoolId) {
      fetchGrades();
    }
  }, [schoolId, fetchGrades]);

  useEffect(() => {
    if (selectedGrades.length > 0) {
      fetchLearnersForGrades(selectedGrades);
    } else {
      setLearners([]);
    }
  }, [selectedGrades, fetchLearnersForGrades]);

  // ---------- RETURN ----------
  return {
    // Data
    grades,
    learners,
    selectedGrades,

    // UI states
    isLoadingGrades,
    isLoadingLearners,
    gradesError,
    learnersError,
    expandedGrades,

    // Actions
    setExpandedGrades,
    fetchGrades,
    fetchLearnersForGrades,
    handleGradeSelection,
    handleSelectAllGrades,
    handleReloadGrades,
  };
};
