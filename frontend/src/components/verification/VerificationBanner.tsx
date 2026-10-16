// frontend/src/components/verification/VerificationBanner.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type VerificationBannerProps = {
  role: "CLIENT" | "WORKER";
};

const VerificationBanner = ({ role }: VerificationBannerProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const verificationPath = `/${role.toLowerCase()}/dashboard/settings/verification`;

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 shadow-sm">
          <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Complete your identity verification
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {role === "CLIENT"
              ? "Verify your account to post jobs and hire with confidence."
              : "Verify your account to apply for jobs and build trust with clients."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:shrink-0 sm:self-auto">
        <button
          type="button"
          onClick={() => navigate(verificationPath)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Verify identity
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss verification reminder"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
