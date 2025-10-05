import React from 'react';
import { Learner, Grade } from '../../types';

interface LearnerSelectionProps {
  grades: Grade[];
  learners: Learner[];
  selectedGrades: string[];
  expandedGrades: string[];
  isLoadingGrades: boolean;
  isLoadingLearners: boolean;
  gradesError: string | null;
  onGradeSelection: (gradeId: string) => void;
  onSelectAllGrades: () => void;
  onToggleGradeExpansion: (gradeId: string) => void;
  onReloadGrades: () => void;
}

const getDisplayName = (learner: Learner): string => {
    if (learner.full_name && learner.full_name !== 'Unnamed Learner') {
      return learner.full_name;
    }
    const firstName = learner.first_name || '';
    const lastName = learner.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Unnamed Learner';
};

const getDisplayGender = (learner: Learner): string => {
    return learner.gender_text || learner.gender || 'Unknown';
};

const getDisplayStatus = (learner: Learner): string => {
    return learner.status_text || learner.status || 'Unknown';
};

export const LearnerSelection: React.FC<LearnerSelectionProps> = ({
  grades,
  learners,
  selectedGrades,
  expandedGrades,
  isLoadingGrades,
  isLoadingLearners,
  gradesError,
  onGradeSelection,
  onSelectAllGrades,
  onToggleGradeExpansion,
  onReloadGrades,
}) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Select Grades to Invite
        </h3>
        <button
          onClick={onReloadGrades}
          disabled={isLoadingGrades}
          className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoadingGrades ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reload Grades</span>
            </>
          )}
        </button>
      </div>

      {gradesError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <span>❌</span>
              <span>{gradesError}</span>
            </div>
            <button
              onClick={onReloadGrades}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {isLoadingLearners && !isLoadingGrades && (
        <div className="text-center py-6">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading learners...</p>
        </div>
      )}

      {isLoadingGrades && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grades...</p>
        </div>
      )}

      {!isLoadingGrades && grades.length > 0 && (
        <>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  selectedGrades.length === grades.length && grades.length > 0
                }
                onChange={onSelectAllGrades}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-3 font-medium text-gray-900">
                Select All Grades ({grades.length})
              </span>
            </label>
            <span className="text-sm text-gray-500">
              {selectedGrades.length} selected
            </span>
          </div>

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {grades.map((grade) => {
              const gradeLearners = learners.filter(l => l.grade_id === grade.id);
              const isExpanded = expandedGrades.includes(grade.id);
              
              return (
                <div key={grade.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGrades.includes(grade.id)}
                        onChange={() => onGradeSelection(grade.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">{grade.name}</span>
                        {grade.description && (
                          <p className="text-sm text-gray-500">{grade.description}</p>
                        )}
                      </div>
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {gradeLearners.length} {gradeLearners.length === 1 ? 'learner' : 'learners'}
                        </span>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            grade.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {grade.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                      {isLoadingLearners && selectedGrades.includes(grade.id) ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        selectedGrades.includes(grade.id) && gradeLearners.length > 0 && (
                          <button
                            onClick={() => onToggleGradeExpansion(grade.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title={isExpanded ? "Hide learners" : "Show learners"}
                          >
                            <svg
                              className={`w-4 h-4 transform transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  
                  {isLoadingLearners && selectedGrades.includes(grade.id) && (
                    <div className="mt-3 ml-7">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading learners...</span>
                      </div>
                    </div>
                  )}
                  
                  {!isLoadingLearners && selectedGrades.includes(grade.id) && isExpanded && (
                    <div className="mt-3 ml-7 border-t pt-3">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">
                        Learners in {grade.name} ({gradeLearners.length})
                      </h4>
                      
                      {gradeLearners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                          {gradeLearners.map((learner) => (
                            <div 
                              key={learner.id} 
                              className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                                      {getDisplayName(learner).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-900 text-sm">
                                        {getDisplayName(learner)}
                                      </h5>
                                      {learner.accession_number && (
                                        <p className="text-xs text-gray-500">
                                          ID: {learner.accession_number}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                    {getDisplayGender(learner) !== "Unknown" && (
                                      <div>
                                        <span className="font-medium">Gender:</span> {getDisplayGender(learner)}
                                      </div>
                                    )}
                                    
                                    {getDisplayStatus(learner) !== "Unknown" && (
                                      <div>
                                        <span className="font-medium">Status:</span> 
                                        <span className={`ml-1 px-1 rounded ${
                                          getDisplayStatus(learner) === "Active" 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-gray-100 text-gray-800"
                                        }`}>
                                          {getDisplayStatus(learner)}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {learner.email && (
                                      <div className="col-span-2">
                                        <span className="font-medium">Email:</span> 
                                        <span className="ml-1 text-blue-600 truncate">{learner.email}</span>
                                      </div>
                                    )}
                                    
                                    {learner.phone && (
                                      <div className="col-span-2">
                                        <span className="font-medium">Phone:</span> 
                                        <span className="ml-1">{learner.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end space-y-1">
                                  <div className={`text-xs px-2 py-1 rounded-full ${
                                    getDisplayStatus(learner) === "Active" 
                                      ? "bg-green-100 text-green-800" 
                                      : getDisplayStatus(learner) === "Inactive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {getDisplayStatus(learner)}
                                  </div>
                                  {learner.created_at && (
                                    <div className="text-xs text-gray-400">
                                      Joined: {new Date(learner.created_at).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-lg">👤</span>
                          </div>
                          <p>No learners found in this grade</p>
                          <p className="text-xs mt-1">The grade might not have any assigned learners yet</p>
                        </div>
                      )}
                      
                      {gradeLearners.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>
                              Showing {gradeLearners.length} learner{gradeLearners.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex space-x-3">
                              <span>
                                Active: {gradeLearners.filter(l => getDisplayStatus(l) === "Active").length}
                              </span>
                              <span>
                                Female: {gradeLearners.filter(l => getDisplayGender(l) === "Female").length}
                              </span>
                              <span>
                                Male: {gradeLearners.filter(l => getDisplayGender(l) === "Male").length}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {!isLoadingGrades && grades.length === 0 && !gradesError && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <p>No grades available for this school.</p>
          <p className="text-sm mt-2">Please contact your administrator or try reloading.</p>
          <button
            onClick={onReloadGrades}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Grades
          </button>
        </div>
      )}

      {selectedGrades.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Selected Grades Summary</h4>
          <p className="text-blue-700">
            {selectedGrades.length} grade(s) selected:{" "}
            {grades
              .filter((g) => selectedGrades.includes(g.id))
              .map((g) => g.name)
              .join(", ")}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Total learners: {learners.filter(l => selectedGrades.includes(l.grade_id)).length}
          </p>
          <div className="flex space-x-4 mt-2 text-xs text-blue-600">
            <span>
              Active: {learners.filter(l => selectedGrades.includes(l.grade_id) && getDisplayStatus(l) === "Active").length}
            </span>
            <span>
              Female: {learners.filter(l => selectedGrades.includes(l.grade_id) && getDisplayGender(l) === "Female").length}
            </span>
            <span>
              Male: {learners.filter(l => selectedGrades.includes(l.grade_id) && getDisplayGender(l) === "Male").length}
            </span>
          </div>
          <p className="text-xs text-blue-500 mt-2">
            💡 Click the arrow next to each grade to see individual learners in a grid view
          </p>
        </div>
      )}
    </div>
  );
};

export default LearnerSelection;