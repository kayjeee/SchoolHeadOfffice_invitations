import React, { useState } from 'react';
import { GraduationCap, ChevronDown, Check } from 'lucide-react';

const GradeSelector = ({ school, onSelect, selectedGrade }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sample grades data - in a real app this would come from props or API
  const grades = school?.grades || [
    { id: 'grade-1', name: 'Grade 1' },
    { id: 'grade-2', name: 'Grade 2' },
    { id: 'grade-3', name: 'Grade 3' },
    { id: 'grade-4', name: 'Grade 4' },
    { id: 'grade-5', name: 'Grade 5' },
    { id: 'grade-6', name: 'Grade 6' },
    { id: 'grade-7', name: 'Grade 7' },
  ];

  const handleSelect = (grade) => {
    // Only call onSelect if it's provided
    if (typeof onSelect === 'function') {
      onSelect(grade);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-3 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <GraduationCap className="text-gray-400 mr-3" size={18} />
          <span className="block truncate">
            {selectedGrade ? selectedGrade.name : 'Select a grade'}
          </span>
        </div>
        <ChevronDown className="text-gray-400" size={18} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          tabIndex={-1}
          role="listbox"
        >
          {grades.length === 0 ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-center">
              No grades available
            </li>
          ) : (
            grades.map((grade) => (
              <li
                key={grade.id}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 transition-colors"
                id={`grade-option-${grade.id}`}
                role="option"
                onClick={() => handleSelect(grade)}
              >
                <div className="flex items-center">
                  <span
                    className={`block truncate ${
                      selectedGrade?.id === grade.id ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {grade.name}
                  </span>
                </div>

                {selectedGrade?.id === grade.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <Check size={18} />
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      {selectedGrade && (
        <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center text-sm text-blue-800">
            <Check className="mr-2 text-blue-600" size={16} />
            <span>
              Selected: <span className="font-medium">{selectedGrade.name}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeSelector;