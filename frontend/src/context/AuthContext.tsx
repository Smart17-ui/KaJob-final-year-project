import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@/shared/types";

import {
  loginUser,
  logoutUser,
} from "@/api/auth/auth";

import {
  getCurrentUser,
  getRefreshToken,
  isAuthenticated,
  saveAuth,
  clearAuth,
} from "@/shared/auth";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<User>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/* =========================
   PROVIDER
========================= */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(
      () => getCurrentUser()
    );

  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean>(
      () => isAuthenticated()
    );

  /* =========================
     LOGIN
  ========================= */

  async function login(
    email: string,
    password: string
  ): Promise<User> {
    const data = await loginUser({
      email,
      password,
      role: "CLIENT",
    });

    /*
     * Save authentication data
     * returned by the backend.
     */
    saveAuth(
      data.tokens.access,
      data.tokens.refresh,
      data.user,
      data.selected_role
    );

    setUser(data.user);
    setIsLoggedIn(true);

    return data.user;
  }

  /* =========================
     LOGOUT
  ========================= */

  async function logout(): Promise<void> {
    const refreshToken =
      getRefreshToken();

    try {
      /*
       * Only call the backend logout
       * endpoint if we have a refresh token.
       */
      if (refreshToken) {
        await logoutUser(
          refreshToken
        );
      }
    } finally {
      /*
       * Always clear local authentication,
       * even if the backend logout request fails.
       */
      clearAuth();

      setUser(null);
      setIsLoggedIn(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}