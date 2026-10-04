import { FormEvent, useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import apiClient from "@/api/client";

type PasswordField = "current" | "new" | "confirm";

const SecuritySection = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState<Record<PasswordField, boolean>>({
      current: false,
      new: false,
      confirm: false,
    });

  const [changingPassword, setChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = (field: PasswordField) => {
    setShowPassword((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleChangePassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await apiClient("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setSuccessMessage(
        response?.message ||
          "Your password has been changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to change password:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to change your password. Please try again.";

      setErrorMessage(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const renderPasswordInput = (
    field: PasswordField,
    value: string,
    setValue: (value: string) => void,
    label: string,
    placeholder: string
  ) => {
    const visible = showPassword[field];

    return (
      <div>
        <label
          htmlFor={`${field}-password`}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={`${field}-password`}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            autoComplete={
              field === "current"
                ? "current-password"
                : "new-password"
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />

          <button
            type="button"
            onClick={() => togglePasswordVisibility(field)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            aria-label={
              visible ? `Hide ${label}` : `Show ${label}`
            }
          >
            {visible ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Password & Authentication
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your password and account security.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Change Password */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start gap-4 border-b border-gray-200 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <LockClosedIcon className="h-5 w-5 text-gray-600" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-5 px-6 py-6"
        >
          {renderPasswordInput(
            "current",
            currentPassword,
            setCurrentPassword,
            "Current password",
            "Enter your current password"
          )}

          {renderPasswordInput(
            "new",
            newPassword,
            setNewPassword,
            "New password",
            "Enter your new password"
          )}

          {renderPasswordInput(
            "confirm",
            confirmPassword,
            setConfirmPassword,
            "Confirm new password",
            "Re-enter your new password"
          )}

          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs leading-5 text-gray-500">
              Choose a strong password that you do not use
              elsewhere.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockClosedIcon className="h-4 w-4" />

              {changingPassword
                ? "Updating..."
                : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* Authentication Information */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start gap-4 border-b border-gray-200 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Authentication
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your account is protected by password-based
              authentication.
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-gray-500">
            Keep your password private and avoid using the same
            password across multiple accounts.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SecuritySection;