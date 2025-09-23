import React from 'react';
import { Icon } from '../UI/Icon';
import { Grade } from '../../types';

interface GradeFilterProps {
  grades: Grade[];
  selectedGrades: Grade[];
  onSelectGrade: (grade: Grade) => void;
  onDeselectGrade: (gradeId: string) => void;
}

export const GradeFilter: React.FC<GradeFilterProps> = ({
  grades,
  selectedGrades,
  onSelectGrade,
  onDeselectGrade
}) => {
  const isGradeSelected = (grade: Grade) => 
    selectedGrades.some(selected => selected.id === grade.id);

  const handleGradeToggle = (grade: Grade) => {
    if (isGradeSelected(grade)) {
      onDeselectGrade(grade.id);
    } else {
      onSelectGrade(grade);
    }
  };

  const clearAllFilters = () => {
    selectedGrades.forEach(grade => onDeselectGrade(grade.id));
  };

  return (
    <div className="grade-filter">
      <div className="filter-header">
        <h4>Filter by Grade</h4>
        {selectedGrades.length > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="clear-filters-btn"
          >
            <Icon name="x" />
            Clear filters
          </button>
        )}
      </div>

      <div className="grade-options">
        {grades.map(grade => (
          <button
            key={grade.id}
            type="button"
            onClick={() => handleGradeToggle(grade)}
            className={`grade-option ${isGradeSelected(grade) ? 'selected' : ''}`}
          >
            <span className="grade-name">{grade.name}</span>
            <span className="learner-count">({grade.learnerCount})</span>
            {isGradeSelected(grade) && (
              <Icon name="check" className="selected-icon" />
            )}
          </button>
        ))}
      </div>

      {selectedGrades.length > 0 && (
        <div className="active-filters">
          <span className="filter-label">Active filters:</span>
          <div className="filter-tags">
            {selectedGrades.map(grade => (
              <div key={grade.id} className="filter-tag">
                <span>{grade.name}</span>
                <button
                  type="button"
                  onClick={() => onDeselectGrade(grade.id)}
                  className="remove-filter"
                  aria-label={`Remove ${grade.name} filter`}
                >
                  <Icon name="x" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeFilter;

