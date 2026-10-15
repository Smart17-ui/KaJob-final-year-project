// frontend/src/components/verification/VerificationBanner.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-700" />
        </div>

        <div>
          <p className="text-sm font-semibold text-amber-900">
            Your account isn't verified yet
          </p>
          <p className="mt-0.5 text-xs leading-5 text-amber-700">
            {role === "CLIENT"
              ? "Verify your identity to post jobs and hire workers."
              : "Verify your identity to apply for jobs and get hired."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => navigate(verificationPath)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
        >
          Continue verification
          <span>→</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-700 transition hover:bg-amber-100"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
