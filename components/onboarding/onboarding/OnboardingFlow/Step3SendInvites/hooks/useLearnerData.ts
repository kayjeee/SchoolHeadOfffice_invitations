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

export const useLearnerData = (): UseLearnerDataReturn => {
  // State
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedLearners, setSelectedLearners] = useState<Learner[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  
  // Loading states
  const [learnersLoading, setLearnersLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  
  // Error states
  const [learnersError, setLearnersError] = useState<string | null>(null);
  const [gradesError, setGradesError] = useState<string | null>(null);

  // Computed values
  const loading = learnersLoading || gradesLoading;
  const error = learnersError || gradesError;

  // Fetch learners
  const fetchLearners = useCallback(async (filters?: any) => {
    setLearnersLoading(true);
    setLearnersError(null);
    
    try {
      const data = await learnerService.getLearners(filters);
      setLearners(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch learners';
      setLearnersError(errorMessage);
      console.error('Error fetching learners:', err);
    } finally {
      setLearnersLoading(false);
    }
  }, []);

  // Fetch grades
  const fetchGrades = useCallback(async () => {
    setGradesLoading(true);
    setGradesError(null);
    
    try {
      const data = await gradeService.getGradeStats();
      setGrades(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch grades';
      setGradesError(errorMessage);
      console.error('Error fetching grades:', err);
    } finally {
      setGradesLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchLearners();
    fetchGrades();
  }, [fetchLearners, fetchGrades]);

  // Learner selection actions
  const selectLearner = useCallback((learner: Learner) => {
    setSelectedLearners(prev => {
      if (prev.some(selected => selected.id === learner.id)) {
        return prev; // Already selected
      }
      return [...prev, learner];
    });
  }, []);

  const deselectLearner = useCallback((learnerId: string) => {
    setSelectedLearners(prev => prev.filter(learner => learner.id !== learnerId));
  }, []);

  const selectAllLearners = useCallback(() => {
    // Filter learners based on selected grades if any
    const filteredLearners = selectedGrades.length > 0
      ? learners.filter(learner => 
          selectedGrades.some(grade => grade.id === learner.gradeId)
        )
      : learners;
    
    setSelectedLearners(filteredLearners);
  }, [learners, selectedGrades]);

  const deselectAllLearners = useCallback(() => {
    setSelectedLearners([]);
  }, []);

  // Grade selection actions
  const selectGrade = useCallback((grade: Grade) => {
    setSelectedGrades(prev => {
      if (prev.some(selected => selected.id === grade.id)) {
        return prev; // Already selected
      }
      return [...prev, grade];
    });
  }, []);

  const deselectGrade = useCallback((gradeId: string) => {
    setSelectedGrades(prev => prev.filter(grade => grade.id !== gradeId));
    
    // Also deselect learners from this grade
    setSelectedLearners(prev => 
      prev.filter(learner => learner.gradeId !== gradeId)
    );
  }, []);

  // Refresh actions
  const refreshLearners = useCallback(async () => {
    await fetchLearners();
  }, [fetchLearners]);

  const refreshGrades = useCallback(async () => {
    await fetchGrades();
  }, [fetchGrades]);

  // Search learners
  const searchLearners = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchLearners();
      return;
    }
    
    await fetchLearners({ searchTerm: searchTerm.trim() });
  }, [fetchLearners]);

  // Update learners when grade selection changes
  useEffect(() => {
    if (selectedGrades.length > 0) {
      const gradeIds = selectedGrades.map(grade => grade.id);
      fetchLearners({ gradeIds });
    } else {
      fetchLearners();
    }
  }, [selectedGrades, fetchLearners]);

  return {
    // Data
    learners,
    selectedLearners,
    grades,
    selectedGrades,
    
    // Loading states
    loading,
    learnersLoading,
    gradesLoading,
    
    // Error states
    error,
    learnersError,
    gradesError,
    
    // Actions
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

