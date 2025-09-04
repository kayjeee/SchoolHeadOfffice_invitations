import React, { useState } from "react";

// ----------------------
// Helper Functions
// ----------------------
const generateGrades = (option: string): string[] => {
  const gradeMap: { [key: string]: string[] } = {
    'Elementary (K-5)': ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'],
    'Middle School (6-8)': ['6th Grade', '7th Grade', '8th Grade'],
    'High School (9-12)': ['9th Grade', '10th Grade', '11th Grade', '12th Grade'],
    'Custom': []
  };
  return gradeMap[option] || [];
};

// ----------------------
// Step Components
// ----------------------
const Step1CreateGrades = ({ school, onboardingStatus, onNext, onBack, isLoading, onUpdateData }) => {
  const [grades, setGrades] = useState<string[]>([]);

  const handleCreateGrades = async () => {
    if (onUpdateData) {
      onUpdateData({ grades });
    }
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Up Grades</h2>
        <p className="text-gray-600">Define the grade levels for {school?.name || 'your school'}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Setup Options</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'Custom'].map(option => (
              <button
                key={option}
                className="px-4 py-2 bg-white border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={() => setGrades(generateGrades(option))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {grades.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Selected Grades</h4>
            <div className="flex flex-wrap gap-2">
              {grades.map(grade => (
                <span key={grade} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {grade}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCreateGrades}
          disabled={grades.length === 0 || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default Step1CreateGrades;
