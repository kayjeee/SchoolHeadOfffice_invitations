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

  const [grades, setGrades] = useState<string[]>([]);
  const [customGrade, setCustomGrade] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const schoolLogo = school?.logoUrl || school?.logo || null;
  const schoolName = school?.schoolName || school?.name || "your school";
  
  console.log("🖼️ [Step1CreateGrades] Logo URL:", schoolLogo);
  console.log("🏫 [Step1CreateGrades] School Name:", schoolName);

  const handlePresetSelection = (option: string) => {
    console.log("🎯 [Step1CreateGrades] handlePresetSelection called with:", option);
    const generatedGrades = generateGrades(option);
    console.log("📚 [Step1CreateGrades] Generated grades:", generatedGrades);
    setGrades(generatedGrades);
    setSelectedPreset(option);
  };

  const handleAddCustomGrade = () => {
    console.log("➕ [Step1CreateGrades] handleAddCustomGrade called");
    if (customGrade.trim() && !grades.includes(customGrade.trim())) {
      const newGrades = [...grades, customGrade.trim()];
      console.log("✅ [Step1CreateGrades] Adding custom grade:", customGrade.trim());
      setGrades(newGrades);
      setCustomGrade("");
      setSelectedPreset("Custom");
    }
  };

  const handleRemoveGrade = (gradeToRemove: string) => {
    console.log("🗑️ [Step1CreateGrades] handleRemoveGrade called for:", gradeToRemove);
    const newGrades = grades.filter((grade) => grade !== gradeToRemove);
    setGrades(newGrades);
    if (newGrades.length === 0) {
      setSelectedPreset("");
    }
  };

  const handleCreateGrades = async () => {
    console.log("🚀 [Step1CreateGrades] handleCreateGrades called");

    if (!user?.sub) {
      console.error("❌ [Step1CreateGrades] No user sub found");
      alert("User not found. Please log in.");
      return;
    }

    try {
      console.log("📝 [Step1CreateGrades] Calling onUpdateData with grades");
      if (onUpdateData) {
        onUpdateData({ grades });
      }

      await completeStep(user.sub, "create_grades", {
        grades,
        schoolId: school?.id || school?._id,
        schoolName: schoolName
      });

      console.log("✅ [Step1CreateGrades] completeStep API call successful");

      if (onNext) {
        await onNext({ grades });
        console.log("🎉 [Step1CreateGrades] onNext completed");
      }
    } catch (error) {
      console.error("❌ [Step1CreateGrades] Failed to save grades:", error);
      alert("Something went wrong saving your grades. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section with Logo */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* School Logo */}
                {schoolLogo ? (
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white rounded-xl shadow-lg overflow-hidden ring-4 ring-white/30">
                      <img 
                        src={schoolLogo} 
                        alt={`${schoolName} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("❌ [Step1CreateGrades] Logo failed to load:", schoolLogo);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = '<span class="text-3xl">🏫</span>';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center ring-4 ring-white/30">
                      <span className="text-3xl">🏫</span>
                    </div>
                  </div>
                )}
                
                {/* Title */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Grade Setup
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Configure grade levels for <span className="font-semibold text-white">{schoolName}</span>
                  </p>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="hidden lg:flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white font-semibold">Step 1</span>
                <span className="text-blue-200">of 4</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-1/4 transition-all duration-500"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Setup Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Setup Presets */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2 text-xl">⚡</span>
                  Quick Setup Presets
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Elementary (K-5)", icon: "🎒", desc: "Kindergarten - 5th Grade" },
                    { label: "Middle School (6-8)", icon: "📚", desc: "6th - 8th Grade" },
                    { label: "High School (9-12)", icon: "🎓", desc: "9th - 12th Grade" },
                    { label: "K-12 (Complete)", icon: "🏫", desc: "All Grades" },
                  ].map((option) => (
                    <button
                      key={option.label}
                      className={`group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 ${
                        selectedPreset === option.label
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl scale-105 ring-4 ring-blue-300"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                      }`}
                      onClick={() => handlePresetSelection(option.label)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className={`font-semibold mb-1 ${
                            selectedPreset === option.label ? "text-white" : "text-gray-800"
                          }`}>
                            {option.label.split(' ')[0]}
                          </div>
                          <div className={`text-sm ${
                            selectedPreset === option.label ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {option.desc}
                          </div>
                        </div>
                        {selectedPreset === option.label && (
                          <div className="flex-shrink-0 ml-2">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Grade Input */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2 text-xl">✏️</span>
                  Add Custom Grade
                </h3>
              </div>
              <div className="p-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customGrade}
                    onChange={(e) => setCustomGrade(e.target.value)}
                    placeholder="e.g., Pre-K, Advanced Placement, Grade R..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    onKeyPress={(e) => e.key === "Enter" && handleAddCustomGrade()}
                  />
                  <button
                    onClick={handleAddCustomGrade}
                    disabled={!customGrade.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Create custom grade levels that fit your school's structure
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Selected Grades */}
          <div className="lg:col-span-1">
            <div className={`bg-white rounded-xl shadow-lg border overflow-hidden sticky top-8 transition-all duration-300 ${
              grades.length > 0 ? "border-green-200" : "border-gray-100"
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                grades.length > 0 
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100" 
                  : "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <span className="mr-2 text-xl">
                      {grades.length > 0 ? "✅" : "📋"}
                    </span>
                    Selected Grades
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    grades.length > 0 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {grades.length}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {grades.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-20">📚</div>
                    <p className="text-gray-500 text-sm">
                      No grades selected yet
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Choose a preset or add custom grades
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        {grades.length} grade{grades.length !== 1 ? "s" : ""} ready
                      </p>
                      <button
                        onClick={() => {
                          setGrades([]);
                          setSelectedPreset("");
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {grades.map((grade, index) => (
                        <div
                          key={grade}
                          className="group flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-all duration-200"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeIn 0.3s ease-out'
                          }}
                        >
                          <span className="text-sm font-medium text-gray-800 flex items-center">
                            <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                              {index + 1}
                            </span>
                            {grade}
                          </span>
                          <button
                            onClick={() => handleRemoveGrade(grade)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 text-sm font-bold"
                            title="Remove grade"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center gap-2 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              Back
            </button>

            <button
              onClick={handleCreateGrades}
              disabled={grades.length === 0 || isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Creating Grades...
                </>
              ) : (
                <>
                  Continue to Next Step
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Step1CreateGrades;