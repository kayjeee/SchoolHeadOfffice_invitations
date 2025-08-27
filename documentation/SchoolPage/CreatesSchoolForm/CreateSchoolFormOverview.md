Overview of Refactoring Changes
The original CreateSchoolForm component was a monolithic "god component" that handled all concerns, including state, logic, and rendering. This made the code difficult to manage and scale. The refactoring process broke this component down into a more modular and maintainable structure based on modern React best practices.

Key Changes and Their Benefits
Separation of Concerns: The single, large file has been split into multiple, specialized files. This adheres to the Single Responsibility Principle, where each component or module has a single, well-defined purpose.

Old: One component for everything.

New:

index.js: A clean container that manages the flow of the stepper. It's now "dumb" and purely responsible for rendering the correct step.

steps/: Individual, presentational components for each step (Step1BasicInfo, etc.). They focus only on UI rendering and receive all data and handlers via props.

hooks/useSchoolForm.js: A custom hook that encapsulates all form logic and state. This is the "brain" of the form, holding all useState variables, navigation logic, and the submission handler. This makes the logic reusable and keeps the UI components clean.

services/schoolService.js: A dedicated service layer for all API calls (Cloudinary, backend, Auth0). This isolates the data-fetching logic, making it easier to test and swap out services.

utils/validators.js: A utility file for all validation logic. Centralizing validation prevents duplication and makes rules easier to find and update.

Improved Readability: The code is no longer a long, intimidating file. Developers can quickly navigate to the specific file they need to work on, such as a particular form step or an API service.

Enhanced Maintainability: Bugs are now easier to locate and fix because logic is confined to smaller, more predictable files. Changes to the UI of a single step won't affect the form's core logic, and vice versa.

Increased Scalability: Adding new steps or features is straightforward. You only need to create a new step component and update the useSchoolForm hook and the main container to handle the new step. This architecture is designed to grow with the application.

In short, the codebase has transitioned from a tightly coupled, single-file design to a loosely coupled, modular architecture that is more robust and easier for a development team to work with.

components/
 ├── schoolpage/
 │    ├── CreateSchoolForm/
 │    │    ├── index.js                # Main stepper container (clean)
 │    │    ├── steps/
 │    │    │    ├── Step1BasicInfo.js  # School name, email, logo, theme
 │    │    │    ├── Step2Address.js    # Address, location, map
 │    │    │    ├── Step3Admins.js     # Admin users form
 │    │    │    ├── Step4Social.js     # Social media + submission
 │    │    ├── hooks/
 │    │    │    └── useSchoolForm.js   # All form state + navigation logic
 │    │    ├── services/
 │    │    │    └── schoolService.js   # API calls: createSchool, assignRole, syncRole
 │    │    ├── utils/
 │    │    │    └── validators.js      # Validation for steps
 │    │    └── FormNavigation.js       # Next/Prev buttons
 │    │
 │    └── Marker.js
 │    └── FileUpload.js
 │    └── FormComponent.js
 │    └── LoadingSpinner.js

Refactored index.js (Container)
import React from "react";
import { useSchoolForm } from "./hooks/useSchoolForm";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Address from "./steps/Step2Address";
import Step3Admins from "./steps/Step3Admins";
import Step4Social from "./steps/Step4Social";
import FormNavigation from "./FormNavigation";
import LoadingSpinner from "../LoadingSpinner";

const CreateSchoolForm = ({ user }) => {
  const { step, loading, formData, setFormData, handleNext, handlePrev, handleSubmit } =
    useSchoolForm(user);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Address formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Admins formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4Social formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
      <h1 className="text-2xl font-bold mb-4">Create a School</h1>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {renderStep()}
          <FormNavigation
            step={step}
            onNext={handleNext}
            onPrev={handlePrev}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
};

export default CreateSchoolForm;

🪝 Example Hook useSchoolForm.js
import { useState, useEffect } from "react";
import { createSchool, assignUserRole, syncUserRole, addSchoolToUser } from "../services/schoolService";
import { validateStep } from "../utils/validators";

export const useSchoolForm = (user) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "",
    schoolEmail: "",
    theme: "#20B486",
    addressLine1: "",
    addressLine2: "",
    country: "",
    province: "",
    city: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    admins: [
      { name: "", email: "" },
      { name: "", email: "" },
    ],
    website: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
    logoFile: null,
  });

  const handleNext = () => {
    if (!validateStep(step, formData)) return;
    setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const school = await createSchool(formData, user);
      await assignUserRole(user);
      await syncUserRole(user);
      await addSchoolToUser(user, school._id);
      alert("School created successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { step, loading, formData, setFormData, handleNext, handlePrev, handleSubmit };
};

🛠 Example Service schoolService.js
export const createSchool = async (formData, user) => {
  const response = await fetch("http://localhost:4000/api/v1/schools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...formData, user_id: user.sub, user_email: user.email }),
  });

  if (!response.ok) throw new Error("Failed to create school");
  const data = await response.json();
  return data.data.school;
};

export const assignUserRole = async (user) => {
  // Auth0 API call
};

export const syncUserRole = async (user) => {
  // Backend PATCH call
};

export const addSchoolToUser = async (user, schoolId) => {
  const res = await fetch(`http://localhost:4000/api/v1/users/${user.sub}/add_school`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId }),
  });
  if (!res.ok) throw new Error("Failed to add school to user");
};

✅ Benefits of this Refactor

CreateSchoolForm/index.js is now clean — just a stepper.

Each step component is small, reusable, testable.

Services layer isolates API calls from UI.

Hook centralizes form state and navigation logic.

Easy for a junior developer to add/edit a step without breaking others.