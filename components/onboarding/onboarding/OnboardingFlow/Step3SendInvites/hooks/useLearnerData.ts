import { useState, useEffect, useCallback, useRef } from "react";
import * as learnerService from "../services/learnerService";
import * as gradeService from "../services/gradeService";
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

         const mapped = learnersData.map((l: any) => {
           const id = l.id?.toString() || l._id?.toString() || "";
           const gid = (l.grade_id || l.gradeId || gradeId)?.toString() || "";
           const phoneVal = l.contact?.phone || l.phone || l.mobile || l.cell || l.contact_number || l.contact?.whatsapp || "";
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
             grade_name: gradesRef.current.find((g) => g.id === gid)?.name || "Unknown Grade",
             school_id: (l.school_id || l.schoolId || schoolId)?.toString(),
             school_name: l.school_name || l.schoolName || "Unknown School",
             email: l.email || l.contact?.email || "",
             phone: phoneVal,
             created_at: l.created_at || "",
             updated_at: l.updated_at || "",
             contact: l.contact || {
               phone: phoneVal,
               whatsapp: l.whatsapp || l.contact?.whatsapp || "",
               tel_home: l.tel_home || l.telHome || null,
               tel_emergency: l.tel_emergency || l.telEmergency || null,
               telegram: l.telegram || ""
             },
           };
         });


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
