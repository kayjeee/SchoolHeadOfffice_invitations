import React, { useState, useEffect } from "react";
import { StepState } from "./types";
import {  Grade, Learner } from "./types"; // NEW: Adjusted import path
import { useStepValidation } from "./hooks/useStepValidation";
import { useLearnerData } from "./hooks/useLearnerData";
import { LearnerSelection } from "./components/LearnerSelection";
import { ChannelSelection } from "./components/ChannelSelection/ChannelSelection";
import { MessageComposer } from "./components/MessageComposer";
import { InviteResults } from "./components/InviteResults";
import { learnerService } from "./services/learnerService";

interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
  school: any;
  user: any;
  schools: any[]; // NEW: Add schools prop
}

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
  schools, // NEW: Receive schools prop
}) => {
  console.log("🏫 [Step3SendInvites] Component mounted");
  console.log("📦 [Step3SendInvites] Props received:", {
    user: user ? { id: user._id || user.id, sub: user.sub } : 'No user',
    school: school,
    schools: schools, // NEW: Log schools prop
    schoolsCount: schools?.length || 0,
    hasOnNext: typeof onNext === 'function',
    hasOnBack: typeof onBack === 'function',
    isLoading: isLoading,
    hasOnUpdateData: typeof onUpdateData === 'function'
  });

  // Heavy schools prop logging
  console.log("🔍 [Step3SendInvites] SCHOOLS PROP DEEP ANALYSIS:");
  console.log("🏫 [Step3SendInvites] schools value:", schools);
  console.log("🏫 [Step3SendInvites] schools type:", typeof schools);
  console.log("🏫 [Step3SendInvites] Array.isArray(schools):", Array.isArray(schools));
  console.log("🏫 [Step3SendInvites] schools === null:", schools === null);
  console.log("🏫 [Step3SendInvites] schools === undefined:", schools === undefined);
  
  if (schools && Array.isArray(schools)) {
    console.log("📊 [Step3SendInvites] SCHOOLS ARRAY DETAILS:");
    schools.forEach((schoolItem, index) => {
      console.log(`🏫 School [${index}]:`, {
        id: schoolItem?.id || schoolItem?._id || 'No ID',
        name: schoolItem?.schoolName || schoolItem?.name || 'No name',
        email: schoolItem?.schoolEmail || schoolItem?.email,
        city: schoolItem?.city,
        country: schoolItem?.country,
        type: typeof schoolItem,
        keys: schoolItem ? Object.keys(schoolItem) : 'No school object'
      });
    });
    
    if (schools.length > 0) {
      const primarySchool = schools[0];
      console.log("🎯 [Step3SendInvites] PRIMARY SCHOOL (schools[0]):", {
        id: primarySchool?.id || primarySchool?._id,
        name: primarySchool?.schoolName || primarySchool?.name,
        fullObject: primarySchool
      });
    }
  } else {
    console.warn("⚠️ [Step3SendInvites] NO SCHOOLS ARRAY or invalid schools prop");
  }

  // Compare school prop vs schools[0]
  console.log("🔁 [Step3SendInvites] COMPARISON - school prop vs schools[0]:", {
    schoolProp: school,
    schoolsFirst: schools?.[0],
    areEqual: school === schools?.[0],
    bothHaveSameId: school?.id === schools?.[0]?.id,
    schoolPropName: school?.schoolName || school?.name,
    schoolsFirstName: schools?.[0]?.schoolName || schools?.[0]?.name
  });

  // Determine which school to use for operations
  const targetSchool = school || schools?.[0];
  const schoolName = targetSchool?.schoolName || targetSchool?.name || "your school";
  const schoolId = targetSchool?.id || targetSchool?._id;

  console.log("🎯 [Step3SendInvites] TARGET SCHOOL FOR OPERATIONS:", {
    targetSchool: targetSchool,
    schoolName: schoolName,
    schoolId: schoolId,
    source: school ? 'school prop' : 'schools[0]'
  });

  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string>("");

  const {
    grades,
    learners,
    isLoadingGrades,
    isLoadingLearners,
    gradesError,
    expandedGrades,
    setExpandedGrades,
    fetchGrades,
  } = useLearnerData(schoolId);

  const { canProceedToNext, validationErrors } = useStepValidation({
    currentStep,
    selectedGrades,
    learners,
    selectedChannels,
    inviteMessage,
  });

  console.log("📊 [Step3SendInvites] Component state:", {
    currentStep: currentStep,
    selectedGradesCount: selectedGrades.length,
    selectedChannelsCount: selectedChannels.length,
    inviteMessageLength: inviteMessage.length,
    gradesCount: grades.length,
    learnersCount: learners.length,
    schoolName: schoolName,
    schoolId: schoolId
  });

  const handleGradeSelection = (gradeId: string) => {
    console.log("🎯 [Step3SendInvites] handleGradeSelection called:", gradeId);
    console.log("🏫 [Step3SendInvites] School context:", { schoolName, schoolId });
    
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSelectAllGrades = () => {
    console.log("🎯 [Step3SendInvites] handleSelectAllGrades called");
    console.log("🏫 [Step3SendInvites] School context:", { schoolName, schoolId });
    
    if (selectedGrades.length === grades.length) {
      console.log("📭 [Step3SendInvites] Deselecting all grades");
      setSelectedGrades([]);
    } else {
      console.log("✅ [Step3SendInvites] Selecting all grades:", grades.length);
      setSelectedGrades(grades.map((g) => g.id));
    }
  };

  const toggleGradeExpansion = (gradeId: string) => {
    console.log("🎯 [Step3SendInvites] toggleGradeExpansion called:", gradeId);
    setExpandedGrades(prev =>
      prev.includes(gradeId)
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleReloadGrades = async () => {
    console.log("🔄 [Step3SendInvites] handleReloadGrades called");
    console.log("🏫 [Step3SendInvites] School context:", { schoolName, schoolId });
    
    await fetchGrades();
    setSelectedGrades([]);
    setExpandedGrades([]);
  };

  const handleChannelSelection = (channelId: string) => {
    console.log("🎯 [Step3SendInvites] handleChannelSelection called:", channelId);
    console.log("🏫 [Step3SendInvites] School context:", { schoolName, schoolId });
    
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSelectAllChannels = () => {
    console.log("🎯 [Step3SendInvites] handleSelectAllChannels called");
    console.log("🏫 [Step3SendInvites] School context:", { schoolName, schoolId });
    
    if (selectedChannels.length === CHANNELS.length) {
      console.log("📭 [Step3SendInvites] Deselecting all channels");
      setSelectedChannels([]);
    } else {
      console.log("✅ [Step3SendInvites] Selecting all channels");
      setSelectedChannels(CHANNELS.map((channel) => channel.id));
    }
  };

  const goNext = () => {
    console.log("➡️ [Step3SendInvites] goNext called, current step:", currentStep);
    console.log("🏫 [Step3SendInvites] School context:", { schoolName, schoolId });
    
    if (!canProceedToNext) {
      console.log("❌ [Step3SendInvites] Cannot proceed - validation failed");
      return;
    }

    if (currentStep === "grade-selection" && onUpdateData) {
      const selectedGradeNames = grades
        .filter((g) => selectedGrades.includes(g.id))
        .map((g) => g.name);
      console.log("📝 [Step3SendInvites] Calling onUpdateData with:", selectedGradeNames);
      onUpdateData({ invites: selectedGradeNames });
    }

    switch (currentStep) {
      case "grade-selection":
        console.log("🔄 [Step3SendInvites] Moving to channel-selection");
        setCurrentStep("channel-selection");
        break;
      case "channel-selection":
        console.log("🔄 [Step3SendInvites] Moving to message-composer");
        setCurrentStep("message-composer");
        break;
      case "message-composer":
        console.log("🔄 [Step3SendInvites] Moving to results");
        setCurrentStep("results");
        if (onNext) onNext();
        break;
    }
  };

  const goBack = () => {
    console.log("⬅️ [Step3SendInvites] goBack called, current step:", currentStep);
    
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

  const renderStepContent = () => {
    console.log("🎨 [Step3SendInvites] Rendering step content:", currentStep);
    
    switch (currentStep) {
      case "grade-selection":
        return (
          <LearnerSelection
            grades={grades}
            selectedGrades={selectedGrades}
            learners={learners}
            isLoadingGrades={isLoadingGrades}
            isLoadingLearners={isLoadingLearners}
            gradesError={gradesError}
            expandedGrades={expandedGrades}
            onGradeSelection={handleGradeSelection}
            onSelectAllGrades={handleSelectAllGrades}
            onToggleGradeExpansion={toggleGradeExpansion}
            onReloadGrades={handleReloadGrades}
            
          />
        );
     case "channel-selection":
  return (
    <ChannelSelection
      channels={CHANNELS}
      selectedChannels={selectedChannels}
      learners={learners}
      selectedGrades={grades.filter(grade => selectedGrades.includes(grade.id))} // NEW: Pass selected grades
      onChannelSelection={handleChannelSelection}
      onSelectAllChannels={handleSelectAllChannels}
      schoolName={schoolName}
      schools={schools}
      school={targetSchool}
    />
  );
      case "message-composer":
        return (
          <MessageComposer
            inviteMessage={inviteMessage}
            setInviteMessage={setInviteMessage}
            validationErrors={validationErrors}
            channels={selectedChannels} // Pass selected channels
            schoolName={schoolName} // Pass school name
          />
        );
      case "results":
        return (
          <InviteResults 
            selectedChannels={selectedChannels} 
            learners={learners} 
            inviteMessage={inviteMessage}
            schools={schools} // Pass schools array
            school={targetSchool} // Pass the actual school object
          />
        );
      default:
        return null;
    }
  };

  console.log("🎨 [Step3SendInvites] Rendering main component");

  return (
    <div className="space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Send Invites</h2>
        <p className="text-gray-600 mt-2">
          Send invitations for <span className="font-medium text-gray-800">{schoolName}</span>
        </p>
        {/* Debug info - remove in production */}
        <div className="mt-2 text-xs text-gray-400">
          School: {schoolName} | ID: {schoolId} | Schools: {schools?.length || 0}
        </div>
      </div>

      {renderStepContent()}

      <div className="flex justify-between mt-8">
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