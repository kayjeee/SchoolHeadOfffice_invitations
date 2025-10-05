import { useState, useEffect } from 'react';
import { Grade, Learner } from '../types/channel';
import { gradeService } from '../services/gradeService';
import { learnerService } from '../services/learnerService';
import { logger } from '../utils/logger';

interface UseAudienceDataProps {
  schoolId: string;
  selectedGrades: Grade[];
  channelId: string;
  isOpen: boolean; // 👈 Added to control when data loads
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
  selectedGrades,
  channelId,
  isOpen,
}: UseAudienceDataProps): UseAudienceDataReturn => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don’t run when modal is closed or no school selected
    if (!isOpen || !schoolId) {
      logger.debug('useAudienceData', 'Modal closed or no schoolId; skipping load', { isOpen, schoolId });
      return;
    }

    const loadAudienceData = async () => {
      logger.info('useAudienceData', 'Loading audience data', {
        schoolId,
        channelId,
        selectedGradesCount: selectedGrades.length,
      });

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Determine which grades to use
        let gradesToUse = selectedGrades;

        if (gradesToUse.length === 0) {
          logger.debug('useAudienceData', 'No pre-selected grades, loading all grades');
          gradesToUse = await gradeService.getGrades(schoolId);
        }

        setGrades(gradesToUse);

        // Step 2: Load learners for each grade
        if (gradesToUse.length > 0) {
          logger.debug('useAudienceData', 'Fetching learners for each grade', {
            gradeCount: gradesToUse.length,
          });

          const learnerPromises = gradesToUse.map(async (grade) => {
            try {
              const gradeLearners = await learnerService.getLearnersByGrade(grade.id);
              logger.debug('useAudienceData', `Loaded learners for grade ${grade.name}`, {
                gradeId: grade.id,
                learnerCount: gradeLearners.length,
              });
              return gradeLearners;
            } catch (err) {
              logger.error('useAudienceData', `Failed to load learners for grade ${grade.name}`, err);
              return [];
            }
          });

          const learnersByGrade = await Promise.all(learnerPromises);
          const flattenedLearners = learnersByGrade.flat();

          setLearners(flattenedLearners);
          logger.info('useAudienceData', 'Successfully loaded audience data', {
            totalGrades: gradesToUse.length,
            totalLearners: flattenedLearners.length,
          });
        } else {
          logger.warn('useAudienceData', 'No grades found for this school');
          setLearners([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unexpected error while loading audience data';
        logger.error('useAudienceData', 'Error loading audience data', errorMessage);
        setError(errorMessage);
      } finally {
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
