import { useState, useEffect } from "react";
import { withPageAuthRequired, useUser } from "@auth0/nextjs-auth0/client";
import Layout from "../components/layout";
import { apiClient, APIError } from "../lib/api/api-client";
import { z } from "zod";

const userSchema = z.any();

const ProfileCard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const getAccessToken = async () => {
    const response = await fetch("/api/getAccessToken", {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }
    const data = await response.json();
    return data.accessToken;
  };

  const checkAndSaveUser = async (token) => {
    try {
      const userId = encodeURIComponent(user.sub);
      const existingUser = await apiClient.get(
        `/users/${userId}`,
        userSchema,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(existingUser);
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        const userPayload = {
          auth0_id: user.sub,
          name: user.name,
          email: user.email,
          roles: ["default_role"],
        };

        try {
          const createdUser = await apiClient.post(
            `/users/`,
            userPayload,
            userSchema,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setData(createdUser);
        } catch (postError) {
          setError(postError.message);
        }
      } else {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    if (user) {
      const init = async () => {
        try {
          const token = await getAccessToken();
          await checkAndSaveUser(token);
        } catch (e) {
          setError(e.message);
        }
      };
      init();
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  return (
    <Layout user={user}>
      <div className="profile-card">
        <h1>Welcome, {user.name}</h1>
        {error && <p className="error">{error}</p>}
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </Layout>
  );
};

export default withPageAuthRequired(ProfileCard);
