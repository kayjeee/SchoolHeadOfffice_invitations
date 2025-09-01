import { useState, useEffect } from "react";
import {
  getAccessToken,
  uploadFileToCloudinary,
  createSchool,
  assignAuth0Role,
  syncBackendRole,
  addSchoolToUser,
} from "../services/schoolService";
import { validateStep1, validateStep2 } from "../utils/validators";

console.log("🧠 useSchoolForm.js hook loaded");

const useSchoolForm = (user) => {
  // ==================== STATE ====================
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolEmail: "",
    theme: "#20B486",
    file: null,

    // Address
    schoolAddressLine1: "",
    schoolAddressLine2: "",
    country: "",
    province: "",
    city: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    selectedLocation: null,

    // Admin Users
    admins: [
      { name: "", email: "" },
      { name: "", email: "" },
    ],

    // Staff Invites (NEW step 4)
    invites: [],

    // Social
    website: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    console.log("🌍 Geolocation effect triggered");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("✅ Geolocation retrieved:", coords);
          setCurrentLocation(coords);
          setFormData((prev) => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng,
          }));
        },
        (err) => {
          console.error("❌ Geolocation error:", err.message);
          setError("Geolocation not available. Please select your location on the map.");
        }
      );
    } else {
      console.warn("⚠️ Geolocation is not supported by this browser");
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  // ==================== HANDLERS ====================
  const handleNextStep = () => {
    console.log(`➡️ Attempting to move from step ${step} to step ${step + 1}`);
    setError(null);

    let isValid = true;
    switch (step) {
      case 1:
        isValid = validateStep1(formData);
        break;
      case 2:
        isValid = validateStep2(formData);
        break;
      // Add validateStep3, validateStep4 if needed
      default:
        break;
    }

    if (!isValid) {
      alert("Please fill in all required fields to proceed.");
      return;
    }

    setStep((s) => s + 1);
  };

  const handlePreviousStep = () => {
    setStep((s) => Math.max(1, s - 1));
    setError(null);
  };

  const handleFormSubmission = async () => {
    console.log("🚀 Starting form submission process...");
    setLoading(true);
    setError(null);

    try {
      // 1. Upload logo to Cloudinary (if file exists)
      let cloudinaryImageUrl = null;
      if (formData.file) {
        cloudinaryImageUrl = await uploadFileToCloudinary(formData.file);
      }

      // 2. Prepare payload
      const schoolPayload = {
        ...formData,
        logo: cloudinaryImageUrl,
        user_id: user?.sub,
        user_email: user?.email,
        school_created_by: user?.email,
      };

      // 3. Create school record
      const schoolCreationResponse = await createSchool(schoolPayload);
      const schoolId = schoolCreationResponse.schoolId;

      // 4. Auth0 + backend role assignment
      const accessToken = await getAccessToken();
      const userId = user?.sub;

      await assignAuth0Role(userId, accessToken, ["rol_a6KrxwaZ1CguNPXS"]);
      await syncBackendRole(userId, ["Admin"]);
      await addSchoolToUser(userId, schoolId);

      console.log("🎉 Form submission completed successfully!");
      alert("School created and roles assigned successfully!");
      window.location.reload();
    } catch (err) {
      console.error("💥 Error during form submission:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      alert(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RETURN ====================
  return {
    step,
    loading,
    error,
    formData,
    setFormData,
    handleNextStep,
    handlePreviousStep,
    handleFormSubmission,
  };
};

export default useSchoolForm;
