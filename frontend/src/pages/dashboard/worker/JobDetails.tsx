import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import apiClient from "@/api/client";
import { markJobComplete } from "@/api/jobs";

/* ==================================================
   TYPES
================================================== */

type WorkerJob = {
  id: number;
  title: string;
  description: string;
  budget: string | number;

  client_name: string | null;
  client_phone: string | null;
  category_name: string | null;

  status: string;
  status_display: string | null;

  posted_at: string;
  created_at: string;
  updated_at: string;

  general_location: string | null;
  exact_location: string | null;
  map_url: string | null;
  directions_url: string | null;
  place_id: string | null;
  location_display: string | null;

  latitude: number | string | null;
  longitude: number | string | null;
  search_radius_km: number | null;

  job_date: string | null;
  job_time: string | null;
  timeframe: string | null;
  timeframe_display: string | null;
  is_flexible: boolean;
  duration_hours: number | string | null;

  urgency: string | null;
  urgency_display: string | null;
  job_display_date: string | null;
  job_display_time: string | null;
  is_urgent: boolean;

  application_status: string | null;
  assignment_status: string | null;
  assigned_at: string | null;
  can_view_full_details: boolean;
};

type WorkerJobResponse = {
  job: WorkerJob;
  can_view_full_details: boolean;
  assignment_status: string | null;
  application_status: string | null;
};

/* ==================================================
   COMPONENT
================================================== */

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  const [job, setJob] = useState<WorkerJob | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  /*
   * Separate state for a job that no longer exists
   * or cannot be accessed.
   */
  const [jobUnavailable, setJobUnavailable] =
    useState(false);

  /* ==================================================
     LOAD JOB
  ================================================== */

  const loadJob = async () => {
    if (!jobId) {
      setErrorMessage("No job was specified.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setJobUnavailable(false);

    try {
      const response = (await apiClient(
        `/jobs/${jobId}/worker/`
      )) as WorkerJobResponse;

      /*
       * Make sure the response actually contains
       * a job before rendering the details.
       */
      if (!response?.job) {
        setJob(null);
        setJobUnavailable(true);
        return;
      }

      setJob(response.job);
    } catch (error) {
      /*
       * A job that has been deleted, removed, or is no
       * longer available should not be presented as
       * a technical error to the worker.
       *
       * We therefore show a friendly unavailable state.
       */
      setJob(null);
      setJobUnavailable(true);

      /*
       * Keep the console useful during development,
       * but don't expose the backend error to the user.
       */
      console.error(
        "Unable to load worker job:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  /* ==================================================
     MARK WORK COMPLETE
  ================================================== */

  const handleMarkComplete = async () => {
    if (!jobId || !job) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you have finished this job? The client will be asked to confirm the completion."
    );

    if (!confirmed) {
      return;
    }

    setIsCompleting(true);
    setErrorMessage("");
    setActionMessage("");

    try {
      const response = await markJobComplete(
        Number(jobId)
      );

      setActionMessage(
        response.message ||
          "Work marked as complete. Waiting for client confirmation."
      );

      await loadJob();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to mark the work as complete."
        );
      }
    } finally {
      setIsCompleting(false);
    }
  };

  /* ==================================================
     LOADING
  ================================================== */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section>
          <button
            type="button"
            onClick={() =>
              navigate("/worker/dashboard/applications")
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to My Applications
          </button>
        </section>

        <section className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="text-center">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading job details...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch the job.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /* ==================================================
     JOB NOT AVAILABLE
  ================================================== */

  if (jobUnavailable) {
    return (
      <div className="space-y-6">
        <section>
          <button
            type="button"
            onClick={() =>
              navigate("/worker/dashboard/applications")
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to My Applications
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-8">
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ExclamationCircleIcon className="h-8 w-8 text-slate-500" />
              </div>

              <h1 className="mt-5 text-xl font-bold text-slate-900">
                Job Not Available
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This job is no longer available. It may
                have been removed or is no longer
                accessible.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your application record is still kept in
                My Applications.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/worker/dashboard/applications")
                }
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to My Applications
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ==================================================
     ERROR
  ================================================== */

  if (errorMessage || !job) {
    return (
      <div className="space-y-6">
        <section>
          <button
            type="button"
            onClick={() =>
              navigate("/worker/dashboard/applications")
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to My Applications
          </button>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load job
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage ||
                  "The requested job could not be found."}
              </p>

              <button
                type="button"
                onClick={loadJob}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ==================================================
     STATUS HELPERS
  ================================================== */

  const normalizedStatus = job.status
    .toUpperCase()
    .trim();

  const isAssigned =
    normalizedStatus === "ASSIGNED";

  const isAwaitingConfirmation =
    normalizedStatus === "AWAITING_CONFIRMATION";

  const isCompleted =
    normalizedStatus === "COMPLETED";

  const isCancelled =
    normalizedStatus === "CANCELLED";

  /* ==================================================
     MAIN CONTENT
  ================================================== */

  return (
    <div className="space-y-6">
      {/* ==================================================
          BACK
      ================================================== */}

      <section>
        <button
          type="button"
          onClick={() =>
            navigate("/worker/dashboard/applications")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to My Applications
        </button>
      </section>

      {/* ==================================================
          JOB HEADER
      ================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <BriefcaseIcon className="h-7 w-7 text-emerald-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-emerald-600">
                {job.category_name || "Job"}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {job.title}
              </h1>

              {job.client_name && (
                <p className="mt-2 text-sm text-slate-500">
                  Posted by {job.client_name}
                </p>
              )}
            </div>
          </div>

          <JobStatusBadge
            status={job.status_display || job.status}
          />
        </div>

        {/* ==================================================
            APPLICATION / ASSIGNMENT STATUS
        ================================================== */}

        {(job.application_status ||
          job.assignment_status) && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            {job.application_status && (
              <StatusPill
                label="Application"
                value={formatStatus(
                  job.application_status
                )}
              />
            )}

            {job.assignment_status && (
              <StatusPill
                label="Assignment"
                value={formatStatus(
                  job.assignment_status
                )}
              />
            )}
          </div>
        )}
      </section>

      {/* ==================================================
          WORK ACTION
      ================================================== */}

      {isAssigned && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-blue-900">
                  You are assigned to this job
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Complete the work, then mark it as
                  complete when you are finished. The client
                  will then confirm the completion.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCompleting ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Marking Complete...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Mark Work Complete
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* ==================================================
          ACTION SUCCESS MESSAGE
      ================================================== */}

      {actionMessage && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

            <div>
              <h2 className="font-semibold text-emerald-900">
                Work submitted for confirmation
              </h2>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                {actionMessage}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          AWAITING CLIENT CONFIRMATION
      ================================================== */}

      {isAwaitingConfirmation && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <ClockIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />

            <div>
              <h2 className="font-semibold text-amber-900">
                Awaiting Client Confirmation
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                You have marked this work as complete.
                The client now needs to confirm that the
                work has been completed.
              </p>

              <p className="mt-2 text-xs text-amber-700">
                You do not need to take any further action
                right now.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          COMPLETED
      ================================================== */}

      {isCompleted && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

            <div>
              <h2 className="font-semibold text-emerald-900">
                Job Completed
              </h2>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                The client has confirmed that the work
                has been completed successfully.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          CANCELLED
      ================================================== */}

      {isCancelled && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-900">
                Job Cancelled
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-800">
                This job has been cancelled and no further
                work can be completed through KaJob.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          JOB DESCRIPTION
      ================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Job Description
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {job.description}
        </p>
      </section>

      {/* ==================================================
          JOB INFORMATION
      ================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Job Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={<BriefcaseIcon className="h-5 w-5" />}
            label="Budget"
            value={`K ${formatBudget(job.budget)}`}
          />

          <InfoItem
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            label="Date"
            value={
              job.job_display_date ||
              formatDate(job.job_date)
            }
          />

          <InfoItem
            icon={<ClockIcon className="h-5 w-5" />}
            label="Time"
            value={
              job.job_display_time ||
              job.timeframe_display ||
              "Anytime"
            }
          />

          <InfoItem
            icon={<ClockIcon className="h-5 w-5" />}
            label="Duration"
            value={
              job.duration_hours
                ? `${job.duration_hours} hour${
                    Number(job.duration_hours) === 1
                      ? ""
                      : "s"
                  }`
                : "Not specified"
            }
          />

          <InfoItem
            icon={
              <ExclamationCircleIcon className="h-5 w-5" />
            }
            label="Urgency"
            value={
              job.urgency_display ||
              formatStatus(job.urgency) ||
              "Normal"
            }
          />

          <InfoItem
            icon={<ClockIcon className="h-5 w-5" />}
            label="Schedule"
            value={
              job.is_flexible
                ? "Flexible"
                : "Fixed"
            }
          />
        </div>
      </section>

      {/* ==================================================
          LOCATION
      ================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <MapPinIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Location
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {job.can_view_full_details
                ? "Full location details are available because you are assigned to this job."
                : "The exact location will be available after you are assigned to the job."}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            {job.location_display ||
              job.general_location ||
              "Location not specified"}
          </p>

          {!job.can_view_full_details && (
            <div className="mt-3 flex items-start gap-2 text-sm text-amber-700">
              <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />

              <p>
                The client's exact address is hidden until
                you are officially assigned to the job.
              </p>
            </div>
          )}
        </div>

        {/* MAP / DIRECTIONS */}

        {job.can_view_full_details &&
          (job.map_url || job.directions_url) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {job.map_url && (
                <a
                  href={job.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <MapPinIcon className="h-4 w-4" />
                  View on Map
                </a>
              )}

              {job.directions_url && (
                <a
                  href={job.directions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Get Directions
                </a>
              )}
            </div>
          )}
      </section>

      {/* ==================================================
          CLIENT INFORMATION
      ================================================== */}

      {job.can_view_full_details && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Client Information
          </h2>

          <div className="mt-5 space-y-4">
            {job.client_name && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <BriefcaseIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Client
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {job.client_name}
                  </p>
                </div>
              </div>
            )}

            {job.client_phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <PhoneIcon className="h-5 w-5 text-slate-500" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Phone
                  </p>

                  <a
                    href={`tel:${job.client_phone}`}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    {job.client_phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================================================
          ASSIGNMENT NOTICE
      ================================================== */}

      {job.can_view_full_details && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

            <div>
              <h2 className="font-semibold text-emerald-900">
                You are assigned to this job
              </h2>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                You can now see the full job location and
                client contact information.
              </p>

              {job.assigned_at && (
                <p className="mt-2 text-xs text-emerald-700">
                  Assigned{" "}
                  {formatDateTime(job.assigned_at)}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

/* ==================================================
   INFO ITEM
================================================== */

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoItem = ({
  icon,
  label,
  value,
}: InfoItemProps) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
};

/* ==================================================
   STATUS PILL
================================================== */

type StatusPillProps = {
  label: string;
  value: string;
};

const StatusPill = ({
  label,
  value,
}: StatusPillProps) => {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="ml-2 text-sm font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
};

/* ==================================================
   JOB STATUS BADGE
================================================== */

const JobStatusBadge = ({
  status,
}: {
  status: string;
}) => {
  const normalized = status.toLowerCase();

  let className =
    "bg-slate-100 text-slate-700";

  if (normalized.includes("open")) {
    className =
      "bg-emerald-50 text-emerald-700";
  } else if (normalized.includes("assigned")) {
    className =
      "bg-blue-50 text-blue-700";
  } else if (normalized.includes("progress")) {
    className =
      "bg-amber-50 text-amber-700";
  } else if (
    normalized.includes("awaiting")
  ) {
    className =
      "bg-amber-50 text-amber-700";
  } else if (
    normalized.includes("complete")
  ) {
    className =
      "bg-emerald-50 text-emerald-700";
  } else if (
    normalized.includes("cancel")
  ) {
    className =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${className}`}
    >
      {status}
    </span>
  );
};

/* ==================================================
   HELPERS
================================================== */

const formatBudget = (
  budget: string | number
) => {
  const amount = Number(budget);

  if (Number.isNaN(amount)) {
    return String(budget);
  }

  return amount.toLocaleString("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (
  date: string | null
) => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (
  date: string
) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatStatus = (
  value: string | null
) => {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

export default JobDetails;