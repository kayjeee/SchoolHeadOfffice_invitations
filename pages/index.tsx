import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { z } from 'zod';
import { apiClient } from "../lib/api/api-client"; 
import FrontPageLayout from "../components/Layouts/FrontPageLayout";
import DesktopHome from "../components/FrontPageComponents/DesktopHome";
import LoadingSpinner from "../components/spinners/LoadingSpinner";
import clientPromise from "../lib/mongodb";

// ========================
// SCHEMAS
// ========================
const UserSchema = z.object({
  auth0_id: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  roles: z.array(z.string()).default(["default_role"]),
}).passthrough();

const Home = ({ schools }) => {
  const { user, isLoading: authLoading } = useUser();

  const [state, setState] = useState({
    userData: null,
    userRoles: [],
    error: null,
    isProcessing: true,
  });

  // ========================
  // API HELPERS
  // ========================

  /**
   * Fetches the Management API token from your local Next.js API route
   */
  const getAccessTokenFromAPI = async () => {
    const response = await fetch("/api/getAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch Management API token");
    const { accessToken } = await response.json();
    return accessToken;
  };

  /**
   * Checks if user exists in backend; if not (404), creates them.
   * Uses apiClient which respects your NEXT_PUBLIC_API_BASE_URL config.
   */
  const checkAndSaveUser = async (authUser) => {
    const userId = encodeURIComponent(authUser.sub);
    
    try {
      // GET /api/v1/users/{id}
      return await apiClient.get(`/users/${userId}`, UserSchema);
    } catch (error: any) {
      // Handle 404 by creating the user
      if (error.status === 404) {
        console.log("[checkAndSaveUser] User record not found, creating...");
        const userPayload = {
          auth0_id: authUser.sub,
          name: authUser.name,
          email: authUser.email,
          roles: ["default_role"],
        };
        // POST /api/v1/users/
        return await apiClient.post(`/users/`, userPayload, UserSchema);
      }
      throw error;
    }
  };

  /**
   * Fetches roles directly from Auth0 Management API.
   * Fixed to handle non-array responses to prevent .map() errors.
   */
  const fetchUserRoles = async (userId) => {
    const rolesUrl = `https://dev-q3l2f3kyx1zmv3iq.us.auth0.com/api/v2/users/${userId}/roles`;
    
    try {
      const rolesData = await apiClient.get(rolesUrl, z.array(z.any()));
      
      // ✅ Critical fix: ensure rolesData is an array before mapping
      if (!Array.isArray(rolesData)) {
        console.error("[fetchUserRoles] Expected array, got:", rolesData);
        return [];
      }

      return rolesData.map((role: any) => role.name);
    } catch (err) {
      console.error("[fetchUserRoles] Error fetching roles from Auth0:", err);
      return []; // Return empty array so the page still loads
    }
  };

  // ========================
  // INITIALIZATION FLOW
  // ========================
  useEffect(() => {
    const initializeUser = async () => {
      if (authLoading) return;
      if (!user) {
        setState((prev) => ({ ...prev, isProcessing: false }));
        return;
      }

      try {
        // 1. Get the Auth0 Management Token
        const token = await getAccessTokenFromAPI();
        
        // 2. Set it in the apiClient for all subsequent calls
        apiClient.setAccessToken(token);

        // 3. Run user check and roles fetch in parallel for speed
        const [userRecord, roles] = await Promise.all([
          checkAndSaveUser(user),
          fetchUserRoles(encodeURIComponent(user.sub))
        ]);

        setState({
          userData: userRecord,
          userRoles: roles,
          error: null,
          isProcessing: false,
        });
      } catch (err: any) {
        console.error("[initializeUser] Fatal error:", err);
        setState((prev) => ({
          ...prev,
          error: err.message,
          isProcessing: false,
        }));
      }
    };

    initializeUser();
  }, [user, authLoading]);

  // ========================
  // RENDER LOGIC
  // ========================
  const { error, userRoles, isProcessing } = state;

  if (authLoading || isProcessing) return <LoadingSpinner />;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      <DesktopHome schools={schools} />
    </FrontPageLayout>
  );
};

// ========================
// SERVER SIDE DATA
// ========================
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

    return { 
      props: { 
        schools: JSON.parse(JSON.stringify(schools)) 
      } 
    };
  } catch (error) {
    console.error("MongoDB fetch error:", error);
    return { props: { schools: [] } };
  }
}

export default Home;