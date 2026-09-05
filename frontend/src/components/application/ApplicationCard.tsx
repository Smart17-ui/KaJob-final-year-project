import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

import type {
  JobApplication,
} from "../../shared/types/application";

type ApplicationCardProps = {
  application: JobApplication;

  isUpdating: boolean;

  onAccept: (
    applicationId: number
  ) => void;

  onReject: (
    applicationId: number
  ) => void;

  onViewWorker?: (
    application: JobApplication
  ) => void;
};

const ApplicationCard = ({
  application,
  isUpdating,
  onAccept,
  onReject,
  onViewWorker,
}: ApplicationCardProps) => {
  /*
   * =========================
   * WORKER INITIAL
   * =========================
   */

  const workerInitial =
    application.worker_name
      .charAt(0)
      .toUpperCase();

  /*
   * =========================
   * FORMAT DATE
   * =========================
   */

  const appliedDate =
    new Date(
      application.applied_at
    ).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  /*
   * =========================
   * STATUS
   * =========================
   */

  const renderStatus = () => {
    if (
      application.status ===
      "PENDING"
    ) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

          Pending
        </span>
      );
    }

    if (
      application.status ===
      "ACCEPTED"
    ) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

          Accepted
        </span>
      );
    }

    if (
      application.status ===
      "REJECTED"
    ) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        {application.status_display}
      </span>
    );
  };

  return (
    <article className="p-5 transition-colors hover:bg-slate-50">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* =========================
            WORKER INFORMATION
        ========================= */}

        <div className="flex min-w-0 items-start gap-4">

          {/* AVATAR */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50">
            <span className="text-base font-bold text-green-700">
              {workerInitial}
            </span>
          </div>

          {/* DETAILS */}

          <div className="min-w-0">

            <h3 className="truncate text-sm font-semibold text-slate-900">
              {application.worker_name}
            </h3>

            {/* JOB */}

            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">

              <BriefcaseIcon className="h-4 w-4 shrink-0 text-slate-400" />

              <span className="truncate">
                {application.job_title}
              </span>

            </div>

            {/* DATE */}

            <p className="mt-2 text-xs text-slate-400">
              Applied {appliedDate}
            </p>

          </div>

        </div>

        {/* =========================
            STATUS + ACTIONS
        ========================= */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* STATUS */}

          {renderStatus()}

          {/* VIEW WORKER */}

          {onViewWorker && (
            <button
              type="button"
              onClick={() =>
                onViewWorker(
                  application
                )
              }
              disabled={isUpdating}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View Worker
            </button>
          )}

          {/* ACCEPT / REJECT */}

          {application.status ===
            "PENDING" && (
            <div className="flex gap-2">

              {/* ACCEPT */}

              <button
                type="button"
                onClick={() =>
                  onAccept(
                    application.id
                  )
                }
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isUpdating ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}

                {isUpdating
                  ? "Updating..."
                  : "Accept"}

              </button>

              {/* REJECT */}

              <button
                type="button"
                onClick={() =>
                  onReject(
                    application.id
                  )
                }
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <XCircleIcon className="h-4 w-4" />

                Reject

              </button>

            </div>
          )}

        </div>

      </div>
    </article>
  );
};

export default ApplicationCard;