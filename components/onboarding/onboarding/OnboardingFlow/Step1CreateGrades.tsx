import React, { useState } from "react";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";

const Step1CreateGrades: React.FC = () => {
  const [grades, setGrades] = useState<string[]>([""]);
  const { goToNextStep } = useOnboardingFlow();

  const addGrade = () => setGrades([...grades, ""]);
  const updateGrade = (index: number, value: string) => {
    const updated = [...grades];
    updated[index] = value;
    setGrades(updated);
  };

  return (
    <div>
      <h2>Create Grades</h2>
      {grades.map((g, i) => (
        <input
          key={i}
          value={g}
          onChange={(e) => updateGrade(i, e.target.value)}
          placeholder={`Grade ${i + 1}`}
          style={{ display: "block", marginBottom: "5px" }}
        />
      ))}
      <button onClick={addGrade}>Add Grade</button>
      <button onClick={goToNextStep} style={{ marginLeft: "10px" }}>Next</button>
    </div>
  );
};

export default Step1CreateGrades;
