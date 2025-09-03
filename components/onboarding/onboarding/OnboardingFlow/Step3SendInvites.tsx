import React, { useState } from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import StepLayout from "../layouts/StepLayout";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";

const Step3SendInvites: React.FC = () => {
  const { setStepCompleted } = useOnboardingFlow();
  const [emails, setEmails] = useState<string[]>([""]);

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const addEmailField = () => setEmails([...emails, ""]);

  const handleComplete = () => {
    console.log("Invites sent to:", emails);
    setStepCompleted("Step3SendInvites");
  };

  return (
    <OnboardingLayout title="Send Invites" description="Invite staff to join the school">
      <StepLayout stepTitle="Step 3: Send Invites" stepDescription="Add email addresses of staff to invite.">
        {emails.map((email, idx) => (
          <input
            key={idx}
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(idx, e.target.value)}
            placeholder={`Email ${idx + 1}`}
            className="block w-full px-3 py-2 border rounded mb-2"
          />
        ))}
        <button
          onClick={addEmailField}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
        >
          Add Another Email
        </button>
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Complete Step
        </button>
      </StepLayout>
    </OnboardingLayout>
  );
};

export default Step3SendInvites;
