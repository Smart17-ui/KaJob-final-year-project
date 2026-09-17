// frontend/src/api/auth/auth.tsx

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ApiFieldErrors,
} from "@/shared/types";

import { getAccessToken } from "@/shared/auth";

/* =========================
   API URL
========================= */

const API_URL = "http://127.0.0.1:8000/api";

/* =========================
   API ERROR
========================= */

export class ApiError extends Error {
  status: number;
  fields: ApiFieldErrors;
  retryAfter: number | null;

  constructor(
    status: number,
    fields: ApiFieldErrors = {},
    retryAfter: number | null = null
  ) {
    const firstError = Object.entries(fields).find(
      ([key, value]) =>
        key !== "error" && key !== "detail" && value !== undefined
    )?.[1];

    const message =
      fields.error ||
      fields.detail ||
      (Array.isArray(firstError) ? firstError[0] : firstError) ||
      "Something went wrong.";

    super(String(message));

    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.retryAfter = retryAfter;
  }
}

/* =========================
   API REQUEST
========================= */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const accessToken = getAccessToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return data as T;
    }

    const retryAfterHeader = response.headers.get("Retry-After");

    let retryAfter: number | null = null;

    if (retryAfterHeader) {
      const parsed = Number(retryAfterHeader);
      if (Number.isFinite(parsed) && parsed >= 0) {
        retryAfter = parsed;
      }
    }

    if (response.status === 429) {
      throw new ApiError(
        429,
        {
          ...data,
          error:
            data?.error ||
            data?.detail ||
            "Too many login attempts.",
        },
        retryAfter
      );
    }

    throw new ApiError(response.status, data, retryAfter);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("NETWORK ERROR:", error);

    throw new Error(
      "Unable to connect to the server. Make sure Django is running."
    );
  }
}

/* =========================
   REGISTER
========================= */

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   LOGIN (auto-detects role)
========================= */

export async function loginUser(
  payload: LoginPayload
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   SWITCH ROLE
========================= */

export async function switchRole(
  role: string
): Promise<{
  message: string;
  user: any;
  tokens: { access: string; refresh: string };
  current_role: string;
  available_roles: string[];
}> {
  return apiRequest("/auth/switch-role/", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

/* =========================
   ADD ROLE
========================= */

export async function addRole(
  role: string
): Promise<{
  message: string;
  user: any;
  tokens: { access: string; refresh: string };
  is_verified: boolean;
  available_roles: string[];
}> {
  return apiRequest("/auth/add-role/", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

/* =========================
   LOGOUT
========================= */

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiRequest("/auth/logout/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

/* =========================
   CHANGE PASSWORD
========================= */

export async function changePassword(payload: {
  old_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/change-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   FORGOT PASSWORD
========================= */

export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/* =========================
   RESET PASSWORD
========================= */

export async function resetPassword(payload: {
  token: string;
  new_password: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
