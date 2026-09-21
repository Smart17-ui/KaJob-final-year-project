const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

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