const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function apiFetch(
  url: string,
  options: { headers?: Record<string, string>; [key: string]: any } = {}
) {
  console.log("🌐 API Request:", { url, options });

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      // Remove credentials to avoid CORS issue
      ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("❌ API Response Error:", { status: res.status, data });
      throw new Error(data.message || `API request failed: ${res.status}`);
    }

    console.log("✅ API Response:", data);
    return data;
  } catch (err) {
    console.error("❌ API Fetch Error:", err);
    throw err;
  }
}

export async function getOnboardingStatus(userId) {
  const encodedId = encodeURIComponent(userId);
  console.log("📄 Getting onboarding status for user:", userId);
  return apiFetch(`${API_BASE}/users/${encodedId}/onboarding_status`);
}

export async function completeStep(userId: string, stepName: string, metadata: any = {}) {
  const encodedId = encodeURIComponent(userId);
  console.log(`✅ Completing step "${stepName}" for user:`, userId, "Metadata:", metadata);

  return apiFetch(`${API_BASE}/users/${encodedId}/onboarding_status/complete_step`, {
    method: "POST", // Must be POST!
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step_name: stepName, metadata }),
  });
}

export async function skipStep(userId, stepName, reason = "") {
  const encodedId = encodeURIComponent(userId);
  console.log(`⏭ Skipping step "${stepName}" for user:`, userId, "Reason:", reason);
  return apiFetch(`${API_BASE}/users/${encodedId}/onboarding_status/skip_step`, {
    method: "POST",
    body: JSON.stringify({ step_name: stepName, reason }),
  });
}

export async function resetOnboarding(userId, reason = "Reset from Next.js app") {
  const encodedId = encodeURIComponent(userId);
  console.log("🔄 Resetting onboarding for user:", userId, "Reason:", reason);
  return apiFetch(`${API_BASE}/users/${encodedId}/onboarding_status/reset`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function updateOnboardingStatus(userId, updates) {
  const encodedId = encodeURIComponent(userId);
  console.log("✏️ Updating onboarding status for user:", userId, updates);
  return apiFetch(`${API_BASE}/users/${encodedId}/onboarding_status`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
export async function fetchSchoolGrades(schoolId: string) {

  const response = await fetch(`${API_BASE}/schools/${schoolId}/grades`, {
    headers: {

      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch grades');
  }
  
  return response.json();
}

export async function bulkUploadLearners(data: any) {

  const response = await fetch(`${API_BASE}/learners/bulk_upload`, {
    method: 'POST',
    headers: {

      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload learners');
  }
  
  return response.json();
}
export const onboardingService = {
  getOnboardingStatus,
  completeStep,
  skipStep,
  resetOnboarding,
  updateOnboardingStatus,
  fetchSchoolGrades,
  bulkUploadLearners
};
