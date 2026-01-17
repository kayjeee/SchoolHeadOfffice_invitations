// pages/api/getUserRoles.js
export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // Step 1: Get management token securely
    const tokenRes = await fetch("https://${process.env.AUTH0_DOMAIN}/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.json();
      console.error("❌ Error fetching management token:", errorData);
      throw new Error("Failed to fetch management token");
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Call roles endpoint (server-side)
    const decodedUserId = decodeURIComponent(userId);
    const rolesRes = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${decodedUserId}/roles`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rolesRes.ok) {
      const errorData = await rolesRes.json();
      console.error("❌ Error fetching user roles from Auth0:", errorData);
      throw new Error(`Failed to fetch user roles: ${errorData.message || "Unknown error"}`);
    }

    const roles = await rolesRes.json();
    res.status(200).json({ roles });
  } catch (error) {
    console.error("❌ Error in getUserRoles handler:", error);
    res.status(500).json({ error: error.message });
  }
}
