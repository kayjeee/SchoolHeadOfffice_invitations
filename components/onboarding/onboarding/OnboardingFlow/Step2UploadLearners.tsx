import React, { useState } from "react";
import OnboardingLayout from "../layouts/OnboardingLayout";
import StepLayout from "../layouts/StepLayout";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";

const Step2UploadLearners: React.FC = () => {
  const { setStepCompleted } = useOnboardingFlow();
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleComplete = () => {
    console.log("Uploaded learners file:", fileName);
    setStepCompleted("Step2UploadLearners");
  };

  return (
    <OnboardingLayout title="Upload Learners" description="Upload the learners for your school">
      <StepLayout stepTitle="Step 2: Upload Learners" stepDescription="Upload a CSV file with learner information.">
        <input type="file" onChange={handleFileUpload} className="mb-2" />
        {fileName && <p>Selected file: {fileName}</p>}
        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-green-500 text-white rounded mt-2"
        >
          Complete Step
        </button>
      </StepLayout>
    </OnboardingLayout>
  );
};

export default Step2UploadLearners;
