// src/pages/verifyEmail/VerifyEmailPage.tsx

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import apiClient from "@/api/client";

type Status = "verifying" | "success" | "error";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("Verifying your email…");
  const ranOnce = useRef(false);

  useEffect(() => {
    // Guard against React 18 StrictMode double-invoking the effect
    if (ranOnce.current) return;
    ranOnce.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from the URL.");
      return;
    }

    apiClient("/auth/verify-email/", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((res: any) => {
        setStatus("success");
        setMessage(
          res?.message || "Your email has been verified successfully!"
        );
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.error ||
            err?.response?.data?.detail ||
            err?.message ||
            "Verification failed. The link may be expired or already used."
        );
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your email
            </h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Email verified
            </h2>
            <p className="text-gray-500">{message}</p>
            <p className="text-xs text-gray-400 mt-4">
              Redirecting to login…
            </p>
          </>
        )}

        {status === "error" && (
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
