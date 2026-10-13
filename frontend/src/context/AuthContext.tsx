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

import apiClient from "@/api/client";

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

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

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

  async function login(
    email: string,
    password: string
  ): Promise<LoginResult> {
    const data = await loginUser({
      email,
      password,
    });

    saveAuth(
      data.tokens.access,
      data.tokens.refresh,
      data.user,
      data.detected_role
    );

    setUser(data.user);
    setIsLoggedIn(true);

    return {
      user: data.user,
      redirectTo: data.redirect_to,
    };
  }

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

  async function refreshUser(): Promise<void> {
    try {
      const data = (await apiClient("/auth/me/")) as {
        user: User;
      };

      // Also persist the new user to localStorage so it
      // survives a page reload.
      try {
        const raw = localStorage.getItem("kajob_auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.user = data.user;
          localStorage.setItem(
            "kajob_auth",
            JSON.stringify(parsed)
          );
        }
      } catch (storageErr) {
        // localStorage format differs — swallow and continue
        console.warn(
          "[refreshUser] localStorage update failed:",
          storageErr
        );
      }

      setUser(data.user);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

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
