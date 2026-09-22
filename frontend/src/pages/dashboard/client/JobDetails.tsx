import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StarIcon,
  TrashIcon,
  UserCircleIcon,
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

import ConfirmationModal from "../../../components/pop/ConfirmationModal/ConfirmationModal";

import {
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

  const [isDeleting, setIsDeleting] =
    useState(false);

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
    statusDisplay?: string | null
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

      case "AWAITING_CONFIRMATION":
        return "Awaiting Confirmation";

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
        return "bg-green-50 text-green-700 ring-green-200";

      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 ring-blue-200";

      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-700 ring-purple-200";

      case "AWAITING_CONFIRMATION":
        return "bg-orange-50 text-orange-700 ring-orange-200";

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-red-200";

      default:
        return "bg-gray-50 text-gray-700 ring-gray-200";
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
        reviewsResponse.results ?? []
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

      setShowDeleteConfirm(false);

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
   * BACK
   * =========================
   */

  const handleBack = () => {
    navigate(
      "/client/dashboard/jobs"
    );
  };

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <div
        className="
          mx-auto
          mt-6
          w-full
          max-w-5xl
        "
      >
        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            px-6
            py-20
            text-center
            shadow-sm
          "
        >
          <ArrowPathIcon
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              text-green-600
            "
          />

          <p className="mt-4 text-sm font-semibold text-gray-700">
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
      <div
        className="
          mx-auto
          mt-6
          w-full
          max-w-5xl
        "
      >
        <section
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-6
          "
        >
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

            <div className="flex-1">
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
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-red-700
                  shadow-sm
                  transition
                  hover:bg-red-50
                "
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
   * DERIVED DATA
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
   * ASSIGNED WORKER
   *
   * The general job endpoint provides
   * the assigned worker profile inside
   * job.worker.
   * =========================
   */

  const worker =
    job.worker ?? null;

  const workerName =
    worker?.full_name ||
    "Worker";

  const workerEmail =
    worker?.email ||
    null;

  const workerPhone =
    worker?.phone_number ||
    null;

  const workerRating =
    worker?.rating ?? null;

  const workerReviewsCount =
    worker?.reviews_count ?? 0;

  const workerIsVerified =
    worker?.is_verified === true;

  /*
   * =========================
   * JOB ACTIONS
   * =========================
   */

  const canDelete =
    job.status === "OPEN" ||
    job.status === "CANCELLED";

  const canCancel =
    job.status === "ASSIGNED";

  const canConfirm =
    job.status ===
    "AWAITING_CONFIRMATION";

  /*
   * =========================
   * PAGE
   * =========================
   */

  return (
    <>
      {/* =====================================
          FIXED BACK BUTTON
      ===================================== */}

      <button
        type="button"
        onClick={handleBack}
        aria-label="Back to My Jobs"
        className="
          fixed
          left-4
          top-1/2
          z-50
          flex
          h-14
          w-14
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-gray-200
          bg-white
          text-gray-600
          shadow-md
          transition
          hover:bg-gray-50
          hover:text-gray-900
          hover:shadow-lg
          focus:outline-none
          focus:ring-2
          focus:ring-gray-300
        "
      >
        <ArrowLeftIcon className="h-7 w-7" />
      </button>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div
        className="
          mx-auto
          mt-6
          w-full
          max-w-5xl
          space-y-6
        "
      >
        {/* =====================================
            ACTION ERROR
        ===================================== */}

        {actionError && (
          <section
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
            "
          >
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
                aria-label="Dismiss error"
                className="
                  text-red-500
                  transition
                  hover:text-red-700
                "
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {/* =====================================
            JOB HEADER
        ===================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            sm:p-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>

                <span
                  className={`
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    ring-1
                    ring-inset
                    ${statusClass}
                  `}
                >
                  {statusLabel}
                </span>
              </div>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-1
                  text-sm
                  text-gray-500
                "
              >
                {job.category_name && (
                  <span>
                    {job.category_name}
                  </span>
                )}

                {job.posted_at && (
                  <>
                    <span className="text-gray-300">
                      •
                    </span>

                    <span>
                      Posted{" "}
                      {new Date(
                        job.posted_at
                      ).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {job.is_urgent && (
              <div
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-50
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-red-700
                "
              >
                <ExclamationTriangleIcon className="h-5 w-5" />

                {job.urgency_display ||
                  "Urgent"}
              </div>
            )}
          </div>
        </section>

        {/* =====================================
            ABOUT THIS JOB
        ===================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <h2 className="text-lg font-semibold text-gray-900">
            About this job
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
            {job.description ||
              "No description provided for this job."}
          </p>
        </section>

        {/* =====================================
            JOB INFORMATION
        ===================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Job information
          </h2>

          <div
            className="
              mt-6
              grid
              gap-6
              sm:grid-cols-2
            "
          >
            {/* BUDGET */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Budget
                </p>

                <p className="mt-1 text-base font-semibold text-gray-900">
                  K{job.budget}
                </p>
              </div>
            </div>

            {/* LOCATION */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <MapPinIcon className="h-5 w-5 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {job.general_location ||
                    "Location not specified"}
                </p>
              </div>
            </div>

            {/* DATE */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <CalendarDaysIcon className="h-5 w-5 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Job date
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {job.job_display_date ||
                    "Flexible"}
                </p>
              </div>
            </div>

            {/* TIME */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <ClockIcon className="h-5 w-5 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Time
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {job.job_display_time ||
                    job.job_time ||
                    "Flexible"}
                </p>
              </div>
            </div>

            {/* DURATION */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                <ClockIcon className="h-5 w-5 text-gray-500" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Duration
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {job.duration_hours
                    ? `${job.duration_hours} hours`
                    : "Not specified"}
                </p>
              </div>
            </div>

            {/* URGENCY */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                <ExclamationTriangleIcon
                  className={`h-5 w-5 ${
                    job.is_urgent
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Urgency
                </p>

                <p
                  className={`mt-1 text-sm font-medium ${
                    job.is_urgent
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {job.urgency_display ||
                    "Normal"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            WORKER INFORMATION
        ===================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Worker information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Information about the worker assigned to this job.
              </p>
            </div>

            {worker &&
              workerIsVerified && (
                <span
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-1.5
                    rounded-full
                    bg-green-50
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-green-700
                    ring-1
                    ring-inset
                    ring-green-200
                  "
                >
                  <ShieldCheckIcon className="h-4 w-4" />

                  Verified Worker
                </span>
              )}
          </div>

          {!worker ? (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-gray-50
                px-6
                py-10
                text-center
              "
            >
              <UserCircleIcon className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 text-sm font-semibold text-gray-700">
                No worker assigned
              </p>

              <p className="mt-1 text-sm text-gray-500">
                A worker's information will appear here once you assign a worker to this job.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* WORKER NAME */}

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <UserCircleIcon className="h-5 w-5 text-gray-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {workerName}
                  </p>
                </div>
              </div>

              {/* RATING */}

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Rating
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    {workerRating !== null ? (
                      <>
                        <span className="text-sm font-semibold text-gray-900">
                          {Number(
                            workerRating
                          ).toFixed(1)}
                        </span>

                        <span className="text-sm text-gray-500">
                          ({workerReviewsCount}{" "}
                          {workerReviewsCount === 1
                            ? "review"
                            : "reviews"})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No rating yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* EMAIL */}

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Email
                  </p>

                  {workerEmail ? (
                    <a
                      href={`mailto:${workerEmail}`}
                      className="
                        mt-1
                        block
                        truncate
                        text-sm
                        font-medium
                        text-gray-800
                        hover:text-green-600
                      "
                    >
                      {workerEmail}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Not available
                    </p>
                  )}
                </div>
              </div>

              {/* PHONE */}

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <PhoneIcon className="h-5 w-5 text-green-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Phone
                  </p>

                  {workerPhone ? (
                    <a
                      href={`tel:${workerPhone}`}
                      className="
                        mt-1
                        block
                        text-sm
                        font-medium
                        text-gray-800
                        hover:text-green-600
                      "
                    >
                      {workerPhone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Not available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =====================================
            REQUIRED SKILLS
        ===================================== */}

        {job.required_skills &&
          job.required_skills.length > 0 && (
            <section
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
              "
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Required skills
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.required_skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="
                        rounded-lg
                        bg-gray-100
                        px-3
                        py-1.5
                        text-sm
                        font-medium
                        text-gray-700
                      "
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

        {/* =====================================
            REVIEWS
        ===================================== */}

        <section
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
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

          {reviews.length === 0 ? (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-dashed
                border-gray-300
                px-6
                py-10
                text-center
              "
            >
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
                    className="
                      rounded-xl
                      border
                      border-gray-100
                      bg-gray-50
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.reviewer_name ||
                            "User"}
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
                            {review.rating_display ||
                              `${review.rating}/5`}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400">
                        {review.created_at
                          ? new Date(
                              review.created_at
                            ).toLocaleDateString()
                          : ""}
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

        {/* =====================================
            JOB ACTIONS
        ===================================== */}

        {(canDelete ||
          canCancel ||
          canConfirm) && (
          <section
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Job actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage this job based on its current status.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {canDelete && (
                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirm(
                      true
                    )
                  }
                  disabled={isDeleting}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-red-700
                    transition
                    hover:bg-red-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <TrashIcon className="h-5 w-5" />

                  Delete Job
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-red-700
                    transition
                    hover:bg-red-100
                  "
                >
                  <XMarkIcon className="h-5 w-5" />

                  Cancel Job
                </button>
              )}

              {canConfirm && (
                <button
                  type="button"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-green-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-green-700
                  "
                >
                  Confirm Completion
                </button>
              )}
            </div>
          </section>
        )}

        {/* =====================================
            DELETE CONFIRMATION
        ===================================== */}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Delete this job?"
          message="Are you sure you want to delete this job? This action cannot be undone and the job will be removed from your jobs."
          confirmLabel="Yes, Delete Job"
          cancelLabel="Keep Job"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteJob}
          onCancel={() =>
            setShowDeleteConfirm(false)
          }
        />
      </div>
    </>
  );
};

export default JobDetails;