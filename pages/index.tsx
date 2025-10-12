import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import FrontPageLayout from "../components/Layouts/FrontPageLayout";
import FrontPageLayoutMobileView from "../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView";
import DesktopHome from "../components/FrontPageComponents/DesktopHome";
import MobileHome from "../components/FrontPageComponents/MobileHome";
import LoadingSpinner from "../components/spinners/LoadingSpinner";
import clientPromise from "../lib/mongodb";

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

  // ✅ Helper: get Management API access token
  const getAccessTokenFromAPI = async () => {
    const response = await fetch("/api/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch access token");
    const { accessToken } = await response.json();
    return accessToken;
  };

  // ✅ Step 1: Check and Save User should work
  const checkAndSaveUser = async (token, authUser) => {
    const userId = encodeURIComponent(authUser.sub);
    const checkUserUrl = `https://421e6967b77a.ngrok-free.app/api/v1/users/${userId}`;
    const postUserUrl = `https://421e6967b77a.ngrok-free.app/api/v1/users/`;

    console.log("[checkAndSaveUser] Checking user:", userId);

    const response = await fetch(checkUserUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) {
      console.log("[checkAndSaveUser] User not found, creating...");
      const userPayload = {
        auth0_id: authUser.sub,
        name: authUser.name,
        email: authUser.email,
        roles: ["default_role"],
      };

      const createResponse = await fetch(postUserUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      });

      if (!createResponse.ok)
        throw new Error("Failed to create user in backend");

      const createdUser = await createResponse.json();
      console.log("[checkAndSaveUser] User created:", createdUser);
      return createdUser;
    }

    if (response.ok) {
      const existingUser = await response.json();
      console.log("[checkAndSaveUser] User exists:", existingUser);
      return existingUser;
    }

    throw new Error("Failed to fetch or create user");
  };

  // ✅ Step 2: Fetch user roles from Auth0
  const fetchUserRoles = async (accessToken, userId) => {
    const rolesUrl = `https://dev-q3l2f3kyx1zmv3iq.us.auth0.com/api/v2/users/${userId}/roles`;
    const response = await fetch(rolesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user roles");
    const rolesData = await response.json();
    console.log("[fetchUserRoles] Roles fetched:", rolesData);
    return rolesData.map((role) => role.name);
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
        const token = await getAccessTokenFromAPI();
        console.log("[initializeUser] Got access token.");

        // Step 1: Check or create user in backend
        const userRecord = await checkAndSaveUser(token, user);
        // Step 2: Fetch roles from Auth0
        const roles = await fetchUserRoles(token, encodeURIComponent(user.sub));

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

