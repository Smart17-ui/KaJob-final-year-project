// frontend/src/shared/auth.tsx

import type { User, RoleValue } from "@/shared/types";

/* =========================
   SAVE AUTHENTICATION
========================= */

/**
 * Save authentication data to localStorage.
 * 
 * @param access - JWT access token
 * @param refresh - JWT refresh token
 * @param user - User object
 * @param selectedRole - Currently active role (WORKER / CLIENT / ADMIN)
 */
export function saveAuth(
  access: string,
  refresh: string,
  user: User,
  selectedRole: string  // 🆕 accepts any string (for ADMIN role too)
): void {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("selected_role", selectedRole);
}

/* =========================
   GET ACCESS TOKEN
========================= */

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

/* =========================
   GET REFRESH TOKEN
========================= */

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
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
   GET SELECTED ROLE
========================= */

/**
 * Get the current active role.
 * Now returns any string (WORKER / CLIENT / ADMIN).
 */
export function getSelectedRole(): string | null {
  return localStorage.getItem("selected_role");
}

/* =========================
   SET SELECTED ROLE
========================= */

export function setSelectedRole(role: string): void {
  localStorage.setItem("selected_role", role);
}

/* =========================
   UPDATE TOKENS (after role switch)
========================= */

/**
 * Update tokens after a role switch.
 */
export function updateTokens(
  access: string,
  refresh: string,
  newRole: string
): void {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("selected_role", newRole);
}

/* =========================
   CHECK LOGIN STATUS
========================= */

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem("access_token"));
}

/* =========================
   CLEAR AUTH
========================= */

export function clearAuth(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("selected_role");
}
