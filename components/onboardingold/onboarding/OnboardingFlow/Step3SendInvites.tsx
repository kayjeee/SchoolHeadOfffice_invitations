import React, { useState } from "react";

interface Step3SendInvitesProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: { invites: string[] }) => void;
}

const Step3SendInvites: React.FC<Step3SendInvitesProps> = ({ onNext, onBack, isLoading, onUpdateData }) => {
  const [emails, setEmails] = useState<string[]>([""]);

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const addEmailField = () => setEmails([...emails, ""]);

  const handleComplete = () => {
    if (onUpdateData) {
      onUpdateData({ invites: emails.filter(email => email.trim() !== "") });
    }
    if (onNext) {
      onNext();
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
        <p className="text-gray-600">Invite your teachers and staff to join {`your school's`} portal</p>
      </div>

      {/* Email Input Section */}
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
          onClick={addEmailField}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          + Add Another Email
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleComplete}
          disabled={emails.filter(e => e.trim() !== "").length === 0 || isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Sending..." : "Finish →"}
        </button>
      </div>
    </div>
  );
};

export default Step3SendInvites;
