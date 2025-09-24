import React, { useState } from "react";
import { useStepValidationEmails, StepState } from "../hooks/useStepValidationEmails";

interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
}

const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({
  onNext,
  onBack,
  isLoading,
  onUpdateData,
}) => {
  const [currentStep, setCurrentStep] = useState<StepState>("grade-selection");
  const [emails, setEmails] = useState<string[]>([""]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>("");

  // -------------------------
  // Step Validation Hook
  // -------------------------
  const { canProceedToNext, validationErrors } = useStepValidationEmails({
    currentStep,
    emails,
    selectedChannel,
    inviteMessage,
  });

  // -------------------------
  // Handlers
  // -------------------------
  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const addEmailField = () => setEmails([...emails, ""]);

  const goNext = () => {
    if (!canProceedToNext) return;

    // Save valid emails when finishing message step
    if (currentStep === "message-composer" && onUpdateData) {
      onUpdateData({ invites: emails.filter((e) => e.trim() !== "") });
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
        if (onBack) onBack();
        break;
    }
  };

  // -------------------------
  // Render Steps
  // -------------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case "grade-selection":
        return (
          <div className="space-y-3 mb-8">
            {emails.map((email, idx) => (
              <input
                key={idx}
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(idx, e.target.value)}
                placeholder={`Staff Email ${idx + 1}`}
                className="block w-full px-4 py-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ))}
            <button
              type="button"
              onClick={addEmailField}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              + Add Another Email
            </button>
          </div>
        );
      case "channel-selection":
        return (
          <div className="space-y-3 mb-8">
            <label className="block">
              <span className="text-gray-700 font-medium">Select Channel</span>
              <select
                value={selectedChannel ?? ""}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="mt-1 block w-full border rounded-md px-3 py-2"
              >
                <option value="">Select...</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </label>
          </div>
        );
      case "message-composer":
        return (
          <div className="space-y-3 mb-8">
            <label className="block">
              <span className="text-gray-700 font-medium">Message</span>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Type your invite message..."
                className="mt-1 block w-full border rounded-md px-3 py-2"
                rows={5}
              />
            </label>
          </div>
        );
      case "results":
        return (
          <div className="text-center py-6">
            <h3 className="text-xl font-semibold mb-2">Invites Sent!</h3>
            <p className="text-gray-600">
              Your staff invites have been successfully sent.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Staff Invites</h2>
        <p className="text-gray-600">
          Invite your teachers and staff to join {`your school's`} portal
        </p>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 text-red-600 space-y-1">
          {validationErrors.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
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
            ? "Sending..."
            : currentStep === "message-composer"
            ? "Finish →"
            : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default Step3SendInvites;