const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("Backend health check failed");
  }
  return response.json();
}

export async function getDemoScenarios() {
  const response = await fetch(`${API_BASE_URL}/api/demo-scenarios`);
  if (!response.ok) {
    throw new Error("Failed to fetch demo scenarios");
  }
  return response.json();
}

export async function generateCart(payload) {
  const response = await fetch(`${API_BASE_URL}/api/generate-cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to generate cart");
  }
  return response.json();
}

export async function getFamilyProfiles() {
  const response = await fetch(`${API_BASE_URL}/api/family-profiles`);
  if (!response.ok) {
    throw new Error("Failed to fetch family profiles");
  }
  return response.json();
}
