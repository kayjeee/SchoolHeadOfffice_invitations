import { useState, useEffect } from 'react';
import { Grade, Learner } from '../../../types';
import { gradeService } from '../services/gradeService';
import { learnerService } from '../services/learnerService';
import { logger } from '../utils/logger';

interface UseAudienceDataProps {
  schoolId: string;
  selectedGrades: Grade[];
  channelId: string;
  isOpen: boolean;
}

interface UseAudienceDataReturn {
  grades: Grade[];
  learners: Learner[];
  isLoading: boolean;
  error: string | null;
  totalLearners: number;
}

/**
 * Custom hook to load grades and learners for a given school and channel.
 * Data loads only when the modal (or component) is open and a valid schoolId exists.
 */
export const useAudienceData = ({
  schoolId,
  selectedGrades = [],
  channelId,
  isOpen,
}: UseAudienceDataProps): UseAudienceDataReturn => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 [useAudienceData] useEffect triggered', {
      isOpen,
      schoolId,
      selectedGrades: selectedGrades,
      selectedGradesLength: selectedGrades?.length,
      channelId
    });

    // Don't run when modal is closed or no school selected
    if (!isOpen || !schoolId) {
      logger.debug('useAudienceData', 'Modal closed or no schoolId; skipping load', { 
        isOpen, 
        schoolId,
        selectedGradesCount: selectedGrades?.length || 0
      });
      return;
    }

    const loadAudienceData = async () => {
      console.log('🚀 [useAudienceData] Starting data load', {
        schoolId,
        selectedGradesCount: selectedGrades?.length || 0,
        channelId
      });

      logger.info('useAudienceData', 'Loading audience data', {
        schoolId,
        channelId,
        selectedGradesCount: selectedGrades?.length || 0,
      });

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Determine which grades to use
        let gradesToUse = selectedGrades || [];

        console.log('📚 [useAudienceData] Grades to use:', {
          initialCount: gradesToUse.length,
          grades: gradesToUse.map(g => ({ id: g.id, name: g.name }))
        });

        if (gradesToUse.length === 0) {
          logger.debug('useAudienceData', 'No pre-selected grades, loading all grades');
          console.log('🔄 [useAudienceData] Loading all grades from API');
          gradesToUse = await gradeService.getGrades(schoolId);
          console.log('✅ [useAudienceData] Loaded grades from API:', gradesToUse.length);
        }

        setGrades(gradesToUse);

        // Step 2: Load learners for each grade
        if (gradesToUse.length > 0) {
          logger.debug('useAudienceData', 'Fetching learners for each grade', {
            gradeCount: gradesToUse.length,
          });

          console.log('👥 [useAudienceData] Loading learners for grades:', gradesToUse.length);

          const learnerPromises = gradesToUse.map(async (grade) => {
            console.log(`📖 [useAudienceData] Loading learners for grade: ${grade.name} (${grade.id})`);
            try {
              const gradeLearners = await learnerService.getLearnersByGrade(grade.id);
              console.log(`✅ [useAudienceData] Loaded ${gradeLearners.length} learners for grade ${grade.name}`);
              
              logger.debug('useAudienceData', `Loaded learners for grade ${grade.name}`, {
                gradeId: grade.id,
                learnerCount: gradeLearners.length,
              });

              // Add grade_id to each learner for tracking
              const learnersWithGrade = gradeLearners.map(learner => ({
                ...learner,
                grade_id: learner.grade_id || grade.id // Ensure grade_id is set
              }));

              return learnersWithGrade;
            } catch (err) {
              logger.error('useAudienceData', `Failed to load learners for grade ${grade.name}`, err);
              console.error(`❌ [useAudienceData] Failed to load learners for grade ${grade.name}:`, err);
              return [];
            }
          });

          const learnersByGrade = await Promise.all(learnerPromises);
          const flattenedLearners = learnersByGrade.flat();

          console.log('🎉 [useAudienceData] All learners loaded:', {
            totalLearners: flattenedLearners.length,
            byGrade: learnersByGrade.map((learners, index) => ({
              grade: gradesToUse[index]?.name,
              count: learners.length
            }))
          });

          setLearners(flattenedLearners);
          logger.info('useAudienceData', 'Successfully loaded audience data', {
            totalGrades: gradesToUse.length,
            totalLearners: flattenedLearners.length,
          });
        } else {
          console.log('ℹ️ [useAudienceData] No grades to load learners from');
          logger.warn('useAudienceData', 'No grades found for this school');
          setLearners([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unexpected error while loading audience data';
        console.error('❌ [useAudienceData] Error loading audience data:', errorMessage);
        logger.error('useAudienceData', 'Error loading audience data', errorMessage);
        setError(errorMessage);
      } finally {
        console.log('🏁 [useAudienceData] Data loading completed');
        setIsLoading(false);
      }
    };

    loadAudienceData();
  }, [isOpen, schoolId, selectedGrades, channelId]);

  return {
    grades,
    learners,
    isLoading,
    error,
    totalLearners: learners.length,
  };
};