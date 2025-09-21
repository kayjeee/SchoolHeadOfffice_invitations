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

  // Track window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data when available
  useEffect(() => {
    if (!user) return;
    fetchSchools();
    fetchAndSetUserRoles();
    checkOnboardingStatus();
  }, [user]);

  // Fetch Auth0 access token
  const fetchAccessToken = async () => {
    const response = await fetch("/api/getAccessToken", { method: "POST", headers: { "Content-Type": "application/json" } });
    if (!response.ok) throw new Error("Failed to fetch access token");
    const { accessToken } = await response.json();
    return accessToken;
  };

  // Fetch roles from Auth0
  const fetchUserRoles = async (accessToken, userId) => {
    const url = `https://dev-t0o26rre86m7t8lo.us.auth0.com/api/v2/users/${encodeURIComponent(userId)}/roles`;
    const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error("Failed to fetch user roles");
    const roles = await res.json();
    return roles.map(r => r.name);
  };

  const fetchAndSetUserRoles = async () => {
    try {
      const token = await fetchAccessToken();
      const roles = await fetchUserRoles(token, user.sub);
      setUserRoles(roles);
    } catch (err) {
      console.error(err);
      setUserRoles([]);
    }
  };

  // Fetch schools
  const fetchSchools = async () => {
    if (!user?.sub) return;
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch(`http://localhost:4000/api/v1/users/${encodeURIComponent(user.sub)}/schools`);
      if (res.status === 404) {
        setSchools([]);
        setMessage("You have not created any school yet. Please create a new school.");
        return;
      }
      const data = await res.json();
      setSchools(data.data?.schools || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch schools. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check onboarding status
  const checkOnboardingStatus = async () => {
    setIsCheckingOnboarding(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/users/${encodeURIComponent(user.sub)}/onboarding_status`);
      const data = await res.json();
      setOnboardingStatus(data);
      const complete =
        data.data?.admin_onboarding_completed &&
        data.data?.parent_onboarding_completed &&
        data.data?.guest_onboarding_completed;
      setIsOnboardingComplete(complete);
    } catch (err) {
      console.error(err);
      setIsOnboardingComplete(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  // Stepper UI
  const renderStepper = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">School Registration</h1>
          <p className="text-gray-600">Follow these steps to register your school</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {["Search", "Create", "Validate", "Complete"].map((title, i) => (
              <div key={title} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step === i + 1 ? "bg-blue-600 border-blue-600 text-white" : step > i + 1 ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                {i < 3 && <div className={`w-24 h-1 mx-2 ${step > i + 1 ? "bg-green-500" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2">
            {["Search", "Create", "Validate", "Complete"].map((title, i) => (
              <div
                key={title}
                className={`text-sm font-medium ${step === i + 1 ? "text-blue-600" : step > i + 1 ? "text-green-600" : "text-gray-400"}`}
                style={{ width: "100px", textAlign: "center" }}
              >
                {title}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 1 && <AdminSearchPage user={user} />}
          {step === 2 && <CreateSchoolForm user={user} onComplete={fetchSchools} />}
          {step === 3 && <ValidateSchoolStep />}
          {step === 4 && <ReviewSchoolStep />}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={step === 4}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render logic
  const renderContent = () => {
    if (isLoading || isCheckingOnboarding) return <LoadingSpinner />;

    if (schools.length === 0) return message ? renderStepper() : <AdminSearchPage user={user} />;

    if (!isOnboardingComplete)
      return <OnboardingGuard user={user} schools={schools} onboardingStatus={onboardingStatus} isOnboardingComplete={isOnboardingComplete} isCheckingOnboarding={isCheckingOnboarding} />;

    return <SettingsLayout schools={schools} user={user} />;
  };

  const content = isMobile ? (
    <FrontPageLayoutMobileView user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayout>
  );

  return <OnboardingFlowProvider>{content}</OnboardingFlowProvider>;
}
