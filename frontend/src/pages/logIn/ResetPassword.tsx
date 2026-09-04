import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";

import { ApiError, resetPassword } from "@/api/auth/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
   * Get the token from the URL.
   *
   * Example:
   * /reset-password?token=eyJhbGciOiJIUzI1NiIs...
   */
  const rawToken = searchParams.get("token");

  /*
   * Workaround for quoted-printable encoding.
   *
   * If the token somehow arrives with "=3D" instead of "=",
   * convert it back to "=" before sending it to Django.
   *
   * NOTE:
   * We only replace "=3D", which is the MIME encoding for "=".
   */
  const token = rawToken
    ? rawToken.replace(/=3D/g, "=")
    : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check token
    if (!token) {
      setError(
        "This password reset link is invalid or missing a reset token."
      );
      return;
    }

    // Check password
    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Check confirmation
    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("Reset token being sent:", token);

      const response = await resetPassword({
        token: token,
        new_password: password,
      });

      setSuccess(
        response.message || "Password reset successfully."
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("PASSWORD RESET ERROR:", error);

      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to reset your password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft size={18} />
            Back to login
          </Link>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Lock
                className="text-green-600"
                size={26}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>

            <p className="text-gray-500 mt-2 text-sm">
              Create a new password for your account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="text-green-600 shrink-0"
                  size={20}
                />

                <div>
                  <p className="text-sm font-medium text-green-800">
                    Password reset successfully
                  </p>

                  <p className="text-sm text-green-700 mt-1">
                    Redirecting you to login...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* New password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Password must be at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Resetting..."
                  : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}