// src/pages/verifyEmail/VerifyEmailPage.tsx

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import apiClient from "@/api/client";
import { saveAuth } from "@/shared/auth";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email…");
  const [failed, setFailed] = useState(false);
  const ranOnce = useRef(false);

  useEffect(() => {
    // Guard against React 18 StrictMode double-invoking the effect
    if (ranOnce.current) return;
    ranOnce.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setFailed(true);
      setMessage("Verification token is missing from the URL.");
      return;
    }

    apiClient("/auth/verify-email/", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((res: any) => {
        // Auto-login: persist tokens + user from the verify response.
        if (res?.tokens?.access && res?.tokens?.refresh && res?.user) {
          saveAuth(
            res.tokens.access,
            res.tokens.refresh,
            res.user,
            res.detected_role || "CLIENT"
          );

          const target =
            res.redirect_to || "/client/dashboard/settings/verification";

          // Full reload → AuthProvider remounts → reads the
          // freshly-saved user + tokens → ProtectedDashboard
          // sees the client and renders the settings page.
          window.location.replace(target);
          return;
        }

        // No tokens in the response → fall back to error state.
        setFailed(true);
        setMessage(
          res?.message ||
            "Email verified, but we couldn't sign you in. Please log in."
        );
      })
      .catch((err: any) => {
        setFailed(true);
        setMessage(
          err?.response?.data?.error ||
            err?.response?.data?.detail ||
            err?.message ||
            "Verification failed. The link may be expired or already used."
        );
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        {!failed && (
          <>
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your email
            </h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}

        {failed && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification failed
            </h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
