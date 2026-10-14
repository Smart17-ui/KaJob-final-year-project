// frontend/src/api/client.ts

import API_BASE_URL from "@/api/config";

let isRedirecting = false;

const handleUnauthorized = () => {
  if (isRedirecting) return;

  isRedirecting = true;

  // Clear all authentication data
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("selected_role");
  localStorage.removeItem("user");

  // Redirect to the login page (only if not already there)
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = localStorage.getItem("access_token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  // Only treat a 401 as "session expired" when we actually sent a token.
  // An unauthenticated request hitting a protected endpoint is a normal
  // 401 that the caller should handle -- redirecting on those causes
  // public pages to bounce anonymous visitors to /login.
  if (response.status === 401 && token) {
    handleUnauthorized();

    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.detail ||
        "Something went wrong. Please try again."
    );
  }

  return data;
};

export default apiClient;
