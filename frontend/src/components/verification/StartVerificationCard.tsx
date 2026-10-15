// frontend/src/components/verification/StartVerificationCard.tsx

import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

type StartVerificationCardProps = {
  role: "CLIENT" | "WORKER";
  status: VerificationStatusResponse | null;
};

const StartVerificationCard = ({
  role,
  status,
}: StartVerificationCardProps) => {
  const navigate = useNavigate();

  const verificationPath = `/${role.toLowerCase()}/dashboard/settings/verification`;

  const emailVerified = status?.email_verified === true;
  const phoneVerified = status?.phone_verified === true;
  const identityVerified = status?.verification_status === "VERIFIED";

  const completed = [emailVerified, phoneVerified, identityVerified].filter(
    Boolean
  ).length;
  const progress = Math.round((completed / 3) * 100);

  const isResume = completed > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-10 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
              <ShieldCheckIcon className="h-6 w-6 text-emerald-300" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Account setup
            </p>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isResume
              ? "Finish setting up your account"
              : "Set up your account to get started"}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Verification unlocks the full KaJob experience — posting jobs,
            applying to work, receiving reviews, and building trust with
            other users. It only takes a few minutes.
          </p>

          <button
            type="button"
            onClick={() => navigate(verificationPath)}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isResume ? "Continue verification" : "Start verification"}
            <span className="text-base">→</span>
          </button>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Your progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete all three steps to fully verify your account.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {progress}%
          </span>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StepCard
            label="Email"
            description="Confirm your email address"
            done={emailVerified}
          />
          <StepCard
            label="Phone"
            description="Verify your phone number with a one-time code"
            done={phoneVerified}
          />
          <StepCard
            label="Identity"
            description="Upload your NRC or passport for review"
            done={identityVerified}
          />
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   STEP CARD
--------------------------------------------------------- */

type StepCardProps = {
  label: string;
  description: string;
  done: boolean;
};

const StepCard = ({ label, description, done }: StepCardProps) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        {done ? (
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        )}

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              done
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {done ? "Completed" : "Not verified"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StartVerificationCard;
