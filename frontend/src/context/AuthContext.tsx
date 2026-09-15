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

interface LoginResult {
  user: User;
  redirectTo: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<LoginResult>;

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
     LOGIN (auto-detect role)
  ========================= */

  async function login(
    email: string,
    password: string
  ): Promise<LoginResult> {
    // ✅ Send only email + password — backend auto-detects role
    const data = await loginUser({
      email,
      password,
    });

    // ✅ Save auth with the auto-detected role
    saveAuth(
      data.tokens.access,
      data.tokens.refresh,
      data.user,
      data.detected_role
    );

    setUser(data.user);
    setIsLoggedIn(true);

    // ✅ Return redirect target from backend
    return {
      user: data.user,
      redirectTo: data.redirect_to,
    };
  }

  /* =========================
     LOGOUT
  ========================= */

  async function logout(): Promise<void> {
    const refreshToken =
      getRefreshToken();

    try {
      if (refreshToken) {
        await logoutUser(
          refreshToken
        );
      }
    } finally {
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
