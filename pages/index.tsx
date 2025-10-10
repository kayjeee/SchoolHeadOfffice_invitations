import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import FrontPageLayout from "../components/Layouts/FrontPageLayout";
import FrontPageLayoutMobileView from "../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView";
import DesktopHome from "../components/FrontPageComponents/DesktopHome";
import MobileHome from "../components/FrontPageComponents/MobileHome";
import LoadingSpinner from "../components/spinners/LoadingSpinner";
import clientPromise from "../lib/mongodb";

const Home = ({ schools }) => {
  const { user, isLoading } = useUser();
  const dropdownRef = useRef(null);

  const [state, setState] = useState({
    isMobile: false,
    chatOpen: false,
    dropdownOpen: false,
    userData: null,
    userRoles: [],
    error: null,
  });

  // ✅ Helper to fetch access token
  const getAccessTokenFromAPI = async () => {
    const response = await fetch("/api/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch access token");
    const { accessToken } = await response.json();
    return accessToken;
  };

  // ✅ Step 1: Check and save user in backend if needed
  const checkAndSaveUser = async (token) => {
    try {
      const userId = encodeURIComponent(user.sub);
      const checkUserUrl = `https://sho-backend-v2.onrender.com/api/v1/users/${userId}`;
      const postUserUrl = `https://sho-backend-v2.onrender.com/api/v1/users/`;

      const response = await fetch(checkUserUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        // User does not exist — create one
        const userPayload = {
          auth0_id: user.sub,
          name: user.name,
          email: user.email,
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

        if (!createResponse.ok) throw new Error("Failed to create user");
        const createdUser = await createResponse.json();
        return createdUser;
      } else if (response.ok) {
        // User exists — fetch user data
        const existingUser = await response.json();
        return existingUser;
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      throw new Error(error.message || "Error checking/saving user");
    }
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
    return rolesData.map((role) => role.name);
  };

  // ✅ Main effect — runs once user is loaded
  useEffect(() => {
    if (!user) return;

    const initializeUser = async () => {
      try {
        const token = await getAccessTokenFromAPI();

        // Step 1: Ensure user exists in backend
        const userRecord = await checkAndSaveUser(token);
        setState((prev) => ({ ...prev, userData: userRecord }));

        // Step 2: Fetch roles after user is saved
        const roles = await fetchUserRoles(token, encodeURIComponent(user.sub));
        setState((prev) => ({ ...prev, userRoles: roles }));
      } catch (err) {
        setState((prev) => ({ ...prev, error: err.message }));
      }
    };

    initializeUser();
  }, [user]);

  // ✅ Detect screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setState((prev) => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isMobile, chatOpen, dropdownOpen, error, userRoles, userData } = state;

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
