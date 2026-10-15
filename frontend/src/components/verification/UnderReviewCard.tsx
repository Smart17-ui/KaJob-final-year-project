// frontend/src/components/verification/UnderReviewCard.tsx

import { useNavigate } from "react-router-dom";
import {
  ClockIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

type UnderReviewCardProps = {
  role: "CLIENT" | "WORKER";
  status: VerificationStatusResponse | null;
};

const UnderReviewCard = ({ role, status }: UnderReviewCardProps) => {
  const navigate = useNavigate();

  const settingsPath = `/${role.toLowerCase()}/dashboard/settings/verification`;

  const submittedDate = status?.submitted_at
    ? new Date(status.submitted_at).toLocaleDateString("en-ZM", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
        {/* HEADER STRIP */}
        <div className="bg-amber-50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <ClockIcon className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                In review
              </p>
              <p className="mt-0.5 text-sm font-medium text-amber-900">
                This usually takes 24–48 hours
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-8 sm:px-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            We're reviewing your documents
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Thanks for submitting your identity documents. One of our
            admins will review your submission shortly. You'll get an
            email and an in-app notification as soon as it's approved.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Submitted
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {submittedDate ?? "Recently"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              What you can do right now
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Explore your dashboard, notifications, and settings
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Update your profile details at any time
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Check back here for updates
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(settingsPath)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              View verification status
            </button>

            <a
              href="mailto:kajobsupport@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderReviewCard;
