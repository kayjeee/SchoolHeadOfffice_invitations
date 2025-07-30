import { useState, useEffect } from "react";
import { withPageAuthRequired, useUser } from "@auth0/nextjs-auth0/client";
import Layout from "../components/layout";

const ProfileCard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/getAccessToken', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const checkAndSaveUser = async (token) => {
    try {
      const userId = encodeURIComponent(user.sub); // Auth0's unique user ID
      const checkUserUrl = `http://localhost:4000/api/v1/users/${userId}`;
      const postUserUrl = `http://localhost:4000/api/v1/users/`;
      // Check if user exists
      const response = await fetch(checkUserUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 404) {
        // User does not exist; create the user
        const userPayload = {
          auth0_id: user.sub, // Pass Auth0 'sub' as the unique identifier
          name: user.name,
          email: user.email,
          roles: ["default_role"], // Assign default roles
        };
  
        const createResponse = await fetch(postUserUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userPayload),
        });
  
        if (!createResponse.ok) {
          throw new Error('Failed to create user in the database');
        }
  
        const createdUser = await createResponse.json();
        setData(createdUser);
      } else if (response.ok) {
        // User exists; fetch user data
        const existingUser = await response.json();
        setData(existingUser);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      setError(error.message);
    }
  };
  

  useEffect(() => {
    if (user) {
      console.log("User info from Auth0:", user); // Log the user info

      const fetchData = async () => {
        try {
          const token = await getAccessToken();
          await checkAndSaveUser(token);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchData();
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
