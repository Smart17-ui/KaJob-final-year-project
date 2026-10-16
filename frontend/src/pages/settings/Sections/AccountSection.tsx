import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { deactivateAccount, deleteAccount, logoutUser } from "@/api/auth/auth";
import { getUserProfile, UserProfile } from "@/api/profile";
import { clearAuth, getRefreshToken, getSelectedRole } from "@/shared/auth";

const AccountSection = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [accountAction, setAccountAction] = useState<"deactivate" | "delete" | null>(null);
  const [actionPassword, setActionPassword] = useState("");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [actionError, setActionError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

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

      const refreshToken = getRefreshToken();
      if (refreshToken) await logoutUser(refreshToken);
      clearAuth();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const closeAccountDialog = () => {
    if (submittingAction) return;
    setAccountAction(null);
    setActionPassword("");
    setDeactivationReason("");
    setDeleteConfirmation("");
    setActionError("");
  };

  const finishAccountAction = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch (logoutError) {
        // The account action has already succeeded; still clear local credentials.
        console.warn("Could not revoke the session after account action:", logoutError);
      }
    }
    clearAuth();
    navigate("/login", { replace: true });
  };

  const submitAccountAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accountAction) return;

    setSubmittingAction(true);
    setActionError("");
    try {
      if (accountAction === "deactivate") {
        await deactivateAccount({
          password: actionPassword,
          reason: deactivationReason,
        });
      } else {
        await deleteAccount({
          password: actionPassword,
          confirmation: "DELETE",
        });
      }
      await finishAccountAction();
    } catch (actionFailure) {
      setActionError(
        actionFailure instanceof Error
          ? actionFailure.message
          : "The account action could not be completed. Please try again."
      );
    } finally {
      setSubmittingAction(false);
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
  const currentRole = getSelectedRole() ?? (user.is_worker ? "WORKER" : "CLIENT");

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
          <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
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
          <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
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
          <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
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
          <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <UserCircleIcon className="h-5 w-5 text-gray-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Current role
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatRole(currentRole)}
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-400">
              Read-only
            </span>
          </div>

          {/* Member Since */}
          <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
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
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Deactivate account</h3>
                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  Temporarily close your account. You can reactivate it by signing in again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setAccountAction("deactivate"); setActionError(""); }}
                className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
              >
                Deactivate account
              </button>
            </div>

            <div className="flex flex-col gap-3 border-t border-red-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-700">Delete account</h3>
                <p className="mt-1 max-w-xl text-sm text-gray-500">
                  Permanently close your account and anonymize your personal details. This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setAccountAction("delete"); setActionError(""); }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </section>

      {accountAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-action-title"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6"
          >
            <h2 id="account-action-title" className="text-lg font-semibold text-gray-900">
              {accountAction === "deactivate" ? "Deactivate your account?" : "Delete your account?"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {accountAction === "deactivate"
                ? "You will be signed out. Signing in again will reactivate your account."
                : "Your account will be soft-deleted and personal details anonymized. This action cannot be undone."}
            </p>

            {actionError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>
            )}

            <form onSubmit={submitAccountAction} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Confirm with your password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={actionPassword}
                  onChange={(event) => setActionPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>

              {accountAction === "deactivate" ? (
                <label className="block text-sm font-medium text-gray-700">
                  Reason for deactivation
                  <textarea
                    required
                    minLength={3}
                    maxLength={1000}
                    value={deactivationReason}
                    onChange={(event) => setDeactivationReason(event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
              ) : (
                <label className="block text-sm font-medium text-gray-700">
                  Type DELETE to confirm
                  <input
                    required
                    value={deleteConfirmation}
                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeAccountDialog} disabled={submittingAction} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || (accountAction === "delete" && deleteConfirmation !== "DELETE")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingAction ? "Please wait..." : accountAction === "deactivate" ? "Deactivate" : "Delete permanently"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AccountSection;
