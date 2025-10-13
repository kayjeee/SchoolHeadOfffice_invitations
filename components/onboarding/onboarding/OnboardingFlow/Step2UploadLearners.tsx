// components/onboarding/OnboardingFlow/Step2UploadLearners.tsx
import React, { useState, useEffect } from "react";
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';

import BulkUpload from "../components/BulkUpload/";

import { completeStep, getOnboardingStatus } from "../services/onboardingService";



interface Step2UploadLearnersProps {
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  onUpdateData?: (data: Record<string, any>) => void;
  school: any;
  user: any;
  schools?: any[]; // optional, sometimes missing
}

const Step2UploadLearners: React.FC<Step2UploadLearnersProps> = ({
  onNext,
  onBack,
  isLoading,
  onUpdateData,
  school,
  user,
  schools,
}) => {
  console.log("🏫 [Step2UploadLearners] Component mounted");

  // ✅ Safe fallback for schools
  const safeSchools = schools || (school ? [school] : []);

  console.log("📦 [Step2UploadLearners] Props received:", {
    user: user ? { id: user._id || user.id, sub: user.sub } : "No user",
    school,
    schools,
    safeSchools,
    schoolsCount: safeSchools.length,
  });

  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<any | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const { updateOnboardingData } = useOnboardingFlow();

  // Fetch grades
  useEffect(() => {
    const fetchGrades = async () => {
      const targetSchoolId = school?.id || school?._id;
      if (!targetSchoolId) {
        setGradeError("No school selected");
        setIsLoadingGrades(false);
        return;
      }

      try {
        setIsLoadingGrades(true);
        const token = localStorage.getItem("authToken");

        const response = await fetch(
          `https://3ddf3987485e.ngrok-free.app/api/v1/schools/${targetSchoolId}/grades`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const gradesData = await response.json();
          setGrades(gradesData.data?.grades || []);
        } else {
          setGradeError("Failed to load grades. Please try again.");
        }
      } catch (error: any) {
        setGradeError("Network error. Please check your connection.");
      } finally {
        setIsLoadingGrades(false);
      }
    };

    fetchGrades();
  }, [school]);

  // Refetch onboarding status
  const fetchOnboardingStatus = async () => {
    if (!user?._id) return null;
    try {
      const status = await getOnboardingStatus(user._id);
      updateOnboardingData?.({ onboardingStatus: status });
      return status;
    } catch (err) {
      console.error("❌ Failed to fetch onboarding status:", err);
      return null;
    }
  };

  // Upload success
  // In Step2UploadLearners.tsx, fix the handleUploadSuccess function:

const handleUploadSuccess = (result) => {
  console.log("🎉 [Step2UploadLearners] handleUploadSuccess called with result:", result);
  console.log("🏫 [Step2UploadLearners] School context in upload success:", {
    schoolId: school?.id || school?._id,
    schoolName: school?.name,
    selectedGrade: selectedGrade
  });

  // FIX: Use the correct user ID - use user.sub (Auth0 ID) instead of user._id
  const userId = user?.sub || user?.auth0_id || user?._id;
  
  if (!userId) {
    console.error("❌ [Step2UploadLearners] User ID is undefined - cannot complete step");
    console.log("👤 [Step2UploadLearners] Available user data:", {
      user: user,
      sub: user?.sub,
      auth0_id: user?.auth0_id,
      _id: user?._id,
      id: user?.id
    });
    setIsBulkUploadOpen(false);
    if (onNext) {
      onNext();
    }
    return;
  }

  if (onUpdateData) {
    console.log("📝 [Step2UploadLearners] Calling onUpdateData with upload results");
    onUpdateData({
      learnersUploaded: true,
      uploadResults: result,
      uploadedGrade: selectedGrade,
    });
  }

  setIsBulkUploadOpen(false);

  console.log("🎯 [Step2UploadLearners] Calling completeStep API with user ID:", userId);
  completeStep(userId, "upload_learners", {
    learnersCount: result.inserted || 0,
    grade: selectedGrade?.name,
    schoolId: school?.id || school?._id,
    schoolName: school?.name
  })
    .then(() => {
      console.log("✅ [Step2UploadLearners] Step 2 completed successfully");
      if (onNext) {
        console.log("➡️ [Step2UploadLearners] Calling onNext");
        onNext();
      }
    })
    .catch((error) => {
      console.error("❌ [Step2UploadLearners] Failed to complete step:", error);
      if (onNext) {
        console.log("➡️ [Step2UploadLearners] Calling onNext despite error");
        onNext();
      }
    });
};

  const downloadTemplate = () => {
    const csvContent =
      "First Name,Last Name,Gender,Phone Number,Tel Number (H)ome,Tel Number (E)mergency,WhatsApp,Telegram,Student ID\n" +
      "John,Smith,Male,+27123456789,+27112223333,+27114445555,+27123456789,@johnsmith,12345\n" +
      "Sarah,Johnson,Female,+27129876543,+27113334444,+27117778888,+27129876543,@sarahjohnson,67890";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learners_upload_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGradeSelection = (grade: any) => {
    setSelectedGrade(grade);
    setIsBulkUploadOpen(true);
  };

  if (isLoadingGrades) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grades...</p>
        </div>
      </div>
    );
  }

  if (gradeError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Unable to Load Grades
          </h2>
          <p className="text-gray-600 mb-6">{gradeError}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Grades Available
          </h2>
          <p className="text-gray-600 mb-6">
            You need to create grades before uploading learners.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Go Back to Create Grades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Upload Learners to Grades
        </h2>
        <p className="text-gray-600">
          Select a grade and upload learners for{" "}
          <span className="font-medium">{school?.name || "your school"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className={`border rounded-lg p-5 cursor-pointer ${
              selectedGrade?.id === grade.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
            }`}
            onClick={() => handleGradeSelection(grade)}
          >
            <h3 className="font-semibold text-gray-800">{grade.name}</h3>
            <p className="text-sm text-gray-600">{grade.grade_level}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-gray-800 mb-2">Need the template?</h3>
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          ⬇️ Download CSV Template
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={isLoading || !selectedGrade}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Continue →"}
        </button>
      </div>

      {/* ✅ Bulk Upload with safeSchools fallback */}
      <BulkUpload
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        selectedGrade={selectedGrade}
        onUploadSuccess={handleUploadSuccess}
        schools={safeSchools}
        refetchOnboardingStatus={fetchOnboardingStatus}
        user={user}
      />
    </div>
  );
};

export default Step2UploadLearners;
