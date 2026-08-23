import type { User } from "@/shared/types";

/* =========================
   SAVE AUTHENTICATION
========================= */

export function saveAuth(
  access: string,
  refresh: string,
  user: User
): void {
  localStorage.setItem(
    "access_token",
    access
  );

  localStorage.setItem(
    "refresh_token",
    refresh
  );

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
}

/* =========================
   GET ACCESS TOKEN
========================= */

export function getAccessToken(): string | null {
  return localStorage.getItem(
    "access_token"
  );
}

/* =========================
   GET REFRESH TOKEN
========================= */

export function getRefreshToken(): string | null {
  return localStorage.getItem(
    "refresh_token"
  );
}

/* =========================
   GET CURRENT USER
========================= */

export function getCurrentUser(): User | null {
  const user = localStorage.getItem("user");

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
   CHECK LOGIN STATUS
========================= */

export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem("access_token")
  );
}

/* =========================
   CLEAR AUTH
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