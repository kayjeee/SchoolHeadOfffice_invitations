import React from 'react';
import { Learner, Grade } from '../../types';

interface LearnerSelectionProps {
  grades: Grade[];
  learnersByGrade: Record<string, Learner[]>;
  selectedGrades: string[];
  expandedGrades: string[];
  isLoadingGrades: boolean;
  isLoadingLearners: Record<string, boolean>;
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
  learnersByGrade,
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
  const expandedGradeId = expandedGrades.length > 0 ? expandedGrades[0] : null;
  const expandedGrade = expandedGradeId ? grades.find(g => g.id === expandedGradeId) : null;
  const expandedGradeLearners = expandedGradeId ? learnersByGrade[expandedGradeId] || [] : [];
  const isLoadingExpandedGradeLearners = expandedGradeId ? isLoadingLearners[expandedGradeId] : false;

  const allLearners = Object.values(learnersByGrade).flat();
  const selectedLearners = allLearners.filter(l => selectedGrades.includes(l.grade_id));

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Left Side - Grades List */}
      <div className="lg:w-1/2 space-y-4">
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {grades.map((grade) => {
                const isExpanded = expandedGrades.includes(grade.id);
                const isGradeLoadingLearners = isLoadingLearners[grade.id];
                
                return (
                  <div 
                    key={grade.id} 
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      isExpanded 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => onToggleGradeExpansion(grade.id)}
                  >
                    <div className="flex items-center justify-between">
                      <label 
                        className="flex items-center cursor-pointer"
                      >
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
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-sm text-gray-600 font-medium">
                            {grade.learnerCount} {grade.learnerCount === 1 ? 'learner' : 'learners'}
                          </span>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              grade.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {grade.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isGradeLoadingLearners ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleGradeExpansion(grade.id);
                              }}
                              className={`p-2 transition-colors ${
                                isExpanded ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                              }`}
                              title={isExpanded ? "Hide learners" : "Show learners"}
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isGradeLoadingLearners && (
                      <div className="mt-3 ml-7">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading learners...</span>
                        </div>
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
      </div>

      {/* Right Side - Learners Panel */}
      <div className="lg:w-1/2">
        <div className="sticky top-4">
          <div className="border rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">
                {expandedGrade ? `Learners in ${expandedGrade.name}` : 'Select a Grade'}
              </h3>
              {expandedGrade && (
                <p className="text-sm text-gray-600 mt-1">
                  {expandedGradeLearners.length} {expandedGradeLearners.length === 1 ? 'learner' : 'learners'} found
                  {expandedGrade.description && ` • ${expandedGrade.description}`}
                </p>
              )}
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {!expandedGrade ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👆</span>
                  </div>
                  <p className="text-lg font-medium text-gray-600">Select a grade to view learners</p>
                  <p className="text-sm mt-2">Click on a grade or the arrow icon to see its learners</p>
                </div>
              ) : isLoadingExpandedGradeLearners ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading learners...</p>
                </div>
              ) : expandedGradeLearners.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👤</span>
                  </div>
                  <p className="text-lg font-medium text-gray-600">No learners found</p>
                  <p className="text-sm mt-2">This grade doesn't have any assigned learners yet</p>
                </div>
              ) : (
                <div className="grid gap-3 p-4">
                  {expandedGradeLearners.map((learner) => (
                    <div 
                      key={learner.id} 
                      className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium flex-shrink-0">
                            {getDisplayName(learner).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {getDisplayName(learner)}
                              </h4>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                getDisplayStatus(learner) === "Active" 
                                  ? "bg-green-100 text-green-800" 
                                  : getDisplayStatus(learner) === "Inactive"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {getDisplayStatus(learner)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                              {learner.accession_number && (
                                <div>
                                  <span className="font-medium">Student ID:</span> 
                                  <span className="ml-1 font-mono">{learner.accession_number}</span>
                                </div>
                              )}
                              
                              {getDisplayGender(learner) !== "Unknown" && (
                                <div>
                                  <span className="font-medium">Gender:</span> 
                                  <span className="ml-1 capitalize">{getDisplayGender(learner).toLowerCase()}</span>
                                </div>
                              )}
                              
                              {learner.email && (
                                <div className="sm:col-span-2">
                                  <span className="font-medium">Email:</span> 
                                  <span className="ml-1 text-blue-600 truncate block">{learner.email}</span>
                                </div>
                              )}
                              
                              {learner.phone && (
                                <div className="sm:col-span-2">
                                  <span className="font-medium">Phone:</span> 
                                  <span className="ml-1">{learner.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {learner.created_at && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                          Joined: {new Date(learner.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {expandedGrade && expandedGradeLearners.length > 0 && (
              <div className="p-4 border-t bg-gray-50 rounded-b-.lg">
                <div className="flex flex-wrap justify-between items-center text-sm text-gray-600">
                  <span className="font-medium">
                    Total: {expandedGradeLearners.length} learners
                  </span>
                  <div className="flex space-x-4">
                    <span>
                      Active: {expandedGradeLearners.filter(l => getDisplayStatus(l) === "Active").length}
                    </span>
                    <span>
                      Female: {expandedGradeLearners.filter(l => getDisplayGender(l) === "Female").length}
                    </span>
                    <span>
                      Male: {expandedGradeLearners.filter(l => getDisplayGender(l) === "Male").length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Grades Summary */}
          {selectedGrades.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Selected Grades Summary</h4>
              <p className="text-blue-700">
                {selectedGrades.length} grade(s) selected:{" "}
                {grades
                  .filter((g) => selectedGrades.includes(g.id))
                  .map((g) => g.name)
                  .join(", ")}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Total learners: {selectedLearners.length}
              </p>
              <div className="flex space-x-4 mt-2 text-xs text-blue-600">
                <span>
                  Active: {selectedLearners.filter(l => getDisplayStatus(l) === "Active").length}
                </span>
                <span>
                  Female: {selectedLearners.filter(l => getDisplayGender(l) === "Female").length}
                </span>
                <span>
                  Male: {selectedLearners.filter(l => getDisplayGender(l) === "Male").length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerSelection;