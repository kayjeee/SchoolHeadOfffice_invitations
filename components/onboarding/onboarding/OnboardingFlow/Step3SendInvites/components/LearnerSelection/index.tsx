import React from 'react';
import { LearnerCard } from './LearnerCard';
import { GradeFilter } from './GradeFilter';
import { Learner, Grade } from '../../types';

interface LearnerSelectionProps {
  learners: Learner[];
  selectedLearners: Learner[];
  grades: Grade[];
  selectedGrades: Grade[];
  onSelectLearner: (learner: Learner) => void;
  onDeselectLearner: (learnerId: string) => void;
  onSelectGrade: (grade: Grade) => void;
  onDeselectGrade: (gradeId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

export const LearnerSelection: React.FC<LearnerSelectionProps> = ({
  learners,
  selectedLearners,
  grades,
  selectedGrades,
  onSelectLearner,
  onDeselectLearner,
  onSelectGrade,
  onDeselectGrade,
  onSelectAll,
  onDeselectAll,
  onNext,
  onPrevious,
  canProceed
}) => {
  // Normalize grades: if backend sends _id, ensure each grade has .id
  const normalizedGrades = grades.map(g => ({
    ...g,
    id: g.id || (g as any)._id, // fallback to _id if id is missing
  }));

  const normalizedSelectedGrades = selectedGrades.map(g => ({
    ...g,
    id: g.id || (g as any)._id,
  }));

  // Filter learners by selected grades
  const filteredLearners = learners.filter(learner =>
    normalizedSelectedGrades.length === 0 ||
    normalizedSelectedGrades.some(grade => grade.id === learner.gradeId)
  );

  const isLearnerSelected = (learner: Learner) =>
    selectedLearners.some(selected => selected.id === learner.id);

  const handleLearnerToggle = (learner: Learner) => {
    if (isLearnerSelected(learner)) {
      onDeselectLearner(learner.id);
    } else {
      onSelectLearner(learner);
    }
  };

  return (
    <div className="learner-selection">
      <div className="selection-header">
        <h3>Select Learners to Invite</h3>
        <div className="selection-summary">
          {selectedLearners.length} of {learners.length} learners selected
        </div>
      </div>

      <div className="filters-section">
        <GradeFilter
          grades={normalizedGrades}
          selectedGrades={normalizedSelectedGrades}
          onSelectGrade={onSelectGrade}
          onDeselectGrade={onDeselectGrade}
        />
      </div>

      <div className="bulk-actions">
        <button
          type="button"
          onClick={onSelectAll}
          className="btn btn-secondary"
          disabled={filteredLearners.length === selectedLearners.length}
        >
          Select All ({filteredLearners.length})
        </button>
        <button
          type="button"
          onClick={onDeselectAll}
          className="btn btn-secondary"
          disabled={selectedLearners.length === 0}
        >
          Deselect All
        </button>
      </div>

      <div className="learners-grid">
        {filteredLearners.map(learner => (
          <LearnerCard
            key={learner.id}
            learner={learner}
            isSelected={isLearnerSelected(learner)}
            onToggle={() => handleLearnerToggle(learner)}
          />
        ))}
      </div>

      {filteredLearners.length === 0 && (
        <div className="empty-state">
          <p>No learners found matching the selected filters.</p>
        </div>
      )}

      <div className="step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
          disabled={!canProceed}
        >
          Next: Choose Channel
        </button>
      </div>
    </div>
  );
};

export default LearnerSelection;
