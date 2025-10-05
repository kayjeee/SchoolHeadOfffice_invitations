import React, { useState } from "react";
import { completeStep } from "../services/onboardingService";

// ----------------------
// Helper Functions
// ----------------------
const generateGrades = (option: string): string[] => {
  const gradeMap: { [key: string]: string[] } = {
    "Elementary (K-5)": [
      "Kindergarten",
      "1st Grade",
      "2nd Grade",
      "3rd Grade",
      "4th Grade",
      "5th Grade",
    ],
    "Middle School (6-8)": ["6th Grade", "7th Grade", "8th Grade"],
    "High School (9-12)": ["9th Grade", "10th Grade", "11th Grade", "12th Grade"],
    "K-12 (Complete)": [
      "Kindergarten",
      "1st Grade",
      "2nd Grade",
      "3rd Grade",
      "4th Grade",
      "5th Grade",
      "6th Grade",
      "7th Grade",
      "8th Grade",
      "9th Grade",
      "10th Grade",
      "11th Grade",
      "12th Grade",
    ],
    Custom: [],
  };
  return gradeMap[option] || [];
};

// ----------------------
// Main Component
// ----------------------
const Step1CreateGrades = ({
  user,
  school,
  onNext,
  onBack,
  isLoading,
  onUpdateData,
}) => {
  console.log("🏫 [Step1CreateGrades] Component mounted");
  console.log("📦 [Step1CreateGrades] Props received:", {
    user: user ? { id: user._id || user.id, sub: user.sub } : 'No user',
    school: school,
    hasOnNext: typeof onNext === 'function',
    hasOnBack: typeof onBack === 'function',
    isLoading: isLoading,
    hasOnUpdateData: typeof onUpdateData === 'function'
  });

  // Heavy school prop logging
  console.log("🔍 [Step1CreateGrades] SCHOOL PROP DEEP ANALYSIS:");
  console.log("🏫 [Step1CreateGrades] school value:", school);
  console.log("🏫 [Step1CreateGrades] school type:", typeof school);
  console.log("🏫 [Step1CreateGrades] school === null:", school === null);
  console.log("🏫 [Step1CreateGrades] school === undefined:", school === undefined);
  
  if (school && typeof school === 'object') {
    console.log("🎯 [Step1CreateGrades] SCHOOL OBJECT DETAILS:");
    console.log("🏫 [Step1CreateGrades] school.id:", school.id);
    console.log("🏫 [Step1CreateGrades] school._id:", school._id);
    console.log("🏫 [Step1CreateGrades] school.name:", school.name);
    console.log("🏫 [Step1CreateGrades] school object keys:", Object.keys(school));
    console.log("🏫 [Step1CreateGrades] full school object:", school);
  } else {
    console.warn("⚠️ [Step1CreateGrades] NO SCHOOL OBJECT or invalid school prop");
  }

  const [grades, setGrades] = useState<string[]>([]);
  const [customGrade, setCustomGrade] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  console.log("📊 [Step1CreateGrades] Component state:", {
    gradesCount: grades.length,
    grades: grades,
    customGrade: customGrade,
    selectedPreset: selectedPreset
  });

  const handlePresetSelection = (option: string) => {
    console.log("🎯 [Step1CreateGrades] handlePresetSelection called with:", option);
    console.log("🏫 [Step1CreateGrades] School context in handlePresetSelection:", {
      schoolName: school?.name,
      schoolId: school?.id || school?._id
    });
    
    const generatedGrades = generateGrades(option);
    console.log("📚 [Step1CreateGrades] Generated grades:", generatedGrades);
    setGrades(generatedGrades);
    setSelectedPreset(option);
  };

  const handleAddCustomGrade = () => {
    console.log("➕ [Step1CreateGrades] handleAddCustomGrade called");
    console.log("🏫 [Step1CreateGrades] School context in handleAddCustomGrade:", {
      schoolName: school?.name,
      schoolId: school?.id || school?._id
    });
    
    if (customGrade.trim() && !grades.includes(customGrade.trim())) {
      const newGrades = [...grades, customGrade.trim()];
      console.log("✅ [Step1CreateGrades] Adding custom grade:", customGrade.trim());
      console.log("📚 [Step1CreateGrades] New grades array:", newGrades);
      setGrades(newGrades);
      setCustomGrade("");
      setSelectedPreset("Custom");
    } else {
      console.log("❌ [Step1CreateGrades] Custom grade not added - empty or duplicate");
    }
  };

  const handleRemoveGrade = (gradeToRemove: string) => {
    console.log("🗑️ [Step1CreateGrades] handleRemoveGrade called for:", gradeToRemove);
    console.log("🏫 [Step1CreateGrades] School context in handleRemoveGrade:", {
      schoolName: school?.name,
      schoolId: school?.id || school?._id
    });
    
    const newGrades = grades.filter((grade) => grade !== gradeToRemove);
    console.log("📚 [Step1CreateGrades] Grades after removal:", newGrades);
    setGrades(newGrades);
    if (newGrades.length === 0) {
      console.log("📭 [Step1CreateGrades] All grades removed - clearing preset");
      setSelectedPreset("");
    }
  };

  const handleCreateGrades = async () => {
    console.log("🚀 [Step1CreateGrades] handleCreateGrades called");
    console.log("🏫 [Step1CreateGrades] FINAL SCHOOL CONTEXT:", {
      school: school,
      schoolName: school?.name,
      schoolId: school?.id || school?._id,
      hasSchool: !!school
    });
    console.log("📚 [Step1CreateGrades] Grades to create:", grades);
    console.log("👤 [Step1CreateGrades] User sub:", user?.sub);

    if (!user?.sub) {
      console.error("❌ [Step1CreateGrades] No user sub found - cannot proceed");
      alert("User not found. Please log in.");
      return;
    }

    try {
      console.log("📝 [Step1CreateGrades] Calling onUpdateData with grades");
      if (onUpdateData) {
        onUpdateData({ grades });
        console.log("✅ [Step1CreateGrades] onUpdateData completed");
      }

      // ✅ Mark this step as completed in Rails
      console.log("🎯 [Step1CreateGrades] Calling completeStep API");
      console.log("🏫 [Step1CreateGrades] School ID being sent to API:", school?.id || school?._id);
      
      await completeStep(user.sub, "create_grades", {
        grades,
        schoolId: school?.id || school?._id,
        schoolName: school?.name
      });

      console.log("✅ [Step1CreateGrades] completeStep API call successful");

      if (onNext) {
        console.log("➡️ [Step1CreateGrades] Calling onNext with grades data");
        await onNext({ grades });
        console.log("🎉 [Step1CreateGrades] onNext completed - moving to next step");
      }
    } catch (error) {
      console.error("❌ [Step1CreateGrades] Failed to save grades:", error);
      console.error("🔍 [Step1CreateGrades] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert("Something went wrong saving your grades. Please try again.");
    }
  };

  console.log("🎨 [Step1CreateGrades] Rendering component with:", {
    schoolName: school?.name || "No school name",
    gradesCount: grades.length,
    selectedPreset: selectedPreset,
    isLoading: isLoading
  });

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Up Grades</h2>
        <p className="text-gray-600">
          Define the grade levels for{" "}
          <span className="font-medium text-gray-800">
            {school?.name || "your school"}
          </span>
        </p>
        {/* Debug info - remove in production */}
        <div className="mt-2 text-xs text-gray-400">
          School ID: {school?.id || school?._id || 'No ID'} | 
          School Name: {school?.name || 'No name'}
        </div>
      </div>

      {/* Quick Setup Options */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Setup Options
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              "Elementary (K-5)",
              "Middle School (6-8)",
              "High School (9-12)",
              "K-12 (Complete)",
            ].map((option) => (
              <button
                key={option}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPreset === option
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:shadow-sm"
                }`}
                onClick={() => handlePresetSelection(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Grade Input */}
      <div className="mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">✏️</span>
            Add Custom Grade
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={customGrade}
              onChange={(e) => setCustomGrade(e.target.value)}
              placeholder="e.g., Pre-K, Advanced Placement, etc."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleAddCustomGrade()}
            />
            <button
              onClick={handleAddCustomGrade}
              disabled={!customGrade.trim()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Selected Grades Display */}
      {grades.length > 0 && (
        <div className="mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-green-800 flex items-center">
                <span className="mr-2">✅</span>
                Selected Grades ({grades.length})
              </h4>
              <button
                onClick={() => {
                  console.log("🗑️ [Step1CreateGrades] Clear all grades clicked");
                  setGrades([]);
                  setSelectedPreset("");
                }}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {grades.map((grade) => (
                <span
                  key={grade}
                  className="inline-flex items-center px-3 py-2 bg-white border border-green-300 text-green-800 rounded-full text-sm font-medium shadow-sm"
                >
                  {grade}
                  <button
                    onClick={() => handleRemoveGrade(grade)}
                    className="ml-2 text-green-600 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          {grades.length > 0 && (
            <span className="text-sm text-gray-500">
              {grades.length} grade{grades.length !== 1 ? "s" : ""} selected
            </span>
          )}
          <button
            onClick={handleCreateGrades}
            disabled={grades.length === 0 || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Continue →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1CreateGrades;