// pages/index.js
import React, { useState, useEffect } from "react";
import AdminSearchPage from "../../components/adminPage/AdminSearchPage";
import FrontPageLayout from "../../components/Layouts/FrontPageLayout";
import FrontPageLayoutMobileView from "../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView";
import { useUser } from "@auth0/nextjs-auth0/client";
import SettingsLayout from "../../components/adminPage/SettingsLayout";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import CreateSchoolForm from "../../components/Schoolpage/CreateSchoolForm/index";
import ValidateSchoolStep from "../../components/Schoolpage/ValidateSchoolStep";
import ReviewSchoolStep from "../../components/Schoolpage/ReviewSchoolStep";
import { OnboardingGuard, OnboardingFlowProvider } from "../../components/onboarding/onboarding";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const [userRoles, setUserRoles] = useState([]);

  // Onboarding state
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Track window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchSchools();
      fetchAndSetUserRoles();
      checkOnboardingStatus();
    }
  }, [user]);

  // Auth0 access token
  const fetchAccessToken = async () => {
    try {
      const response = await fetch("/api/getAccessToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch access token");
      const { accessToken } = await response.json();
      return accessToken;
    } catch (error) {
      console.error("Error fetching access token:", error.message);
      throw error;
    }
  };

  // Fetch roles from Auth0
  const fetchUserRoles = async (accessToken, userId) => {
    try {
      const rolesUrl = `https://dev-t0o26rre86m7t8lo.us.auth0.com/api/v2/users/${encodeURIComponent(
        userId
      )}/roles`;

      const response = await fetch(rolesUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user roles");

      const rolesData = await response.json();
      return rolesData.map((role) => role.name);
    } catch (error) {
      console.error("Error fetching user roles:", error.message);
      return [];
    }
  };

  // Get and set roles
  const fetchAndSetUserRoles = async () => {
    try {
      const accessToken = await fetchAccessToken();
      const roles = await fetchUserRoles(accessToken, user.sub);
      setUserRoles(roles);
    } catch (error) {
      console.error("Error setting user roles:", error.message);
    }
  };

  // Fetch schools for the current user
  const fetchSchools = async () => {
    if (!user?.sub) return;

    setIsLoading(true);
    setMessage("");
    try {
      const userId = encodeURIComponent(user.sub);

      const response = await fetch(
        `http://localhost:4000/api/v1/users/${userId}/schools`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 404) {
        setSchools([]);
        setMessage(
          "You have not created any school yet. Please create a new school."
        );
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setSchools(data.data?.schools || []);
      } else if (Array.isArray(data)) {
        setSchools(data);
      } else {
        setMessage(data.message || "Error fetching schools.");
      }
    } catch (error) {
      console.error("Fetch schools error:", error);
      setMessage("Failed to fetch schools. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check onboarding status
  const checkOnboardingStatus = async () => {
    setIsCheckingOnboarding(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/users/${encodeURIComponent(
          user.sub
        )}/onboarding_status`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOnboardingStatus(data);
      setIsOnboardingComplete(data.completed);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsOnboardingComplete(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  // Enhanced Stepper UI
  const renderStepper = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            School Registration
          </h1>
          <p className="text-gray-600">
            Follow these steps to register your school
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {["Search", "Create", "Validate", "Complete"].map((title, index) => (
              <div key={title} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step === index + 1
                      ? "bg-blue-600 border-blue-600 text-white"
                      : step > index + 1
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > index + 1 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between px-2">
            {["Search", "Create", "Validate", "Complete"].map((title, index) => (
              <div
                key={title}
                className={`text-sm font-medium ${
                  step === index + 1
                    ? "text-blue-600"
                    : step > index + 1
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

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={step === 4}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step content
  const renderStepContent = () => {
    if (step === 1) return <AdminSearchPage user={user} />;
    if (step === 2)
      return <CreateSchoolForm user={user} onComplete={fetchSchools} />;
    if (step === 3) return <ValidateSchoolStep />;
    if (step === 4) return <ReviewSchoolStep />;
    return null;
  };

  // Main content (merged with onboarding logic)
  const renderContent = () => {
    if (isLoading || isCheckingOnboarding) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    // If user has schools but onboarding is not done yet
    if (schools.length > 0 && !isOnboardingComplete) {
      return (
        <OnboardingGuard
          user={user}
          schools={schools}
          onboardingStatus={onboardingStatus}
          isOnboardingComplete={isOnboardingComplete}
          isCheckingOnboarding={isCheckingOnboarding}
        />
      );
    }

    // New simplified conditions
    if (isLoading) return <LoadingSpinner />;
    if (message && schools.length === 0) {
      return renderStepper();
    }
    if (schools.length === 0) {
      return <AdminSearchPage user={user} />;
    }
    return <SettingsLayout schools={schools} user={user} />;
  };

  const content = isMobile ? (
    <FrontPageLayoutMobileView
      user={user}
      schools={schools}
      userRoles={userRoles}
    >
      {renderContent()}
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayout>
  );

  return <OnboardingFlowProvider>{content}</OnboardingFlowProvider>;
}
