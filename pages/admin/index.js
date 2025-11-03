// pages/index.js
import React, { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

import FrontPageLayout from "../../components/Layouts/FrontPageLayout";
import FrontPageLayoutMobileView from "../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView";
import SettingsLayout from "../../components/adminPage/SettingsLayout";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import CreateSchoolForm from "../../components/Schoolpage/CreateSchoolForm";
import ValidateSchoolStep from "../../components/Schoolpage/ValidateSchoolStep";
import ReviewSchoolStep from "../../components/Schoolpage/ReviewSchoolStep";
import { OnboardingGuard } from "../../components/onboarding/onboarding";
import { AppThemeProvider } from "../../components/Layouts/context/ThemeContext";
import { apiClient } from "../../lib/api/api-client";
import { z } from "zod";

const schoolSchema = z.object({
  id: z.string(),
  _id: z.string(),
  schoolName: z.string(),
  schoolEmail: z.string(),
  city: z.string(),
  country: z.string(),
  province: z.string(),
  logo: z.string().optional(),
  userEmail: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  postalCode: z.string().optional(),
});

const schoolsResponseSchema = z.object({
  data: z.object({
    schools: z.array(schoolSchema),
  }),
});

const onboardingStatusSchema = z.any();

export default function Home() {
  const { user } = useUser();

  const [isMobile, setIsMobile] = useState(false);
  const [schools, setSchools] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // 🧩 Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧠 Fetch initial data when user logs in
  useEffect(() => {
    if (!user?.sub) return;
    fetchSchools();
    fetchAndSetUserRoles();
    checkOnboardingStatus();
  }, [user]);

  const fetchAndSetUserRoles = async () => {
    try {
      const res = await fetch(`/api/getUserRoles?userId=${encodeURIComponent(user.sub)}`);
      const data = await res.json();
      setUserRoles(data.roles.map((r) => r.name));
    } catch (err) {
      console.error("❌ Error fetching roles:", err);
      setUserRoles([]);
    }
  };

  // 🏫 Fetch user schools
  const fetchSchools = async () => {
    if (!user?.sub) return;
    setIsLoading(true);
    setMessage("");
    try {
      const data = await apiClient.get(
        `/users/${encodeURIComponent(user.sub)}/schools`,
        schoolsResponseSchema
      );
      const mapped = (data.data?.schools || []).map((s) => ({
        id: s._id,
        _id: s._id,
        schoolName: s.schoolName,
        schoolEmail: s.schoolEmail,
        city: s.city,
        country: s.country,
        province: s.province,
        logo: s.logo,
        userEmail: s.user_email || s.userEmail || "",
        line1: s.line1 || "",
        line2: s.line2 || "",
        postalCode: s.postalCode || "",
      }));
      setSchools(mapped);
    } catch (err) {
      if (err.status === 404) {
        setSchools([]);
        setMessage("You have not created any school yet. Please create a new school.");
      } else {
        console.error("❌ Error fetching schools:", err);
        setMessage("Failed to fetch schools. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🧭 Check onboarding status
  const checkOnboardingStatus = async () => {
    if (!user?.sub) return;
    setIsCheckingOnboarding(true);
    try {
      const data = await apiClient.get(
        `/users/${encodeURIComponent(user.sub)}/onboarding_status`,
        onboardingStatusSchema
      );
      setOnboardingStatus(data);

      const complete =
        data.data?.admin_onboarding_completed &&
        data.data?.parent_onboarding_completed &&
        data.data?.guest_onboarding_completed;

      setIsOnboardingComplete(Boolean(complete));
    } catch (err) {
      console.error("❌ Error checking onboarding:", err);
      setIsOnboardingComplete(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  // 🪜 Stepper UI
  const renderStepper = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">School Registration</h1>
          <p className="text-gray-600">Follow these steps to register your school</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {["Create", "Validate", "Complete"].map((title, i) => (
              <div key={title} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step === i + 1
                      ? "bg-blue-600 border-blue-600 text-white"
                      : step > i + 1
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > i + 1 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between px-2">
            {["Create", "Validate", "Complete"].map((title, i) => (
              <div
                key={title}
                className={`text-sm font-medium ${
                  step === i + 1
                    ? "text-blue-600"
                    : step > i + 1
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
                style={{ width: "100px", textAlign: "center" }}
              >
                {title}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 1 && <CreateSchoolForm user={user} onComplete={fetchSchools} />}
          {step === 2 && <ValidateSchoolStep />}
          {step === 3 && <ReviewSchoolStep />}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button
              disabled={step === 3}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 🎨 Onboarding with Theme Provider
  const OnboardingWithTheme = () => (
    <AppThemeProvider>
      <OnboardingGuard
        user={user}
        schools={schools}
        onboardingStatus={onboardingStatus}
        isOnboardingComplete={isOnboardingComplete}
        isCheckingOnboarding={isCheckingOnboarding}
      />
    </AppThemeProvider>
  );

  // 🧭 Main rendering logic
  const renderContent = () => {
    if (isLoading || isCheckingOnboarding) return <LoadingSpinner />;

    if (!schools.length)
      return message
        ? renderStepper()
        : <CreateSchoolForm user={user} onComplete={fetchSchools} />;

    if (!isOnboardingComplete) return <OnboardingWithTheme />;

    return <SettingsLayout schools={schools} user={user} />;
  };

  // 🧱 Layout per screen size
  const content = isMobile ? (
    <FrontPageLayoutMobileView user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayout>
  );

  return content;
}
