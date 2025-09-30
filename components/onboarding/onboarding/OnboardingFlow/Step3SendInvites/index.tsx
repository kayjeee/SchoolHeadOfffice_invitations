import React, { useState, useEffect } from "react";
import { gradeService } from "./services/gradeService";
import { useStepValidation, StepState } from "./hooks/useStepValidation";

// Types
interface Grade {
  id: string;
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  learnerCount?: number;
}

interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  gender_text: string;
  accession_number: string;
  status: string;
  status_text: string;
  grade_id: string;
  grade_name: string;
  school_id: string;
  school_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  contact?: {
    phone: string;
    whatsapp: string;
    tel_home: string | null;
    tel_emergency: string | null;
    telegram: string;
  };
}

interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
  school: any;
  user: any;
}

// Available channels with their display names and icons
const CHANNELS = [
  { id: "email", name: "Email", icon: "📧", description: "Send via email" },
  { id: "sms", name: "SMS", icon: "💬", description: "Send text messages" },
  { id: "whatsapp", name: "WhatsApp", icon: "💚", description: "Send via WhatsApp" },
  { id: "portal", name: "School Portal", icon: "🏫", description: "Notify in school portal" },
];

const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({
  onNext,
  onBack,
  isLoading,
  onUpdateData,
  school,
  user,
}) => {
  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);
  const [isLoadingLearners, setIsLoadingLearners] = useState<boolean>(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState<boolean>(false);
  const [gradesError, setGradesError] = useState<string | null>(null);

  // Use school.id instead of schoolId prop
  const schoolId = school?.id;

  // -------------------------
  // Validation Hook
  // -------------------------
  const { canProceedToNext, validationErrors } = useStepValidation({
    currentStep,
    selectedGrades,
    learners,
    selectedChannels,
    inviteMessage,
  });

  // -------------------------
  // Fetch Grades - with reload functionality
  // -------------------------
  const fetchGrades = async () => {
    console.log("🔍 Fetching grades for school:", schoolId);

    if (!schoolId) {
      console.log("❌ No schoolId available from school object");
      setGradesError("No school information available");
      return;
    }

    setIsLoadingGrades(true);
    setGradesError(null);

    try {
      const gradesData = await gradeService.getGrades(schoolId);
      console.log("✅ Grades API response:", gradesData);

      const transformedGrades = gradesData.map((grade: any) => ({
        id: grade.id,
        name: grade.name,
        description: grade.description,
        level: parseInt(grade.grade_level?.match(/\d+/)?.[0] || "0"),
        learnerCount: grade.stats?.learners_count || 0,
        isActive: grade.status_text === "active",
      }));

      setGrades(transformedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGradesError("Failed to load grades. Please try again.");
      setGrades([]);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  // Initial load of grades
  useEffect(() => {
    fetchGrades();
  }, [schoolId]);

  // -------------------------
  // Fetch Learners whenever selectedGrades changes
  // -------------------------
  useEffect(() => {
    if (selectedGrades.length === 0) {
      setLearners([]);
      return;
    }

    const fetchLearnersForGrades = async () => {
      setIsLoadingLearners(true);
      try {
        const results: Learner[] = [];
        console.log("🔍 Starting to fetch learners for grades:", selectedGrades);

        for (const gradeId of selectedGrades) {
          console.log(`📋 Fetching learners for grade: ${gradeId}`);
          
          try {
            const res = await fetch(
              `http://localhost:4000/api/v1/grades/${gradeId}/learners?page=1&per_page=100`
            );
            
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            console.log(`✅ API Response for grade ${gradeId}:`, data);
            
            const learnersData = data.data?.learners || [];
            console.log(`👥 Learners found for grade ${gradeId}:`, learnersData.length);

            if (learnersData.length > 0) {
              console.log(`🔍 First learner structure for grade ${gradeId}:`, learnersData[0]);
            }

            const mapped = learnersData.map((l: any) => ({
              ...l,
              first_name: l.first_name || '',
              last_name: l.last_name || '',
              full_name: l.full_name || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unnamed Learner',
              gender: l.gender_text || 'Unknown',
              status: l.status_text || 'Unknown',
              grade_id: gradeId,
              grade_name: grades.find((g) => g.id === gradeId)?.name || "Unknown Grade",
              phone: l.contact?.phone || l.phone || '',
              email: l.email || ''
            }));

            console.log(`📝 Mapped learners for ${gradeId}:`, mapped.slice(0, 3));
            results.push(...mapped);
          } catch (gradeError) {
            console.error(`❌ Error fetching learners for grade ${gradeId}:`, gradeError);
          }
        }

        console.log(`🎯 TOTAL LEARNERS FOUND:`, results.length);
        console.log(`📊 Sample learners:`, results.slice(0, 3));
        setLearners(results);
      } catch (err) {
        console.error("❌ Error in fetch learners process:", err);
        setLearners([]);
      } finally {
        setIsLoadingLearners(false);
      }
    };

    fetchLearnersForGrades();
  }, [selectedGrades, grades]);

  // -------------------------
  // Helper function to get display name
  // -------------------------
  const getDisplayName = (learner: Learner): string => {
    if (learner.full_name && learner.full_name !== 'Unnamed Learner') {
      return learner.full_name;
    }
    
    const firstName = learner.first_name || '';
    const lastName = learner.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || 'Unnamed Learner';
  };

  // -------------------------
  // Helper function to get display gender
  // -------------------------
  const getDisplayGender = (learner: Learner): string => {
    return learner.gender_text || learner.gender || 'Unknown';
  };

  // -------------------------
  // Helper function to get display status
  // -------------------------
  const getDisplayStatus = (learner: Learner): string => {
    return learner.status_text || learner.status || 'Unknown';
  };

  // -------------------------
  // Channel Handlers
  // -------------------------
  const handleChannelSelection = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAllChannels = () => {
    if (selectedChannels.length === CHANNELS.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(CHANNELS.map((channel) => channel.id));
    }
  };

  // -------------------------
  // Grade Handlers
  // -------------------------
  const handleGradeSelection = (gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAllGrades = () => {
    if (selectedGrades.length === grades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(grades.map((g) => g.id));
    }
  };

  const toggleGradeExpansion = (gradeId: string) => {
    setExpandedGrades(prev =>
      prev.includes(gradeId)
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  // -------------------------
  // Reload Grades Handler
  // -------------------------
  const handleReloadGrades = async () => {
    console.log("🔄 Reloading grades...");
    await fetchGrades();
    // Clear selected grades when reloading to avoid stale data
    setSelectedGrades([]);
    setLearners([]);
    setExpandedGrades([]);
  };

  // -------------------------
  // Navigation Handlers
  // -------------------------
  const goNext = () => {
    if (!canProceedToNext) return;

    if (currentStep === "grade-selection" && onUpdateData) {
      const selectedGradeNames = grades
        .filter((g) => selectedGrades.includes(g.id))
        .map((g) => g.name);
      onUpdateData({ invites: selectedGradeNames });
    }

    switch (currentStep) {
      case "grade-selection":
        setCurrentStep("channel-selection");
        break;
      case "channel-selection":
        setCurrentStep("message-composer");
        break;
      case "message-composer":
        setCurrentStep("results");
        if (onNext) onNext();
        break;
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case "channel-selection":
        setCurrentStep("grade-selection");
        break;
      case "message-composer":
        setCurrentStep("channel-selection");
        break;
      case "results":
        setCurrentStep("message-composer");
        break;
      default:
        if (onBack) onBack();
        break;
    }
  };

  // -------------------------
  // Helper function to get channel display names
  // -------------------------
  const getChannelDisplayNames = (): string => {
    if (selectedChannels.length === 0) return "No channels selected";
    if (selectedChannels.length === CHANNELS.length) return "All channels";
    
    return selectedChannels
      .map(channelId => CHANNELS.find(c => c.id === channelId)?.name)
      .filter(Boolean)
      .join(", ");
  };

  // -------------------------
  // Render Steps
  // -------------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case "grade-selection":
        return (
          <div className="space-y-4 mb-8">
            {/* Grades Header with Reload Button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Select Grades to Invite
              </h3>
              <button
                onClick={handleReloadGrades}
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

            {/* Error State */}
            {gradesError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-red-700">
                    <span>❌</span>
                    <span>{gradesError}</span>
                  </div>
                  <button
                    onClick={handleReloadGrades}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoadingGrades && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading grades...</p>
              </div>
            )}

            {/* Grades List */}
            {!isLoadingGrades && grades.length > 0 && (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedGrades.length === grades.length && grades.length > 0
                      }
                      onChange={handleSelectAllGrades}
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
                              onChange={() => handleGradeSelection(grade.id)}
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
                                  onClick={() => toggleGradeExpansion(grade.id)}
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
                        
                        {/* Loading state */}
                        {isLoadingLearners && selectedGrades.includes(grade.id) && (
                          <div className="mt-3 ml-7">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading learners...</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Learners Grid - expandable */}
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
                            
                            {/* Summary for this grade */}
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

            {/* Empty State */}
            {!isLoadingGrades && grades.length === 0 && !gradesError && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <p>No grades available for {school?.name || "this school"}.</p>
                <p className="text-sm mt-2">Please contact your administrator or try reloading.</p>
                <button
                  onClick={handleReloadGrades}
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

      case "channel-selection":
        return (
          <div className="space-y-4 mb-8">
            {/* Select All Channels Option */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.length === CHANNELS.length && CHANNELS.length > 0}
                  onChange={handleSelectAllChannels}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-3 font-medium text-gray-900">
                  Select All Channels ({CHANNELS.length})
                </span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedChannels.length} selected
              </span>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedChannels.includes(channel.id)
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => handleChannelSelection(channel.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          selectedChannels.includes(channel.id)
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {channel.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedChannels.includes(channel.id)}
                            onChange={() => handleChannelSelection(channel.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span
                            className={`ml-2 font-medium ${
                              selectedChannels.includes(channel.id)
                                ? "text-blue-900"
                                : "text-gray-900"
                            }`}
                          >
                            {channel.name}
                          </span>
                        </label>
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          selectedChannels.includes(channel.id)
                            ? "text-blue-700"
                            : "text-gray-500"
                        }`}
                      >
                        {channel.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Channels Summary */}
            {selectedChannels.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">
                  Selected Channels Summary
                </h4>
                <p className="text-green-700">
                  Invitations will be sent via: <strong>{getChannelDisplayNames()}</strong>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  This message will be delivered to {learners.length} learners through {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''}.
                </p>
                
                {/* Channel-specific learner counts */}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-2">
                    Delivery Breakdown:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700">
                    {selectedChannels.includes("email") && (
                      <div className="flex justify-between">
                        <span>📧 Email:</span>
                        <span>{learners.filter(l => l.email).length} learners with email</span>
                      </div>
                    )}
                    {selectedChannels.includes("sms") && (
                      <div className="flex justify-between">
                        <span>💬 SMS:</span>
                        <span>{learners.filter(l => l.phone).length} learners with phone</span>
                      </div>
                    )}
                    {selectedChannels.includes("whatsapp") && (
                      <div className="flex justify-between">
                        <span>💚 WhatsApp:</span>
                        <span>{learners.filter(l => l.phone).length} learners with phone</span>
                      </div>
                    )}
                    {selectedChannels.includes("portal") && (
                      <div className="flex justify-between">
                        <span>🏫 School Portal:</span>
                        <span>All {learners.length} learners</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "message-composer":
        const selectedGradeNames = grades
          .filter((g) => selectedGrades.includes(g.id))
          .map((g) => g.name);

        return (
          <div className="space-y-4 mb-8">
            <label className="block">
              <span className="text-gray-700 font-medium">
                Invitation Message
              </span>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={`Welcome! You've been invited to ${school?.name || "our school"} portal. Your grades: ${selectedGradeNames.join(", ")}.`}
                className="mt-1 block w-full border rounded-md px-3 py-2"
                rows={5}
              />
            </label>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">
                Message Preview
              </h4>
              <p className="text-green-700 mb-3">
                <strong>This message will be sent to:</strong>
              </p>
              <div className="space-y-2 text-sm text-green-600">
                <p>• {learners.length} learners across {selectedGrades.length} grade{selectedGrades.length !== 1 ? 's' : ''}</p>
                <p>• Via {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''}: {getChannelDisplayNames()}</p>
                <p>• Message length: {inviteMessage.length} characters</p>
              </div>
              
              {inviteMessage && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-2">
                    Your Message:
                  </h5>
                  <div className="bg-white p-3 rounded border text-sm text-gray-700">
                    {inviteMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "results":
        const resultGradeNames = grades
          .filter((g) => selectedGrades.includes(g.id))
          .map((g) => g.name);

        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Invites Scheduled!</h3>
            <p className="text-gray-600 mb-4">
              Invitations have been scheduled for learners in the selected grades at {school?.name || "your school"}.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-medium text-gray-900 mb-3">
                Invitation Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><strong>School:</strong> {school?.name || "Unknown"}</p>
                  <p><strong>Grades:</strong> {resultGradeNames.join(", ")}</p>
                  <p><strong>Total Learners:</strong> {learners.length}</p>
                </div>
                <div>
                  <p><strong>Channels:</strong> {getChannelDisplayNames()}</p>
                  <p><strong>Message Length:</strong> {inviteMessage.length} characters</p>
                  <p><strong>Scheduled:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>
              
              {/* Channel-specific delivery summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-2">
                  Delivery Summary:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  {selectedChannels.includes("email") && (
                    <div className="flex justify-between">
                      <span>📧 Email:</span>
                      <span>{learners.filter(l => l.email).length} learners</span>
                    </div>
                  )}
                  {selectedChannels.includes("sms") && (
                    <div className="flex justify-between">
                      <span>💬 SMS:</span>
                      <span>{learners.filter(l => l.phone).length} learners</span>
                    </div>
                  )}
                  {selectedChannels.includes("whatsapp") && (
                    <div className="flex justify-between">
                      <span>💚 WhatsApp:</span>
                      <span>{learners.filter(l => l.phone).length} learners</span>
                    </div>
                  )}
                  {selectedChannels.includes("portal") && (
                    <div className="flex justify-between">
                      <span>🏫 School Portal:</span>
                      <span>All {learners.length} learners</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while checking schoolId
  if (!schoolId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-red-600 p-8">
          <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
          <p>School information is required to load grades.</p>
          <p className="text-sm mt-2">Current school: {school ? JSON.stringify(school) : "Not provided"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Send Learner Invites
        </h2>
        <p className="text-gray-600">
          Invite learners from selected grades to join {school?.name || "your school"} portal
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {["grade-selection", "channel-selection", "message-composer", "results"].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? "bg-blue-600 text-white" 
                  : index < ["grade-selection", "channel-selection", "message-composer", "results"].indexOf(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-8 h-1 ${
                  index < ["grade-selection", "channel-selection", "message-composer", "results"].indexOf(currentStep)
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 space-y-1">
            {validationErrors.map((err, idx) => (
              <div key={idx} className="text-sm">• {err}</div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          disabled={!canProceedToNext || isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "Processing..."
            : currentStep === "message-composer"
            ? "Send Invites →"
            : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default Step3SendInvites;