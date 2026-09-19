import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

import {
  getStatusClasses,
  getStatusLabel,
} from "./verificationHelpers";

type VerificationStatusCardProps = {
  verification: VerificationStatusResponse;
};

const VerificationStatusCard = ({
  verification,
}: VerificationStatusCardProps) => {
  const emailVerified =
    verification.email_verified;

  const phoneVerified =
    verification.phone_verified;

  const identityVerified =
    verification.verification_status ===
    "VERIFIED";

  const completedSteps = [
    emailVerified,
    phoneVerified,
    identityVerified,
  ].filter(Boolean).length;

  const progress = Math.round(
    (completedSteps / 3) * 100
  );

  const identityStatus =
    verification.verification_status ||
    "NOT_SUBMITTED";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Verification status
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track your email, phone, and identity verification progress.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {progress}% complete
          </span>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Overall progress
            </span>

            <span className="text-xs font-semibold text-slate-700">
              {completedSteps}/3
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <VerificationStep
            label="Email"
            verified={emailVerified}
            status={
              emailVerified
                ? "Verified"
                : "Not verified"
            }
          />

          <VerificationStep
            label="Phone"
            verified={phoneVerified}
            status={
              phoneVerified
                ? "Verified"
                : "Not verified"
            }
          />

          <IdentityStatusStep
            status={identityStatus}
          />
        </div>

        {verification.message && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Verification update
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {verification.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

type VerificationStepProps = {
  label: string;
  verified: boolean;
  status: string;
};

const VerificationStep = ({
  label,
  verified,
  status,
}: VerificationStepProps) => {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        {verified ? (
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-slate-400" />
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">
            {label}
          </p>

          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              verified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

type IdentityStatusStepProps = {
  status: string;
};

const IdentityStatusStep = ({
  status,
}: IdentityStatusStepProps) => {
  const isVerified =
    status === "VERIFIED";

  const isPending =
    status === "PENDING";

  const isUnderReview =
    status === "UNDER_REVIEW";

  const isRejected =
    status === "REJECTED";

  const isExpired =
    status === "EXPIRED";

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        {isVerified ? (
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : isPending || isUnderReview ? (
          <ClockIcon className="h-5 w-5 shrink-0 text-amber-600" />
        ) : isRejected || isExpired ? (
          <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-slate-400" />
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">
            Identity
          </p>

          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClasses(
              status
            )}`}
          >
            {getStatusLabel(status)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusCard;