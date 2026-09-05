import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  cancelJob,
  deleteJob,
  getJobDetails,
  getJobReviews,
} from "../../../components/services/jobService";

import type {
  JobReview,
  MyJob,
} from "../../../shared/types/job";

const JobDetails = () => {
  const navigate = useNavigate();

  const { jobId } = useParams<{
    jobId: string;
  }>();

  /*
   * =========================
   * STATE
   * =========================
   */

  const [job, setJob] =
    useState<MyJob | null>(null);

  const [reviews, setReviews] =
    useState<JobReview[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    showCancelConfirm,
    setShowCancelConfirm,
  ] = useState(false);

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  /*
   * =========================
   * STATUS LABEL
   * =========================
   */

  const getStatusLabel = (
    status: string,
    statusDisplay?: string
  ) => {
    if (statusDisplay) {
      return statusDisplay;
    }

    switch (status) {
      case "OPEN":
        return "Open";

      case "ASSIGNED":
        return "Assigned";

      case "IN_PROGRESS":
        return "In Progress";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  };

  /*
   * =========================
   * STATUS STYLE
   * =========================
   */

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700";

      case "ASSIGNED":
        return "bg-yellow-100 text-yellow-700";

      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /*
   * =========================
   * LOAD JOB DETAILS
   * =========================
   */

  const loadJobDetails = async () => {
    if (!jobId) {
      setErrorMessage("Invalid job ID.");
      setIsLoading(false);

      return;
    }

    const id = Number(jobId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      setErrorMessage("Invalid job ID.");
      setIsLoading(false);

      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        jobResponse,
        reviewsResponse,
      ] = await Promise.all([
        getJobDetails(id),
        getJobReviews(id),
      ]);

      setJob(jobResponse);

      setReviews(
        reviewsResponse.results
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to load job details."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * =========================
   * LOAD ON PAGE OPEN
   * =========================
   */

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  /*
   * =========================
   * CANCEL JOB
   * =========================
   */

  const handleCancelJob = async () => {
    if (!job) {
      return;
    }

    setIsCancelling(true);
    setActionError("");

    try {
      const response =
        await cancelJob(job.id);

      setJob((currentJob) => {
        if (!currentJob) {
          return currentJob;
        }

        return {
          ...currentJob,
          status: response.job.status,
          status_display:
            response.job.status_display,
        };
      });

      setShowCancelConfirm(false);
    } catch (error) {
      if (error instanceof Error) {
        setActionError(error.message);
      } else {
        setActionError(
          "Failed to cancel the job."
        );
      }
    } finally {
      setIsCancelling(false);
    }
  };

  /*
   * =========================
   * DELETE JOB
   * =========================
   */

  const handleDeleteJob = async () => {
    if (!job) {
      return;
    }

    setIsDeleting(true);
    setActionError("");

    try {
      await deleteJob(job.id);

      navigate(
        "/client/dashboard/jobs"
      );
    } catch (error) {
      if (error instanceof Error) {
        setActionError(error.message);
      } else {
        setActionError(
          "Failed to delete the job."
        );
      }

      setIsDeleting(false);
    }
  };

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <div className="space-y-6">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard/jobs"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />

          Back to My Jobs
        </button>

        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-green-600" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading job details...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch the job.
          </p>

        </section>

      </div>
    );
  }

  /*
   * =========================
   * ERROR
   * =========================
   */

  if (errorMessage || !job) {
    return (
      <div className="space-y-6">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard/jobs"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />

          Back to My Jobs
        </button>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

            <div>

              <h2 className="font-semibold text-red-800">
                Unable to load job
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage ||
                  "Job not found."}
              </p>

              <button
                type="button"
                onClick={loadJobDetails}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
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

  /*
   * =========================
   * STATUS
   * =========================
   */

  const statusLabel =
    getStatusLabel(
      job.status,
      job.status_display
    );

  const statusClass =
    getStatusClass(job.status);

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div className="space-y-6">

      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/client/dashboard/jobs"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />

        Back to My Jobs
      </button>

      {/* =========================
          ACTION ERROR
      ========================= */}

      {actionError && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-600" />

            <div className="flex-1">

              <p className="text-sm font-semibold text-red-800">
                Action failed
              </p>

              <p className="mt-1 text-sm text-red-700">
                {actionError}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setActionError("")
              }
              className="text-red-500 transition hover:text-red-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

          </div>

        </section>
      )}

      {/* =========================
          JOB HEADER
      ========================= */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-2xl font-bold text-gray-900">
                {job.title}
              </h1>

              {/* STATUS */}

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
              >
                {statusLabel}
              </span>

            </div>

            <p className="mt-2 text-sm text-gray-500">
              {job.category_name}
            </p>

          </div>

        </div>

      </section>

      {/* =========================
          JOB INFORMATION
      ========================= */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-gray-900">
          Job information
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* BUDGET */}

          <div className="flex items-start gap-3">

            <CurrencyDollarIcon className="h-6 w-6 shrink-0 text-green-600" />

            <div>

              <p className="text-xs text-gray-500">
                Budget
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                K{job.budget}
              </p>

            </div>

          </div>

          {/* LOCATION */}

          <div className="flex items-start gap-3">

            <MapPinIcon className="h-6 w-6 shrink-0 text-green-600" />

            <div>

              <p className="text-xs text-gray-500">
                Location
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {job.general_location ||
                  "Location not specified"}
              </p>

            </div>

          </div>

          {/* JOB DATE */}

          <div className="flex items-start gap-3">

            <CalendarDaysIcon className="h-6 w-6 shrink-0 text-green-600" />

            <div>

              <p className="text-xs text-gray-500">
                Job date
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {job.job_display_date}
              </p>

            </div>

          </div>

          {/* DURATION */}

          {job.duration_hours && (
            <div className="flex items-start gap-3">

              <ClockIcon className="h-6 w-6 shrink-0 text-green-600" />

              <div>

                <p className="text-xs text-gray-500">
                  Duration
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {job.duration_hours} hours
                </p>

              </div>

            </div>
          )}

          {/* CLIENT */}

          <div className="flex items-start gap-3">

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-700">
              C
            </div>

            <div>

              <p className="text-xs text-gray-500">
                Client
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {job.client_name}
              </p>

            </div>

          </div>

          {/* SEARCH RADIUS */}

          <div className="flex items-start gap-3">

            <MapPinIcon className="h-6 w-6 shrink-0 text-green-600" />

            <div>

              <p className="text-xs text-gray-500">
                Search radius
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {job.search_radius_km} km
              </p>

            </div>

          </div>

        </div>

        {/* URGENCY */}

        <div className="mt-6 border-t border-gray-100 pt-6">

          <div className="flex items-center gap-3">

            <ExclamationTriangleIcon
              className={`h-6 w-6 ${
                job.is_urgent
                  ? "text-red-600"
                  : "text-gray-400"
              }`}
            />

            <div>

              <p className="text-xs text-gray-500">
                Urgency
              </p>

              <p
                className={`mt-1 font-medium ${
                  job.is_urgent
                    ? "text-red-600"
                    : "text-gray-800"
                }`}
              >
                {job.urgency_display}
              </p>

            </div>

          </div>

        </div>

        {/* POSTED DATE */}

        <div className="mt-6 border-t border-gray-100 pt-6">

          <p className="text-xs text-gray-500">
            Posted
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {new Date(
              job.posted_at
            ).toLocaleDateString()}
          </p>

        </div>

      </section>

      {/* =========================
          REVIEWS
      ========================= */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Reviews
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </p>

          </div>

        </div>

        {reviews.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">

            <StarIcon className="mx-auto h-8 w-8 text-gray-300" />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No reviews yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Reviews for this job will appear here.
            </p>

          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="font-semibold text-gray-900">
                        {review.reviewer_name}
                      </p>

                      <div className="mt-1 flex items-center gap-1">

                        {Array.from({
                          length: 5,
                        }).map(
                          (_, index) => (
                            <StarIcon
                              key={index}
                              className={`h-4 w-4 ${
                                index <
                                review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          )
                        )}

                        <span className="ml-1 text-xs text-gray-500">
                          {review.rating_display}
                        </span>

                      </div>

                    </div>

                    <p className="text-xs text-gray-400">
                      {new Date(
                        review.created_at
                      ).toLocaleDateString()}
                    </p>

                  </div>

                  {review.comment && (
                    <p className="mt-4 text-sm leading-6 text-gray-700">
                      {review.comment}
                    </p>
                  )}

                </article>
              )
            )}

          </div>
        )}

      </section>

      {/* =========================
          ACTIONS
      ========================= */}

      {job.status !== "COMPLETED" &&
        job.status !== "CANCELLED" && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Job actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage this job.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setShowCancelConfirm(
                    true
                  )
                }
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-3 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XMarkIcon className="h-5 w-5" />

                Cancel Job
              </button>

              {/* DELETE */}

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
                    true
                  )
                }
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />

                Delete Job
              </button>

            </div>

          </section>
        )}

      {/* =========================
          CANCEL CONFIRMATION
      ========================= */}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">

              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />

            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Cancel this job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to cancel this job?
              You won't be able to undo this action.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowCancelConfirm(
                    false
                  )
                }
                disabled={isCancelling}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Job
              </button>

              <button
                type="button"
                onClick={handleCancelJob}
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling && (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                )}

                {isCancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Job"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          DELETE CONFIRMATION
      ========================= */}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

              <TrashIcon className="h-6 w-6 text-red-600" />

            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete this job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete this job?
              This job will be removed from your jobs.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                disabled={isDeleting}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Job
              </button>

              <button
                type="button"
                onClick={handleDeleteJob}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                )}

                {isDeleting
                  ? "Deleting..."
                  : "Yes, Delete Job"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default JobDetails;