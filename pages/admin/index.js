// pages/index.js
import React, { useEffect, useState } from "react";
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function Home() {
  const { user, isLoading: authLoading } = useUser();

  const [isMobile, setIsMobile] = useState(false);
  const [schools, setSchools] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const [loadingSchools, setLoadingSchools] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  /* ---------------------------------------------------
   * Screen size detection
   * --------------------------------------------------- */
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------------------------------------------
   * Initial data load (Auth0-safe)
   * --------------------------------------------------- */
  useEffect(() => {
    if (!user?.sub) return;

    fetchSchools();
    fetchUserRoles();
    checkOnboardingStatus();
  }, [user?.sub]);

  /* ---------------------------------------------------
   * Fetch user roles (internal API)
   * --------------------------------------------------- */
  const fetchUserRoles = async () => {
    try {
      const res = await fetch(
        `/api/getUserRoles?userId=${encodeURIComponent(user.sub)}`
      );
      const data = await res.json();
      setUserRoles(data.roles?.map((r) => r.name) || []);
    } catch (err) {
      console.error("❌ Failed to fetch roles", err);
      setUserRoles([]);
    }
  };

  /* ---------------------------------------------------
   * Fetch schools (Auth0-safe query param)
   * --------------------------------------------------- */
  const fetchSchools = async () => {
    setLoadingSchools(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/schools?auth0_id=${encodeURIComponent(
          user.sub
        )}`
      );

      if (res.status === 404) {
        setSchools([]);
        setMessage("You have not created any school yet.");
        return;
      }

      const json = await res.json();

      const mapped = (json.data?.schools || []).map((s) => ({
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
      console.error("❌ Failed to fetch schools", err);
      setMessage("Unable to load schools. Please try again.");
    } finally {
      setLoadingSchools(false);
    }
  };

  /* ---------------------------------------------------
   * Onboarding status (Auth0-safe query param)
   * --------------------------------------------------- */
  const checkOnboardingStatus = async () => {
    setCheckingOnboarding(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/onboarding_status?auth0_id=${encodeURIComponent(
          user.sub
        )}`
      );

      const json = await res.json();
      setOnboardingStatus(json);

      const completed =
        json.data?.admin_onboarding_completed &&
        json.data?.parent_onboarding_completed &&
        json.data?.guest_onboarding_completed;

      setIsOnboardingComplete(Boolean(completed));
    } catch (err) {
      console.error("❌ Failed onboarding check", err);
      setIsOnboardingComplete(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  /* ---------------------------------------------------
   * Stepper UI (unchanged UX)
   * --------------------------------------------------- */
  const renderStepper = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          School Registration
        </h1>

        <div className="bg-white p-6 rounded-lg shadow">
          {step === 1 && <CreateSchoolForm user={user} onComplete={fetchSchools} />}
          {step === 2 && <ValidateSchoolStep />}
          {step === 3 && <ReviewSchoolStep />}

          <div className="flex justify-between mt-6">
            <button
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={step === 3}
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------
   * Main render decision tree
   * --------------------------------------------------- */
  const renderContent = () => {
    if (authLoading || loadingSchools || checkingOnboarding)
      return <LoadingSpinner />;

    if (!schools.length) {
      return message ? renderStepper() : (
        <CreateSchoolForm user={user} onComplete={fetchSchools} />
      );
    }

    if (!isOnboardingComplete) {
      return (
        <AppThemeProvider>
          <OnboardingGuard
            user={user}
            schools={schools}
            onboardingStatus={onboardingStatus}
            isOnboardingComplete={isOnboardingComplete}
            isCheckingOnboarding={checkingOnboarding}
          />
        </AppThemeProvider>
      );
    }

    return <SettingsLayout schools={schools} user={user} />;
  };

  /* ---------------------------------------------------
   * Layout switch (desktop / mobile)
   * --------------------------------------------------- */
  const Layout = isMobile
    ? FrontPageLayoutMobileView
    : FrontPageLayout;

  return (
    <Layout user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </Layout>
  );
}
