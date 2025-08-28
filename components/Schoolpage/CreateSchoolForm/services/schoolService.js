// components/Schoolpage/CreateSchoolForm/services/schoolService.js

// --- Config ---
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const AUTH0_DOMAIN =
  process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "dev-t0o26rre86m7t8lo.us.auth0.com";

// -------------------------------------------------
// 0. Auth0 Helpers
// -------------------------------------------------

/**
 * Fetches Auth0 management API access token
 * @returns {Promise<string>} Access token for Auth0 Management API
 */
export const getAccessToken = async () => {
  try {
    const response = await fetch("/api/getAccessToken", { method: "POST" });
    if (!response.ok) throw new Error("Failed to fetch access token");

    const data = await response.json();
    if (!data.accessToken) {
      throw new Error("No accessToken returned from API route");
    }
console.log("🎟️ Access token response:", data);

    return data.accessToken.trim();
  } catch (error) {
    console.error("💥 Error in getAccessToken:", error);
    throw error;
  }
};

/**
 * Fetch all roles from Auth0 Management API
 */
export const fetchAuth0Roles = async (token) => {
  if (!AUTH0_DOMAIN) {
    throw new Error("❌ AUTH0_DOMAIN environment variable is not set");
  }
  if (!token || typeof token !== "string") {
    throw new Error("❌ Invalid token passed to fetchAuth0Roles");
  }

  const cleanToken = token.trim();
  console.log(
    "🔑 Using token for fetchAuth0Roles:",
    cleanToken.slice(0, 20) + "..."
  );

  const res = await fetch(`https://${AUTH0_DOMAIN}/api/v2/roles`, {
    headers: { Authorization: `Bearer ${cleanToken}` },
  });

  if (!res.ok) {
    throw new Error(
      `❌ Failed to fetch Auth0 roles: ${res.status} ${await res.text()}`
    );
  }

  return res.json();
};

/**
 * Assigns roles to a user in Auth0
 */
export const assignAuth0Role = async (userId, token, roleIds) => {
  if (!AUTH0_DOMAIN) {
    throw new Error("❌ AUTH0_DOMAIN environment variable is not set");
  }
  if (!token) {
    throw new Error("❌ No token provided for assignAuth0Role");
  }

  const url = `https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
    userId
  )}/roles`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.trim()}`,
    },
    body: JSON.stringify({ roles: roleIds }),
  });

  if (!res.ok) {
    throw new Error(
      `❌ Failed to assign Auth0 role: ${res.status} ${await res.text()}`
    );
  }

  // Auth0 returns 204 No Content → just return true
  return true;
};


// -------------------------------------------------
// 1. Upload file to Cloudinary
// -------------------------------------------------
export const uploadFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "w1ofo4vi"
  );

  const url = `https://api.cloudinary.com/v1_1/${
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "chameleon-techie"
  }/image/upload`;

  console.log("🌐 Uploading to Cloudinary:", url);

  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Cloudinary response:", errorText);
    throw new Error(`❌ Failed to upload file to Cloudinary: ${errorText}`);
  }

  const data = await res.json();
  console.log("✅ Cloudinary upload success:", data);
  return data.secure_url;
};

// -------------------------------------------------
// 2. Create School in Backend
// -------------------------------------------------
const buildSchoolPayload = (formData, user, logoUrl) => ({
  schoolName: formData.schoolName,
  logo: logoUrl || formData.logo || "",
  schoolEmail: formData.schoolEmail,

  line1: formData.addressLine1 ?? formData.line1 ?? "",
  line2: formData.addressLine2 ?? formData.line2 ?? "",

  country: formData.country,
  province: formData.province,
  city: formData.city,
  postalCode: formData.postalCode,
  theme: formData.theme,

  latitude: formData.location?.lat ?? formData.latitude ?? null,
  longitude: formData.location?.lng ?? formData.longitude ?? null,

  website: formData.website,
  facebook: formData.facebook,
  tiktok: formData.tiktok,
  linkedin: formData.linkedin,

  status: formData.status || "active",

  user_id: user?.sub,
  user_email: user?.email,
  school_created_by: user?.email,
   // 👇 include admins
  adminUsers: formData.adminUsers || [],
});

export const createSchool = async (formData, user, logoUrl) => {
  const payload = buildSchoolPayload(formData, user, logoUrl);

  const res = await fetch(`${API_BASE}/api/v1/schools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`School creation failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const school = json?.data?.school || json?.school || json?.data;

  if (!school || !school._id) {
    console.error("Unexpected school response:", json);
    throw new Error("School ID not found in response");
  }
  return school;
};

// -------------------------------------------------
// 3. User Management Helpers
// -------------------------------------------------
export const syncBackendRole = async (auth0Id, roles) => {
  const normalized = (roles || []).map(
    (r) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
  );

  const res = await fetch(
    `${API_BASE}/api/v1/users/${encodeURIComponent(auth0Id)}/update_roles`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles: normalized }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend role sync failed: ${res.status} ${text}`);
  }
  return res.json();
};

export const addSchoolToUser = async (auth0Id, schoolId) => {
  const res = await fetch(
    `${API_BASE}/api/v1/users/${encodeURIComponent(auth0Id)}/add_school`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Add school to user failed: ${res.status} ${text}`);
  }
  return res.json();
};

// -------------------------------------------------
// 4. Full Orchestration
// -------------------------------------------------
export const provisionNewSchool = async (formData, user, token) => {
  try {
    // 1) Upload logo
    console.log("🖼️ Step 1: Uploading school logo...");
    let logoUrl = "";
    if (formData.logo) {
      logoUrl = await uploadFileToCloudinary(formData.logo);
      console.log("✅ Logo uploaded:", logoUrl);
    }

    // 2) Create school
    console.log("🏫 Step 2: Creating school...");
    const school = await createSchool(formData, user, logoUrl);
    console.log("✅ School created:", school);

    // 3) Ensure user exists in backend
    console.log("👤 Step 3: Ensuring user exists in backend...");
    const createUserRes = await fetch(`${API_BASE}/api/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          name: user.name,
          email: user.email,
          auth0_id: user.sub,
          roles: [],
        },
      }),
    });

    if (!createUserRes.ok && createUserRes.status !== 422) {
      throw new Error(await createUserRes.text());
    }
    console.log("✅ User ensured in backend");

    // 4) Assign Auth0 role + sync backend
    console.log("👥 Step 4: Assigning Admin role in Auth0...");

    const userId = encodeURIComponent(user.sub);
    console.log("👤 Encoded user ID:", userId);

    // use the management token passed in
    const accessToken = token || (await getAccessToken());
    console.log("🔐 Access token retrieved for role assignment");

    // get all roles from Auth0 and find Admin
    const roles = await fetchAuth0Roles(accessToken);
    const adminRole = roles.find((r) => r.name === "Admin");
    if (!adminRole) throw new Error("❌ Admin role not found in Auth0");

    // assign role in Auth0
    await assignAuth0Role(user.sub, accessToken, [adminRole.id]);
    console.log("✅ Auth0 role assigned successfully");

    // sync backend role
    await syncBackendRole(user.sub, ["admin"]);
    console.log("✅ Backend role synchronized successfully");

    // 5) Attach school to user
    console.log("🔗 Step 5: Attaching school to user...");
    await addSchoolToUser(user.sub, school._id);
    console.log("✅ School attached to user");

    return school;
  } catch (err) {
    console.error("❌ Error in provisioning flow:", err);
    throw err;
  }
};
