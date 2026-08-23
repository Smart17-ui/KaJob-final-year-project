import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  User,
  ApiFieldErrors,
} from "@/shared/types";

const API_URL =
  "http://127.0.0.1:8000/api";

/* =========================
   API ERROR
========================= */

export class ApiError extends Error {
  status: number;
  fields: ApiFieldErrors;

  constructor(
    status: number,
    fields: ApiFieldErrors
  ) {
    const firstError = Object.entries(
      fields
    ).find(
      ([key]) =>
        key !== "error" &&
        key !== "detail"
    )?.[1];

    const message =
      fields.error ||
      fields.detail ||
      (Array.isArray(firstError)
        ? firstError[0]
        : firstError) ||
      "Something went wrong.";

    super(String(message));

    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
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
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
      }
    );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "NETWORK ERROR:",
      error
    );

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
  return apiRequest<RegisterResponse>(
    "/auth/register/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================
   LOGIN
========================= */

export async function loginUser(
  payload: LoginPayload
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================
   LOGOUT
========================= */

export async function logoutUser(
  refreshToken: string
): Promise<void> {
  await apiRequest(
    "/auth/logout/",
    {
      method: "POST",
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    }
  );
}

/* =========================
   CURRENT USER
========================= */

export function getCurrentUser(): User | null {
  const user =
    localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

/* =========================
   ACCESS TOKEN
========================= */

export function getAccessToken(): string | null {
  return localStorage.getItem(
    "access_token"
  );
}

/* =========================
   REFRESH TOKEN
========================= */

export function getRefreshToken(): string | null {
  return localStorage.getItem(
    "refresh_token"
  );
}

/* =========================
   AUTHENTICATION CHECK
========================= */

export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem(
      "access_token"
    )
  );
}

/* =========================
   CLEAR LOCAL AUTH
========================= */

export function clearAuth(): void {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "refresh_token"
  );

  localStorage.removeItem("user");
}