import React, { useState, useEffect, useCallback } from "react";
import { StepState, Grade, Learner } from "./types";
import { useStepValidation } from "./hooks/useStepValidation";
import { LearnerSelection } from "./components/LearnerSelection";
import { ChannelSelection } from "./components/ChannelSelection/ChannelSelection";
import { MessageComposer } from "./components/MessageComposer";
import { InviteResults } from "./components/InviteResults";
import { getLearnersBySchool } from "./services/learnerService";
import { getGrades } from "./services/gradeService";

interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
  school: any;
  user: any;
  schools: any[];
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
  schools,
}) => {
  const targetSchool = school || schools?.[0];
  const schoolName = targetSchool?.schoolName || targetSchool?.name || "your school";
  const schoolId = targetSchool?.id || targetSchool?._id;

  console.log("🏫 [Step3SendInvites] Component mounted");
  console.log("📦 [Step3SendInvites] Props received:", {
    user: user ? { id: user._id || user.id, sub: user.sub } : 'No user',
    school: school,
    schools: schools,
    schoolsCount: schools?.length || 0,
    hasOnNext: typeof onNext === 'function',
    hasOnBack: typeof onBack === 'function',
    isLoading: isLoading,
    hasOnUpdateData: typeof onUpdateData === 'function'
  });

  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingLearners, setIsLoadingLearners] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);

  const { canProceedToNext, validationErrors } = useStepValidation({
    currentStep,
    selectedGrades,
    learners,
    selectedChannels,
    inviteMessage,
  });

  const fetchGradesAndLearners = useCallback(async () => {
    if (!schoolId) {
      console.warn("❌ Missing schoolId: cannot fetch data");
      setGradesError("Missing school information");
      return;
    }

    console.log("📚 Fetching grades and learners for school:", schoolId);
    setIsLoadingGrades(true);
    setIsLoadingLearners(true);
    setGradesError(null);

    try {
      const gradesData = await getGrades(schoolId);
      console.log("✅ Grades fetched:", gradesData);
      const formattedGrades: Grade[] = gradesData.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        level: parseInt(g.grade_level?.match(/\d+/)?.[0] || "0"),
        learnerCount: g.stats?.learners_count || 0,
        isActive: g.status_text === "active",
      }));
      setGrades(formattedGrades);

      const learnersData = await getLearnersBySchool(schoolId);
      console.log("✅ Learners fetched:", learnersData);
      setLearners(learnersData);

    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setGradesError("Failed to load school data.");
      setGrades([]);
      setLearners([]);
    } finally {
      setIsLoadingGrades(false);
      setIsLoadingLearners(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchGradesAndLearners();
  }, [fetchGradesAndLearners]);

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
        : [gradeId] // Only allow one grade to be expanded at a time
    );
  };

  const handleReloadGrades = async () => {
    await fetchGradesAndLearners();
    setSelectedGrades([]);
    setExpandedGrades([]);
  };

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

  const goNext = () => {
    if (!canProceedToNext) {
      return;
    }

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

  const renderStepContent = () => {
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
            learners={learners.filter(l => selectedGrades.includes(l.grade_id))}
            selectedGrades={grades.filter(grade => selectedGrades.includes(grade.id))}
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
            channels={selectedChannels}
            schoolName={schoolName}
          />
        );
      case "results":
        return (
          <InviteResults
            selectedChannels={selectedChannels}
            learners={learners.filter(l => selectedGrades.includes(l.grade_id))}
            inviteMessage={inviteMessage}
            schools={schools}
            school={targetSchool}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Send Invites</h2>
        <p className="text-gray-600 mt-2">
          Send invitations for <span className="font-medium text-gray-800">{schoolName}</span>
        </p>
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
