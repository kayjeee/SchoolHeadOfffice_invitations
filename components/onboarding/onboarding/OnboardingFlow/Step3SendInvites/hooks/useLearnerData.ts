import { useState, useEffect, useCallback, useRef } from "react";
import { learnerService } from "../services/learnerService";
import { gradeService } from "../services/gradeService";
import { Grade, Learner } from "../types";

export const useLearnerData = (schoolId: string, selectedGrades: string[]) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState<boolean>(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState<boolean>(false);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [learnersError, setLearnersError] = useState<string | null>(null);

  // Use ref to store grades to avoid dependency issues
  const gradesRef = useRef<Grade[]>([]);
  
  // Update ref when grades change
  useEffect(() => {
    gradesRef.current = grades;
  }, [grades]);

  // Fetch grades for the school
  const fetchGrades = useCallback(async () => {
    console.log("🔍 Fetching grades for school:", schoolId);

    if (!schoolId) {
      console.log("❌ No schoolId available from school object");
      setGradesError("No school information available");
      return;
    }

    setIsLoadingGrades(true);
    setGradesError(null);

    try {
      const gradesData = await gradeService.getGrades(schoolId);
      console.log("✅ Grades API response:", gradesData);

      const transformedGrades = gradesData.map((grade: any) => ({
        id: grade.id,
        name: grade.name,
        description: grade.description,
        level: parseInt(grade.grade_level?.match(/\d+/)?.[0] || "0"),
        learnerCount: grade.stats?.learners_count || 0,
        isActive: grade.status_text === "active",
      }));

      setGrades(transformedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGradesError("Failed to load grades. Please try again.");
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, [schoolId]);

  // Global learner loading function
  const fetchLearnersForGrades = useCallback(async (gradeIds: string[]) => {
    if (gradeIds.length === 0) {
      setLearners([]);
      setLearnersError(null);
      return;
    }

    setIsLoadingLearners(true);
    setLearnersError(null);

    try {
      const results: Learner[] = [];
      console.log("🔍 Starting to fetch learners for grades:", gradeIds);

      for (const gradeId of gradeIds) {
        console.log(`📋 Fetching learners for grade: ${gradeId}`);
        
        try {
          const learnersData = await learnerService.getLearnersByGrade(gradeId);
          console.log(`👥 Learners found for grade ${gradeId}:`, learnersData.length);

          const mapped = learnersData.map((l: any) => ({
            ...l,
            first_name: l.first_name || "",
            last_name: l.last_name || "",
            full_name: l.full_name || `${l.first_name || ""} ${l.last_name || ""}`.trim() || "Unnamed Learner",
            gender: l.gender_text || "Unknown",
            status: l.status_text || "Unknown",
            grade_id: gradeId,
            grade_name: gradesRef.current.find((g) => g.id === gradeId)?.name || "Unknown Grade",
            phone: l.contact?.phone || l.phone || "",
            email: l.email || "",
          }));

          results.push(...mapped);
        } catch (gradeError) {
          console.error(`❌ Error fetching learners for grade ${gradeId}:`, gradeError);
        }
      }

      console.log(`🎯 TOTAL LEARNERS FOUND:`, results.length);
      setLearners(results);
    } catch (err) {
      console.error("❌ Error in fetch learners process:", err);
      setLearnersError("Failed to fetch learners.");
      setLearners([]);
    } finally {
      setIsLoadingLearners(false);
    }
  }, []); // Empty dependencies since we use gradesRef

  // Fetch grades on schoolId change
  useEffect(() => {
    if (schoolId) {
      fetchGrades();
    }
  }, [schoolId]); // Only depend on schoolId

  // Fetch learners when selected grades change
  useEffect(() => {
    if (selectedGrades.length > 0) {
      fetchLearnersForGrades(selectedGrades);
    } else {
      setLearners([]);
      setLearnersError(null);
    }
  }, [selectedGrades]); // Only depend on selectedGrades

  return {
    grades,
    learners,
    isLoadingGrades,
    isLoadingLearners,
    gradesError,
    learnersError,
    expandedGrades,
    setExpandedGrades,
    fetchGrades,
    fetchLearnersForGrades,
  };
};