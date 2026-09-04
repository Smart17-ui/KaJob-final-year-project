import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

import { ApiError, forgotPassword } from "@/api/auth/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    // Validate email field
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email.trim());

      setMessage(response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        // Hide the backend rate-limit message from the user
        if (error.status === 429) {
          setError(
            "Please wait a little while before requesting another reset link."
          );
          return;
        }

        // Handle other API errors with a friendly message
        setError(
          "We couldn't process your request. Please try again."
        );
      } else {
        // Handle unexpected/network errors
        setError(
          "We couldn't process your request. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        aria-label="Back to login"
      >
        <ArrowLeft size={22} />
      </button>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {/* Mail Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Mail
                  className="text-green-600"
                  size={26}
                />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter the email address associated with your account and
                we'll send you a password reset link.
              </p>
            </div>

            {/* Success Message */}
            {message && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-green-600"
                    size={20}
                  />

                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Check your email
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            {!message && (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}

            {/* Back to Login After Success */}
            {message && (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}