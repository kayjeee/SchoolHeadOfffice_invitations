import React, { useState, useEffect, useCallback } from "react";
import { StepState, Grade, Learner } from "./types";
import { useStepValidation } from "./hooks/useStepValidation";
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
  schools: any[];
}

const CHANNELS = [
  { id: "email", name: "Email", icon: "📧" },
  { id: "sms", name: "SMS", icon: "💬" },
  { id: "whatsapp", name: "WhatsApp", icon: "💚" },
  { id: "portal", name: "School Portal", icon: "🏫" },
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
  const targetSchool = school || schools?.[0] || {};
  const schoolName = targetSchool?.schoolName || "your school";
  const schoolId = targetSchool?._id || targetSchool?.id;

  // --- States ---
  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingLearners, setIsLoadingLearners] = useState(false);

  const { canProceedToNext, validationErrors } = useStepValidation({
    currentStep,
    selectedGrades,
    learners,
    selectedChannels,
    inviteMessage,
  });

  // --- Load Grades (example placeholder) ---
  useEffect(() => {
    const loadGrades = async () => {
      setIsLoadingGrades(true);
      try {
        // TODO: Replace dummyGrades with API call to fetch school grades
        const dummyGrades: Grade[] = [
          { id: "grade1", name: "Grade 1" },
          { id: "grade2", name: "Grade 2" },
        ];
        setGrades(dummyGrades);
      } catch (error) {
        console.error("Error loading grades:", error);
        setGrades([]);
      } finally {
        setIsLoadingGrades(false);
      }
    };
    loadGrades();
  }, []);

  // --- Fetch learners when grades are selected ---
  const fetchLearners = useCallback(async () => {
    if (!selectedGrades?.length) {
      setLearners([]);
      return;
    }

    setIsLoadingLearners(true);
    try {
      const allLearners: Learner[] = [];
      for (const gradeId of selectedGrades) {
        const learnersByGrade = await learnerService.getLearnersByGrade(gradeId);
        if (Array.isArray(learnersByGrade)) {
          allLearners.push(...learnersByGrade);
        }
      }
      setLearners(allLearners);
    } catch (error) {
      console.error("Error fetching learners:", error);
      setLearners([]);
    } finally {
      setIsLoadingLearners(false);
    }
  }, [selectedGrades]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  // --- Navigation ---
  const goNext = () => {
    if (!canProceedToNext) return;

    switch (currentStep) {
      case "grade-selection":
        setCurrentStep("channel-selection");
        break;
      case "channel-selection":
        setCurrentStep("message-composer");
        break;
      case "message-composer":
        setCurrentStep("results");
        onNext?.();
        break;
      default:
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
        onBack?.();
    }
  };

  // --- Step Renderer ---
  const renderStepContent = () => {
    switch (currentStep) {
      case "grade-selection":
        return (
          <LearnerSelection
            grades={grades || []}
            selectedGrades={selectedGrades || []}
            learners={learners || []}
            isLoadingGrades={isLoadingGrades}
            isLoadingLearners={isLoadingLearners}
            onGradeSelection={(gradeId) => {
              setSelectedGrades((prev) =>
                prev.includes(gradeId)
                  ? prev.filter((id) => id !== gradeId)
                  : [...prev, gradeId]
              );
            }}
          />
        );

      case "channel-selection":
        return (
          <ChannelSelection
            channels={CHANNELS}
            selectedChannels={selectedChannels || []}
            learners={learners || []}
            selectedGrades={grades.filter((g) =>
              selectedGrades.includes(g.id)
            )}
            onChannelSelection={(id) =>
              setSelectedChannels((prev) =>
                prev.includes(id)
                  ? prev.filter((c) => c !== id)
                  : [...prev, id]
              )
            }
            schoolName={schoolName}
            schools={schools || []}
            school={targetSchool}
          />
        );

      case "message-composer":
        return (
          <MessageComposer
            inviteMessage={inviteMessage}
            setInviteMessage={setInviteMessage}
            validationErrors={validationErrors || []}
            channels={selectedChannels || []}
            schoolName={schoolName}
          />
        );

      case "results":
        return (
          <InviteResults
            selectedChannels={selectedChannels || []}
            learners={learners || []}
            inviteMessage={inviteMessage}
            schools={schools || []}
            school={targetSchool}
          />
        );

      default:
        return null;
    }
  };

  // --- UI ---
  return (
    <div className="space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Send Invites</h2>
        <p className="text-gray-600 mt-2">
          Send invitations for{" "}
          <span className="font-medium">{schoolName}</span>
        </p>
      </div>

      {renderStepContent()}

      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          disabled={!canProceedToNext || isLoading}
          className={`px-6 py-2 rounded-md text-white ${
            canProceedToNext ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
          }`}
        >
          {currentStep === "message-composer" ? "Send Invites →" : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default Step3SendInvites;
