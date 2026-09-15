import {
  CheckCircleIcon,
  StarIcon,
  UserCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import type {
  JobApplication,
} from "../../shared/types/application";

type WorkerDetailsCardProps = {
  application: JobApplication;
  onClose: () => void;
  onAccept?: (applicationId: number) => void;
  onReject?: (applicationId: number) => void;
  isUpdating?: boolean;
};

const WorkerDetailsCard = ({
  application,
  onClose,
  onAccept,
  onReject,
  isUpdating = false,
}: WorkerDetailsCardProps) => {
  const profile =
    application.worker_profile;

  const rating =
    profile?.average_rating;

  const statusClass =
    application.status ===
    "ACCEPTED"
      ? "bg-emerald-50 text-emerald-700"
      : application.status ===
          "REJECTED"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =========================
            HEADER
        ========================= */}

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Worker Profile
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {application.worker_name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close worker details"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* =========================
            CONTENT
        ========================= */}

        <div className="space-y-6 px-6 py-6">

          {/* PROFILE */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <UserCircleIcon className="h-12 w-12 text-emerald-600" />
            </div>

            <div className="min-w-0">

              <h3 className="text-lg font-bold text-slate-900">
                {application.worker_name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Applicant for{" "}
                {application.job_title}
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                >
                  {application.status_display}
                </span>
              </div>

            </div>

          </div>

          {/* =========================
              STATS
          ========================= */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* RATING */}

            <div className="rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-2">

                <StarIcon className="h-5 w-5 text-amber-500" />

                <p className="text-xs font-medium text-slate-500">
                  Rating
                </p>

              </div>

              <p className="mt-2 text-lg font-bold text-slate-900">

                {rating ??
                  "No rating"}

                {rating !==
                  null &&
                  rating !==
                    undefined && (
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      / 5
                    </span>
                  )}

              </p>

            </div>

            {/* JOBS COMPLETED */}

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-medium text-slate-500">
                Jobs completed
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {profile
                  ?.jobs_completed ??
                  0}
              </p>

            </div>

            {/* HOURLY RATE */}

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-medium text-slate-500">
                Hourly rate
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">

                {profile
                  ?.hourly_rate
                  ? `K${profile.hourly_rate}`
                  : "Not specified"}

              </p>

            </div>

          </div>

          {/* =========================
              ABOUT
          ========================= */}

          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              About the worker
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">

              {profile?.bio ||
                "This worker has not added a bio yet."}

            </p>

          </div>

          {/* =========================
              SKILLS
          ========================= */}

          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              Skills
            </h3>

            {profile?.skills?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">

                {profile.skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No skills have been added yet.
              </p>
            )}

          </div>

          {/* =========================
              AVAILABILITY
          ========================= */}

          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              Availability
            </h3>

            <div className="mt-2">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                {profile
                  ?.availability_status ||
                  "Not specified"}

              </span>

            </div>

          </div>

          {/* =========================
              APPLICATION INFO
          ========================= */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <h3 className="text-sm font-semibold text-slate-900">
              Application information
            </h3>

            <div className="mt-3 space-y-2 text-sm">

              <div className="flex justify-between gap-4">

                <span className="text-slate-500">
                  Applied
                </span>

                <span className="font-medium text-slate-700">
                  {new Date(
                    application.applied_at
                  ).toLocaleDateString()}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-slate-500">
                  Status
                </span>

                <span className="font-medium text-slate-700">
                  {application.status_display}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>

          {application.status ===
            "PENDING" && (
            <>
              {onReject && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    onReject(
                      application.id
                    )
                  }
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </span>
                </button>
              )}

              {onAccept && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    onAccept(
                      application.id
                    )
                  }
                  className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />

                    {isUpdating
                      ? "Updating..."
                      : "Accept Worker"}
                  </span>
                </button>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default WorkerDetailsCard;