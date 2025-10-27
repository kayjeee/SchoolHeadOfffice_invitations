// pages/api/getUserRoles.js
export default async function handler(req, res) {
  const { userId } = req.query;

  try {
    // Step 1: Get management token securely
    const tokenRes = await fetch("https://dev-q3l2f3kyx1zmv3iq.us.auth0.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://dev-q3l2f3kyx1zmv3iq.us.auth0.com/api/v2/`,
        grant_type: "client_credentials",
      }),
    });

    const { access_token } = await tokenRes.json();

    // Step 2: Call roles endpoint (server-side)
    const rolesRes = await fetch(
      `https://dev-q3l2f3kyx1zmv3iq.us.auth0.com/api/v2/users/${userId}/roles`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rolesRes.ok) throw new Error("Failed to fetch user roles");

    const roles = await rolesRes.json();
    res.status(200).json({ roles });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    res.status(500).json({ error: error.message });
  }
}
