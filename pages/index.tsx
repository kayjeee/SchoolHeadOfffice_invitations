import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import FrontPageLayout from "../components/Layouts/FrontPageLayout";
import FrontPageLayoutMobileView from "../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView";
import DesktopHome from "../components/FrontPageComponents/DesktopHome";
import MobileHome from "../components/FrontPageComponents/MobileHome";
import LoadingSpinner from "../components/spinners/LoadingSpinner";
import clientPromise from "../lib/mongodb";
import { apiClient, APIError } from "../lib/api/api-client";
import { z } from "zod";

const userSchema = z.any();

const Home = ({ schools }) => {
  const { user, isLoading: authLoading } = useUser();
  const dropdownRef = useRef(null);

  const [state, setState] = useState({
    isMobile: false,
    chatOpen: false,
    dropdownOpen: false,
    userData: null,
    userRoles: [],
    error: null,
    isProcessing: true, // 🔹 controls "Loading..." state
  });

  // ✅ Step 1: Check and Save User should work
  const checkAndSaveUser = async (authUser) => {
    const userId = encodeURIComponent(authUser.sub);
    console.log("[checkAndSaveUser] Checking user:", userId);

    try {
      const existingUser = await apiClient.get(`/users/${userId}`, userSchema);
      console.log("[checkAndSaveUser] User exists:", existingUser);
      return existingUser;
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        console.log("[checkAndSaveUser] User not found, creating...");
        const userPayload = {
          auth0_id: authUser.sub,
          name: authUser.name,
          email: authUser.email,
          roles: ["default_role"],
        };

        const createdUser = await apiClient.post(
          `/users`,
          userPayload,
          userSchema
        );
        console.log("[checkAndSaveUser] User created:", createdUser);
        return createdUser;
      }
      throw error;
    }
  };

  // ✅ Step 2: Fetch user roles from Auth0
  const fetchUserRoles = async (userId) => {
    // This is a call to our own backend, which then calls Auth0
    const response = await fetch(`/api/getUserRoles?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user roles");
    const rolesData = await response.json();
    console.log("[fetchUserRoles] Roles fetched:", rolesData);
    return rolesData.roles.map((role) => role.name);
  };

  // ✅ Step 3: Initialization flow
  useEffect(() => {
    const initializeUser = async () => {
      if (authLoading) return; // Wait until Auth0 finishes
      if (!user) {
        console.log("[initializeUser] No Auth0 user yet.");
        setState((prev) => ({ ...prev, isProcessing: false }));
        return;
      }

      console.log("[initializeUser] Auth0 user ready:", user);

      try {
        // Step 1: Check or create user in backend
        const userRecord = await checkAndSaveUser(user);
        // Step 2: Fetch roles from Auth0
        const roles = await fetchUserRoles(encodeURIComponent(user.sub));

        setState((prev) => ({
          ...prev,
          userData: userRecord,
          userRoles: roles,
          isProcessing: false,
        }));
      } catch (err) {
        console.error("[initializeUser] Error:", err);
        setState((prev) => ({
          ...prev,
          error: err.message,
          isProcessing: false,
        }));
      }
    };

    initializeUser();
  }, [user, authLoading]);

  // ✅ Handle screen resize for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setState((prev) => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isMobile, chatOpen, dropdownOpen, error, userRoles, isProcessing } =
    state;

  // ✅ Show loading spinner while processing user setup
  if (authLoading || isProcessing) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  // ✅ Render final layouts
  return isMobile ? (
    <FrontPageLayoutMobileView user={user} schools={schools} userRoles={userRoles}>
      <MobileHome
        handleSearchClick={() =>
          setState((prev) => ({ ...prev, dropdownOpen: !dropdownOpen }))
        }
        handleChatClick={() =>
          setState((prev) => ({ ...prev, chatOpen: !chatOpen }))
        }
        dropdownOpen={dropdownOpen}
        schools={schools}
      />
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      <DesktopHome schools={schools} />
    </FrontPageLayout>
  );
};

// ✅ Server-side props for school data
export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("tracker");
    const schools = await db
      .collection("School")
      .find({})
      .sort({ metacritic: -1 })
      .limit(1000)
      .toArray();

    return { props: { schools: JSON.parse(JSON.stringify(schools)) } };
  } catch (error) {
    console.error("Error fetching schools:", error);
    return { props: { schools: [] } };
  }
}

export default Home;
