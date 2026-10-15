// frontend/src/components/verification/RejectedCard.tsx

import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import type { VerificationStatusResponse } from "@/api/verification";

type RejectedCardProps = {
  role: "CLIENT" | "WORKER";
  status: VerificationStatusResponse | null;
};

const RejectedCard = ({ role, status }: RejectedCardProps) => {
  const navigate = useNavigate();

  const verificationPath = `/${role.toLowerCase()}/dashboard/settings/verification`;

  const reason =
    status?.rejection_reason ||
    "We could not verify your documents. Please review the requirements and try again.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
        {/* HEADER STRIP */}
        <div className="bg-red-50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                Verification unsuccessful
              </p>
              <p className="mt-0.5 text-sm font-medium text-red-900">
                You can try again — nothing is locked permanently
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-8 sm:px-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            We couldn't verify your identity
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Our team reviewed your submission and was unable to approve it.
            Please read the reason below and resubmit with corrected
            information or clearer documents.
          </p>

          {/* REASON */}
          <div className="mt-6 rounded-2xl border-l-4 border-red-500 bg-red-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Reason from the reviewer
            </p>
            <p className="mt-2 text-sm leading-6 text-red-900">{reason}</p>
          </div>

          {/* WHAT TO FIX */}
          <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Common things to check
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Is the photo blurry, dark, or cropped?
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Does the NRC number on the card match what you typed?
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Is the document still valid and clearly visible?
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Did you upload both sides of your NRC?
              </li>
            </ul>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(verificationPath)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Resubmit verification
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

export default RejectedCard;
