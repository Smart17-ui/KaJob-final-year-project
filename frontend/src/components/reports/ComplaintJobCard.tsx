import {
  ExclamationTriangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import type {
  ReportableJob,
} from "../../shared/types/report";

/* =========================================================
   PROPS
   ========================================================= */

interface ComplaintJobCardProps {
  job: ReportableJob;
  currentRole: "CLIENT" | "WORKER";
  onReport: (job: ReportableJob) => void;
}

/* =========================================================
   STATUS LABEL
   ========================================================= */

const getStatusLabel = (
  status: string,
  statusDisplay?: string
): string => {
  if (statusDisplay) {
    return statusDisplay;
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

/* =========================================================
   STATUS STYLE
   ========================================================= */

const getStatusClasses = (
  status: string
): string => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "ASSIGNED":
      return "bg-purple-100 text-purple-700";

    case "AWAITING_CONFIRMATION":
      return "bg-yellow-100 text-yellow-700";

    case "CANCELLED":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================================================
   COMPLAINT JOB CARD
   ========================================================= */

export default function ComplaintJobCard({
  job,
  currentRole,
  onReport,
}: ComplaintJobCardProps) {
  const otherParty = job.other_party;

  const otherPartyLabel =
    currentRole === "CLIENT"
      ? "Worker"
      : "Client";

  const reportButtonLabel =
    currentRole === "CLIENT"
      ? "Report Worker"
      : "Report Client";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      {/* =====================================================
          JOB HEADER
      ===================================================== */}

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {job.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Job #{job.id}
          </p>
        </div>

        <span
          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
            job.status
          )}`}
        >
          {getStatusLabel(
            job.status,
            job.status_display
          )}
        </span>
      </div>

      {/* =====================================================
          OTHER PARTY
      ===================================================== */}

      <div className="mt-5 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <UserCircleIcon className="h-6 w-6 text-gray-500" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {otherPartyLabel}
            </p>

            {otherParty ? (
              <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                {otherParty.full_name}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-gray-500">
                No assigned {otherPartyLabel.toLowerCase()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          WARNING
      ===================================================== */}

      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500">
        <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />

        <p>
          Only submit a complaint if you have a genuine
          issue related to this job.
        </p>
      </div>

      {/* =====================================================
          REPORT BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => onReport(job)}
        disabled={!otherParty}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <ExclamationTriangleIcon className="h-5 w-5" />

        {reportButtonLabel}
      </button>
    </div>
  );
}