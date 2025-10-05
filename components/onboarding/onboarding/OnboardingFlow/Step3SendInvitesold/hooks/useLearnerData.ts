import { useState, useEffect, useCallback } from 'react';
import { gradeService } from '../services/gradeService';
import { Grade, Learner } from '../types';

export const useLearnerData = (schoolId: string) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingLearners, setIsLoadingLearners] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!schoolId) {
      setGradesError("No school information available");
      return;
    }

    setIsLoadingGrades(true);
    setGradesError(null);

    try {
      const gradesData = await gradeService.getGrades(schoolId);
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

  const fetchLearnersForGrades = useCallback(async (gradeIds: string[]) => {
    if (gradeIds.length === 0) {
      setLearners([]);
      return;
    }

    setIsLoadingLearners(true);
    try {
      const results: Learner[] = [];

      for (const gradeId of gradeIds) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/v1/grades/${gradeId}/learners?page=1&per_page=100`
          );
          
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          
          const data = await res.json();
          const learnersData = data.data?.learners || [];

          const mapped = learnersData.map((l: any) => ({
            ...l,
            first_name: l.first_name || '',
            last_name: l.last_name || '',
            full_name: l.full_name || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unnamed Learner',
            gender: l.gender_text || 'Unknown',
            status: l.status_text || 'Unknown',
            grade_id: gradeId,
            grade_name: grades.find((g) => g.id === gradeId)?.name || "Unknown Grade",
            phone: l.contact?.phone || l.phone || '',
            email: l.email || ''
          }));

          results.push(...mapped);
        } catch (gradeError) {
          console.error(`Error fetching learners for grade ${gradeId}:`, gradeError);
        }
      }

      setLearners(results);
    } catch (err) {
      console.error("Error in fetch learners process:", err);
      setLearners([]);
    } finally {
      setIsLoadingLearners(false);
    }
  }, [grades]);

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

  const handleReloadGrades = useCallback(async () => {
    await fetchGrades();
    setSelectedGrades([]);
    setLearners([]);
  }, [fetchGrades]);

  // Initial load
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return {
    grades,
    selectedGrades,
    learners,
    isLoadingGrades,
    isLoadingLearners,
    gradesError,
    handleGradeSelection,
    handleSelectAllGrades,
    handleReloadGrades,
    fetchLearnersForGrades
  };
};