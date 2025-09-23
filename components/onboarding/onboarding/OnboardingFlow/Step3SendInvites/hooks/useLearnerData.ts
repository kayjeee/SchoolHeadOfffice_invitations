import { useState, useEffect, useCallback } from 'react';
import { Learner, Grade } from '../types';
import { learnerService } from '../services/learnerService';
import { gradeService } from '../services/gradeService';

export interface UseLearnerDataReturn {
  // Data
  learners: Learner[];
  selectedLearners: Learner[];
  grades: Grade[];
  selectedGrades: Grade[];

  // Loading states
  loading: boolean;
  learnersLoading: boolean;
  gradesLoading: boolean;

  // Error states
  error: string | null;
  learnersError: string | null;
  gradesError: string | null;

  // Actions
  selectLearner: (learner: Learner) => void;
  deselectLearner: (learnerId: string) => void;
  selectGrade: (grade: Grade) => void;
  deselectGrade: (gradeId: string) => void;
  selectAllLearners: () => void;
  deselectAllLearners: () => void;
  refreshLearners: () => Promise<void>;
  refreshGrades: () => Promise<void>;
  searchLearners: (searchTerm: string) => Promise<void>;
}

export const useLearnerData = (schoolId: string): UseLearnerDataReturn => {
  // States
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedLearners, setSelectedLearners] = useState<Learner[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);

  const [learnersLoading, setLearnersLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);

  const [learnersError, setLearnersError] = useState<string | null>(null);
  const [gradesError, setGradesError] = useState<string | null>(null);

  const loading = learnersLoading || gradesLoading;
  const error = learnersError || gradesError;

  // Fetch learners
  const fetchLearners = useCallback(
    async (filters?: any) => {
      if (!schoolId) return;
      setLearnersLoading(true);
      setLearnersError(null);
      try {
        const data = await learnerService.getLearners(schoolId, filters);
        setLearners(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setLearnersError(err?.message || 'Failed to fetch learners');
      } finally {
        setLearnersLoading(false);
      }
    },
    [schoolId]
  );

  // Fetch grades
  const fetchGrades = useCallback(async () => {
    if (!schoolId) return;
    setGradesLoading(true);
    setGradesError(null);
    try {
      const data = await gradeService.getGrades(schoolId);
      setGrades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setGradesError(err?.message || 'Failed to fetch grades');
    } finally {
      setGradesLoading(false);
    }
  }, [schoolId]);

  // Initial fetch
  useEffect(() => {
    fetchLearners();
    fetchGrades();
  }, [fetchLearners, fetchGrades]);

  // Learner actions
  const selectLearner = useCallback((learner: Learner) => {
    setSelectedLearners(prev => (prev.some(l => l.id === learner.id) ? prev : [...prev, learner]));
  }, []);

  const deselectLearner = useCallback((learnerId: string) => {
    setSelectedLearners(prev => prev.filter(l => l.id !== learnerId));
  }, []);

  const selectAllLearners = useCallback(() => {
    const filtered = selectedGrades.length
      ? learners.filter(l => selectedGrades.some(g => g.id === l.gradeId))
      : learners;
    setSelectedLearners(filtered);
  }, [learners, selectedGrades]);

  const deselectAllLearners = useCallback(() => setSelectedLearners([]), []);

  // Grade actions
  const selectGrade = useCallback((grade: Grade) => {
    setSelectedGrades(prev => (prev.some(g => g.id === grade.id) ? prev : [...prev, grade]));
  }, []);

  const deselectGrade = useCallback((gradeId: string) => {
    setSelectedGrades(prev => prev.filter(g => g.id !== gradeId));
    setSelectedLearners(prev => prev.filter(l => l.gradeId !== gradeId));
  }, []);

  // Refresh functions
  const refreshLearners = useCallback(async () => fetchLearners(), [fetchLearners]);
  const refreshGrades = useCallback(async () => fetchGrades(), [fetchGrades]);

  // Search learners
  const searchLearners = useCallback(
    async (searchTerm: string) => {
      await fetchLearners(searchTerm.trim() ? { searchTerm: searchTerm.trim() } : undefined);
    },
    [fetchLearners]
  );

  // Update learners when grades change
  useEffect(() => {
    if (!schoolId) return;
    const gradeIds = selectedGrades.map(g => g.id);
    fetchLearners(gradeIds.length ? { gradeIds } : undefined);
  }, [selectedGrades, fetchLearners, schoolId]);

  return {
    learners,
    selectedLearners,
    grades,
    selectedGrades,
    loading,
    learnersLoading,
    gradesLoading,
    error,
    learnersError,
    gradesError,
    selectLearner,
    deselectLearner,
    selectGrade,
    deselectGrade,
    selectAllLearners,
    deselectAllLearners,
    refreshLearners,
    refreshGrades,
    searchLearners
  };
};

export default useLearnerData;
