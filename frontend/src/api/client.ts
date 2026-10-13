// frontend/src/api/client.ts

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://kajob-final-year-project.onrender.com/api";

let isRedirecting = false;

const handleUnauthorized = () => {
  if (isRedirecting) return;

  isRedirecting = true;

  // Clear all authentication data
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("selected_role");
  localStorage.removeItem("user");

  // Redirect to the public home page
  if (window.location.pathname !== "/") {
    window.location.href = "/";
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

  // JWT expired or invalid
  if (response.status === 401) {
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