// components/Schoolpage/CreateSchoolForm/services/schoolService.js

// -------------------------------------------------
// Config
// -------------------------------------------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://shobackendv2-production.up.railway.app";

const AUTH0_DOMAIN =
  process.env.NEXT_PUBLIC_AUTH0_DOMAIN ||
  "dev-q3l2f3kyx1zmv3iq.us.auth0.com";

// -------------------------------------------------
// 0. Auth0 Helpers
// -------------------------------------------------

export const getAccessToken = async () => {
  const res = await fetch("/api/getAccessToken", { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch Auth0 access token");

  const data = await res.json();
  if (!data?.accessToken) {
    throw new Error("No accessToken returned from API route");
  }

  return data.accessToken.trim();
};

export const fetchAuth0Roles = async (token) => {
  if (!token) throw new Error("No token provided to fetchAuth0Roles");

  const res = await fetch(`https://${AUTH0_DOMAIN}/api/v2/roles`, {
    headers: { Authorization: `Bearer ${token.trim()}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Auth0 roles: ${await res.text()}`);
  }

  return res.json();
};

export const assignAuth0Role = async (userId, token, roleIds) => {
  const res = await fetch(
    `https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
      userId
    )}/roles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ roles: roleIds }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to assign Auth0 role: ${await res.text()}`);
  }

  return true; // Auth0 returns 204
};

// -------------------------------------------------
// 1. Cloudinary Upload
// -------------------------------------------------

export const uploadFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "w1ofo4vi"
  );

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "chameleon-techie";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.secure_url;
};

// -------------------------------------------------
// 2. School Payload (SINGLE SOURCE OF TRUTH)
// -------------------------------------------------

const buildSchoolPayload = (formData, user, logoUrl) => ({
  schoolName: formData.schoolName,
  schoolEmail: formData.schoolEmail,
  logo: logoUrl || "",

  line1: formData.addressLine1 ?? "",
  line2: formData.addressLine2 ?? "",

  city: formData.city,
  province: formData.province,
  country: formData.country,
  postalCode: formData.postalCode,

  latitude: formData.location?.lat ?? null,
  longitude: formData.location?.lng ?? null,

  website: formData.website || "",
  facebook: formData.facebook || "",
  linkedin: formData.linkedin || "",
  tiktok: formData.tiktok || "",

  theme: formData.theme, // backend expects Hash
  status: "active",

  adminUsers: formData.adminUsers || [],

  // ✅ ownership & audit (ALWAYS present)
  user_id: user?.sub,
  user_email: user?.email,
  school_created_by: user?.email,
});

// -------------------------------------------------
// 3. Create School
// -------------------------------------------------

export const createSchool = async (formData, user, logoUrl) => {
  const payload = buildSchoolPayload(formData, user, logoUrl);

  const res = await fetch(`${API_BASE}/api/v1/schools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`School creation failed: ${await res.text()}`);
  }

  const json = await res.json();
  const school = json?.data?.school || json?.school || json?.data;

  if (!school?._id) {
    throw new Error("School ID missing from response");
  }

  return school;
};

// -------------------------------------------------
// 4. Backend User Helpers
// -------------------------------------------------

export const syncBackendRole = async (auth0Id, roles) => {
  const normalized = roles.map(
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
    throw new Error(`Backend role sync failed: ${await res.text()}`);
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
    throw new Error(`Add school failed: ${await res.text()}`);
  }

  return res.json();
};

// -------------------------------------------------
// 5. Full Provisioning Flow
// -------------------------------------------------

export const provisionNewSchool = async (formData, user, token) => {
  // 1. Upload logo
  let logoUrl = "";
  if (formData.logo) {
    logoUrl = await uploadFileToCloudinary(formData.logo);
  }

  // 2. Create school
  const school = await createSchool(formData, user, logoUrl);

  // 3. Ensure user exists
  const userRes = await fetch(`${API_BASE}/api/v1/users`, {
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

  if (!userRes.ok && userRes.status !== 422) {
    throw new Error(await userRes.text());
  }

  // 4. Assign Admin role
  const accessToken = token || (await getAccessToken());
  const roles = await fetchAuth0Roles(accessToken);
  const adminRole = roles.find((r) => r.name === "Admin");

  if (!adminRole) throw new Error("Admin role not found in Auth0");

  await assignAuth0Role(user.sub, accessToken, [adminRole.id]);
  await syncBackendRole(user.sub, ["admin"]);

  // 5. Attach school
  await addSchoolToUser(user.sub, school._id);

  return school;
};
