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
  PlayIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import apiClient from "@/api/client";
import {
  markJobComplete,
  startJob,
} from "@/api/jobs";

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
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

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

      if (!response?.job) {
        setJob(null);
        setJobUnavailable(true);
        return;
      }

      setJob(response.job);
    } catch (error) {
      setJob(null);
      setJobUnavailable(true);

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
     START WORK
  ================================================== */

  const handleStartWork = async () => {
    if (!jobId || !job) {
      return;
    }

    const confirmed = window.confirm(
      "Are you ready to start working on this job?"
    );

    if (!confirmed) {
      return;
    }

    setIsStarting(true);
    setErrorMessage("");
    setActionMessage("");

    try {
      const response = await startJob(
        Number(jobId)
      );

      setActionMessage(
        response.message ||
          "Work has been started successfully."
      );

      await loadJob();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to start the work."
        );
      }
    } finally {
      setIsStarting(false);
    }
  };

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
      <div className="mx-auto max-w-5xl space-y-6">
        <BackButton navigate={navigate} />

        <section className="flex min-h-[460px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <ArrowPathIcon className="h-7 w-7 animate-spin text-emerald-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
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
      <div className="mx-auto max-w-5xl space-y-6">
        <BackButton navigate={navigate} />

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex min-h-[380px] items-center justify-center">
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
                Your work record is still available in
                My Work.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/worker/dashboard/my-work")
                }
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to My Work
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

  if (errorMessage && !job) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <BackButton navigate={navigate} />

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load job
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
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

  if (!job) {
    return null;
  }

  /* ==================================================
     STATUS
  ================================================== */

  const normalizedStatus = job.status
    .toUpperCase()
    .trim();

  const isAssigned =
    normalizedStatus === "ASSIGNED";

  const isInProgress =
    normalizedStatus === "IN_PROGRESS";

  const isAwaitingConfirmation =
    normalizedStatus === "AWAITING_CONFIRMATION";

  const isCompleted =
    normalizedStatus === "COMPLETED";

  const isCancelled =
    normalizedStatus === "CANCELLED";

  const canStartWork = isAssigned;
  const canCompleteWork = isInProgress;

  /* ==================================================
     LOCATION
  ================================================== */

  const hasCoordinates =
    job.latitude !== null &&
    job.latitude !== undefined &&
    job.longitude !== null &&
    job.longitude !== undefined;

  const coordinates = hasCoordinates
    ? `${job.latitude},${job.longitude}`
    : null;

  const mapUrl = coordinates
    ? `https://www.google.com/maps/place/${coordinates}`
    : job.map_url;

  const directionsUrl = coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`
    : job.directions_url;

  /* ==================================================
     MAIN CONTENT
  ================================================== */

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <BackButton navigate={navigate} />

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <BriefcaseIcon className="h-7 w-7 text-emerald-600" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">
                    {job.category_name || "Job"}
                  </span>

                  {job.is_urgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <ExclamationCircleIcon className="h-3.5 w-3.5" />
                      Urgent
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {job.title}
                </h1>

                {job.client_name && (
                  <p className="mt-2 text-sm text-slate-500">
                    Posted by{" "}
                    <span className="font-medium text-slate-700">
                      {job.client_name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <JobStatusBadge
              status={
                job.status_display ||
                formatStatus(job.status)
              }
            />
          </div>

          {(job.application_status ||
            job.assignment_status) && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap gap-3">
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
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          ACTION ERROR
      ================================================== */}

      {errorMessage && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Action failed
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          START WORK
      ================================================== */}

      {canStartWork && (
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
          <div className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <PlayIcon className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-blue-900">
                    You are assigned to this job
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-800">
                    When you are ready to begin, start the
                    work. This will move the job into
                    In Progress.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartWork}
                disabled={isStarting}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Starting Work...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5" />
                    Start Work
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          IN PROGRESS
      ================================================== */}

      {isInProgress && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
          <div className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-amber-900">
                    Work is in progress
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800">
                    Continue working on the job. Once you
                    have finished, mark the work as complete
                    so the client can confirm it.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </section>
      )}

      {/* ==================================================
          ACTION SUCCESS
      ================================================== */}

      {actionMessage && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
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
          AWAITING CONFIRMATION
      ================================================== */}

      {isAwaitingConfirmation && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <ClockIcon className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h2 className="font-semibold text-amber-900">
                Awaiting Client Confirmation
              </h2>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                You have marked this work as complete.
                The client now needs to confirm that the
                work has been completed.
              </p>

              <p className="mt-3 text-xs font-medium text-amber-700">
                No further action is required from you
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
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>

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
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            </div>

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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <BriefcaseIcon className="h-5 w-5 text-slate-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Job Description
            </h2>

            <p className="text-xs text-slate-400">
              What the client needs done
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {job.description}
          </p>
        </div>
      </section>

      {/* ==================================================
          JOB INFORMATION
      ================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Job Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Important details about this work
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={<BriefcaseIcon className="h-5 w-5" />}
            label="Agreed Amount"
            value={`K ${formatBudget(job.budget)}`}
            highlight
          />

          <InfoItem
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            label="Job Date"
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <MapPinIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Job Location
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {isAssigned
                ? "You are assigned to this job. You can use the map and directions to navigate to the job location."
                : "The job location and navigation options are no longer available once work has started."}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Location
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {job.location_display ||
                  job.general_location ||
                  "Location not specified"}
              </p>
            </div>
          </div>

          {!isAssigned && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

              <p>
                Navigation is available only while the
                job is in the Assigned state. Once work
                starts, these navigation options are
                removed.
              </p>
            </div>
          )}
        </div>

        {/* ==================================================
            MAP & DIRECTIONS — ASSIGNED ONLY
        ================================================== */}

        {isAssigned &&
          (mapUrl || directionsUrl) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <MapPinIcon className="h-4 w-4" />
                  View on Map
                </a>
              )}

              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Client Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Contact information for the client who
              posted this job
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {job.client_name && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <BriefcaseIcon className="h-5 w-5 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Client
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {job.client_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {job.client_phone && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <PhoneIcon className="h-5 w-5 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Phone
                    </p>

                    <a
                      href={`tel:${job.client_phone}`}
                      className="mt-1 block truncate text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {job.client_phone}
                    </a>
                  </div>
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
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="font-semibold text-emerald-900">
                You are assigned to this job
              </h2>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                You can now access the full job location
                and client contact information.
              </p>

              {job.assigned_at && (
                <p className="mt-2 text-xs font-medium text-emerald-700">
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
   BACK BUTTON
================================================== */

type BackButtonProps = {
  navigate: ReturnType<typeof useNavigate>;
};

const BackButton = ({
  navigate,
}: BackButtonProps) => {
  return (
    <button
      type="button"
      onClick={() =>
        navigate("/worker/dashboard/my-work")
      }
      aria-label="Back to My Work"
      className="fixed left-5 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </button>
  );
};

/* ==================================================
   INFO ITEM
================================================== */

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
};

const InfoItem = ({
  icon,
  label,
  value,
  highlight = false,
}: InfoItemProps) => {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          highlight
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 text-sm font-semibold ${
            highlight
              ? "text-emerald-700"
              : "text-slate-900"
          }`}
        >
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
    <div className="rounded-xl bg-slate-50 px-4 py-2.5">
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
  } else if (normalized.includes("awaiting")) {
    className =
      "bg-amber-50 text-amber-700";
  } else if (normalized.includes("complete")) {
    className =
      "bg-emerald-50 text-emerald-700";
  } else if (normalized.includes("cancel")) {
    className =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${className}`}
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