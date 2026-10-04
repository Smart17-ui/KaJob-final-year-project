import { useEffect, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import apiClient from "@/api/client";
import { getUserProfile, UserProfile } from "@/api/profile";

const AccountSection = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUserProfile();
        setProfile(response.profile);
      } catch (err) {
        console.error("Failed to load account information:", err);
        setError("Unable to load your account information.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError("");

      await apiClient("/auth/logout/", {
        method: "POST",
      });

      localStorage.removeItem("access_token");

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatRole = (role: string) => {
    return role
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-600">
          {error || "Unable to load your account information."}
        </p>
      </div>
    );
  }

  const user = profile.user;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and account access.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Personal Information */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Basic information associated with your account.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* First Name */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  First name
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {user.first_name || "Not provided"}
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-400">
              Read-only
            </span>
          </div>

          {/* Last Name */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Last name
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {user.last_name || "Not provided"}
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-400">
              Read-only
            </span>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Account Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Information about your KaJob account.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Account Status */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Account status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {formatStatus(user.account_status)}
                  </span>

                  {user.account_status === "ACTIVE" && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-400">
              Read-only
            </span>
          </div>

          {/* Current Role */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Current role
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatRole(user.role_display)}
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-400">
              Read-only
            </span>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Member since
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-400">
              Read-only
            </span>
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Account Actions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your current session.
          </p>
        </div>

        <div className="px-6 py-5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />

            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="overflow-hidden rounded-xl border border-red-200 bg-white">
        <div className="border-b border-red-100 bg-red-50/50 px-6 py-5">
          <h2 className="text-base font-semibold text-red-700">
            Danger Zone
          </h2>
          <p className="mt-1 text-sm text-red-600/80">
            These actions affect your entire KaJob account.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-lg border border-dashed border-red-200 bg-red-50/30 p-4">
            <p className="text-sm text-gray-600">
              Account deactivation and deletion are currently unavailable.
              These actions will be added once the corresponding backend
              functionality is implemented.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountSection;