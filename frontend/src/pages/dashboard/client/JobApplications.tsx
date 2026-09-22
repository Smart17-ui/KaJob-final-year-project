import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  StarIcon,
  UserCircleIcon,
  XCircleIcon,
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
  getJobApplications,
  getWorkerDetails,
  updateApplicationStatus,
} from "../../../components/services/applicationService";

import {
  getMyJobs,
} from "../../../components/services/jobService";

import ApplicationCard from "../../../components/application/ApplicationCard";

import type {
  JobApplication,
} from "../../../shared/types/application";

import type {
  MyJob,
} from "../../../shared/types/job";

import type {
  WorkerDetails,
} from "../../../components/services/applicationService";

type ApplicationFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

const JobApplications = () => {
  const navigate = useNavigate();

  const {
    jobId,
  } = useParams<{
    jobId: string;
  }>();

  /*
   * =========================
   * STATE
   * =========================
   */

  const [
    job,
    setJob,
  ] = useState<MyJob | null>(
    null
  );

  const [
    applications,
    setApplications,
  ] = useState<JobApplication[]>(
    []
  );

  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState<JobApplication | null>(
    null
  );

  const [
    workerDetails,
    setWorkerDetails,
  ] = useState<WorkerDetails | null>(
    null
  );

  const [
    isWorkerLoading,
    setIsWorkerLoading,
  ] = useState(false);

  const [
    workerError,
    setWorkerError,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    actionApplicationId,
    setActionApplicationId,
  ] = useState<number | null>(
    null
  );

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<ApplicationFilter>(
    "ALL"
  );

  /*
   * =========================
   * LOAD APPLICATIONS
   * =========================
   */

  const loadApplications = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!jobId) {
        throw new Error(
          "No job was selected."
        );
      }

      const parsedJobId =
        Number(jobId);

      if (
        !Number.isInteger(
          parsedJobId
        )
      ) {
        throw new Error(
          "Invalid job selected."
        );
      }

      const jobsResponse =
        await getMyJobs();

      const jobs =
        jobsResponse.results || [];

      const selectedJob =
        jobs.find(
          (item) =>
            item.id ===
            parsedJobId
        );

      if (!selectedJob) {
        throw new Error(
          "The selected job could not be found."
        );
      }

      setJob(selectedJob);

      const response =
        await getJobApplications(
          parsedJobId
        );

      const jobApplications =
        response.results.map(
          (application) => ({
            ...application,
            job_title:
              application.job_title ||
              selectedJob.title,
          })
        );

      jobApplications.sort(
        (a, b) =>
          new Date(
            b.applied_at
          ).getTime() -
          new Date(
            a.applied_at
          ).getTime()
      );

      setApplications(
        jobApplications
      );
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setErrorMessage(
          error.message
        );
      } else {
        setErrorMessage(
          "Failed to load applications."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  /*
   * =========================
   * VIEW WORKER
   * =========================
   *
   * The application response contains
   * the worker ID.
   *
   * Example:
   *
   * worker: 12
   *
   * We use that ID to request:
   *
   * GET /api/workers/12/
   */

  const handleViewWorker = async (
    application: JobApplication
  ) => {
    setSelectedWorker(
      application
    );

    setWorkerDetails(null);
    setWorkerError("");
    setIsWorkerLoading(true);

    try {
      if (!application.worker) {
        throw new Error(
          "Worker information is not available for this application."
        );
      }

      const details =
        await getWorkerDetails(
          Number(application.worker)
        );

      setWorkerDetails(
        details
      );
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setWorkerError(
          error.message
        );
      } else {
        setWorkerError(
          "Failed to load worker details."
        );
      }
    } finally {
      setIsWorkerLoading(false);
    }
  };

  /*
   * =========================
   * CLOSE WORKER MODAL
   * =========================
   */

  const closeWorkerModal = () => {
    setSelectedWorker(
      null
    );

    setWorkerDetails(
      null
    );

    setWorkerError("");

    setIsWorkerLoading(
      false
    );
  };

  /*
   * =========================
   * ACCEPT / REJECT
   * =========================
   */

  const handleApplicationStatus =
    async (
      applicationId: number,
      status: "accept" | "reject"
    ) => {
      setActionApplicationId(
        applicationId
      );

      setActionError("");

      try {
        const response =
          await updateApplicationStatus(
            applicationId,
            status
          );

        setApplications(
          (currentApplications) =>
            currentApplications.map(
              (application) =>
                application.id ===
                applicationId
                  ? {
                      ...application,

                      status:
                        response
                          .application
                          .status,

                      status_display:
                        response
                          .application
                          .status_display,
                    }
                  : application
            )
        );

        /*
         * Keep the worker modal
         * status synchronized.
         */

        setSelectedWorker(
          (currentWorker) =>
            currentWorker &&
            currentWorker.id ===
              applicationId
              ? {
                  ...currentWorker,

                  status:
                    response
                      .application
                      .status,

                  status_display:
                    response
                      .application
                      .status_display,
                }
              : currentWorker
        );
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setActionError(
            error.message
          );
        } else {
          setActionError(
            "Failed to update application."
          );
        }
      } finally {
        setActionApplicationId(
          null
        );
      }
    };

  /*
   * =========================
   * COUNTS
   * =========================
   */

  const pendingCount =
    applications.filter(
      (application) =>
        application.status ===
        "PENDING"
    ).length;

  const acceptedCount =
    applications.filter(
      (application) =>
        application.status ===
        "ACCEPTED"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        application.status ===
        "REJECTED"
    ).length;

  /*
   * =========================
   * FILTERED APPLICATIONS
   * =========================
   */

  const filteredApplications =
    applications.filter(
      (application) => {
        if (
          activeFilter ===
          "ALL"
        ) {
          return true;
        }

        return (
          application.status ===
          activeFilter
        );
      }
    );

  /*
   * =========================
   * FILTER BUTTON
   * =========================
   */

  const filterButton = (
    filter: ApplicationFilter,
    label: string,
    count: number
  ) => {
    const isActive =
      activeFilter ===
      filter;

    return (
      <button
        type="button"
        onClick={() =>
          setActiveFilter(
            filter
          )
        }
        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-emerald-600 text-white"
            : "bg-white text-slate-600 hover:bg-slate-100"
        }`}
      >
        {label}

        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <div className="space-y-8">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard/applications"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />

          Back to Applications
        </button>

        <section className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">

          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

          <p className="mt-4 text-sm font-medium text-slate-700">
            Loading applications...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we fetch
            the applicants for this job.
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

  if (errorMessage) {
    return (
      <div className="space-y-8">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard/applications"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />

          Back to Applications
        </button>

        <section className="rounded-xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

            <div>

              <h2 className="font-semibold text-red-800">
                Unable to load applications
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={
                  loadApplications
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
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
   * PAGE
   * =========================
   */

  return (
    <div className="space-y-8">

      {/* BACK */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/client/dashboard/applications"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />

        Back to Applications
      </button>

      {/* JOB HEADER */}

      <section>

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">

            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />

          </div>

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Applications for
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {job?.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review workers who applied
              for this job.
            </p>

          </div>

        </div>

      </section>

      {/* STATISTICS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">

              <ArrowPathIcon className="h-6 w-6 text-amber-600" />

            </div>

            <div>

              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">

              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />

            </div>

            <div>

              <p className="text-sm font-medium text-slate-500">
                Accepted
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {acceptedCount}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">

              <XCircleIcon className="h-6 w-6 text-red-600" />

            </div>

            <div>

              <p className="text-sm font-medium text-slate-500">
                Rejected
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {rejectedCount}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ACTION ERROR */}

      {actionError && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">

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
              aria-label="Dismiss error"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>

          </div>

        </section>
      )}

      {/* FILTERS */}

      <section className="rounded-xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">

            <FunnelIcon className="h-4 w-4" />

            Filter

          </div>

          <div className="flex flex-wrap gap-2">

            {filterButton(
              "ALL",
              "All",
              applications.length
            )}

            {filterButton(
              "PENDING",
              "Pending",
              pendingCount
            )}

            {filterButton(
              "ACCEPTED",
              "Accepted",
              acceptedCount
            )}

            {filterButton(
              "REJECTED",
              "Rejected",
              rejectedCount
            )}

          </div>

        </div>

      </section>

      {/* APPLICATIONS */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-base font-semibold text-slate-900">
            Applicants
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredApplications.length}{" "}
            {filteredApplications.length ===
            1
              ? "worker"
              : "workers"}{" "}
            shown
          </p>

        </div>

        <div className="divide-y divide-slate-100">

          {filteredApplications.length ===
          0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <BriefcaseIcon className="h-6 w-6 text-slate-400" />

              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {applications.length ===
                0
                  ? "No applications yet"
                  : "No applications found"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {applications.length ===
                0
                  ? "Workers who apply for this job will appear here."
                  : "There are no applications matching the selected filter."}
              </p>

            </div>
          ) : (
            filteredApplications.map(
              (application) => (
                <ApplicationCard
                  key={
                    application.id
                  }
                  application={
                    application
                  }
                  isUpdating={
                    actionApplicationId ===
                    application.id
                  }
                  onAccept={(
                    applicationId
                  ) =>
                    handleApplicationStatus(
                      applicationId,
                      "accept"
                    )
                  }
                  onReject={(
                    applicationId
                  ) =>
                    handleApplicationStatus(
                      applicationId,
                      "reject"
                    )
                  }
                  onViewWorker={(
                    application
                  ) => {
                    handleViewWorker(
                      application
                    );
                  }}
                />
              )
            )
          )}

        </div>

      </section>

      {/* =========================
          WORKER DETAILS MODAL
      ========================= */}

      {selectedWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
          onClick={
            closeWorkerModal
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Worker Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {workerDetails?.full_name ||
                    selectedWorker.worker_name}
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeWorkerModal
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close worker details"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>

            </div>

            {/* WORKER LOADING */}

            {isWorkerLoading && (
              <div className="px-6 py-16 text-center">

                <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading worker profile...
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Please wait while we fetch
                  the worker's details.
                </p>

              </div>
            )}

            {/* WORKER ERROR */}

            {!isWorkerLoading &&
              workerError && (
                <div className="px-6 py-8">

                  <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                    <div className="flex items-start gap-3">

                      <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

                      <div>

                        <h3 className="font-semibold text-red-800">
                          Unable to load worker profile
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                          {workerError}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewWorker(
                              selectedWorker
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                        >
                          <ArrowPathIcon className="h-4 w-4" />

                          Try again
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            {/* PROFILE */}

            {!isWorkerLoading &&
              !workerError &&
              workerDetails && (
                <>
                  <div className="space-y-6 px-6 py-6">

                    {/* PROFILE SUMMARY */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50">

                        {workerDetails.profile_photo ? (
                          <img
                            src={
                              workerDetails.profile_photo
                            }
                            alt={
                              workerDetails.full_name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-12 w-12 text-emerald-600" />
                        )}

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-slate-900">
                            {
                              workerDetails.full_name
                            }
                          </h3>

                          {workerDetails.verified && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Verified
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Applicant for{" "}
                          {
                            selectedWorker.job_title
                          }
                        </p>

                        <div className="mt-2">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              selectedWorker.status ===
                              "ACCEPTED"
                                ? "bg-emerald-50 text-emerald-700"
                                : selectedWorker.status ===
                                    "REJECTED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {
                              selectedWorker.status_display
                            }
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* CONTACT DETAILS */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div className="rounded-xl border border-slate-200 bg-white p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                          {workerDetails.email ||
                            "Not provided"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Phone
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {workerDetails.phone_number ||
                            "Not provided"}
                        </p>

                      </div>

                    </div>

                    {/* STATS */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                      <div className="rounded-xl bg-slate-50 p-4">

                        <div className="flex items-center gap-2">

                          <StarIcon className="h-5 w-5 text-amber-500" />

                          <p className="text-xs font-medium text-slate-500">
                            Rating
                          </p>

                        </div>

                        <p className="mt-2 text-lg font-bold text-slate-900">

                          {workerDetails.average_rating ??
                            "No rating"}

                          <span className="ml-1 text-sm font-medium text-slate-500">
                            / 5
                          </span>

                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {workerDetails.total_reviews}{" "}
                          {workerDetails.total_reviews ===
                          1
                            ? "review"
                            : "reviews"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Jobs completed
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {
                            workerDetails.jobs_completed
                          }
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-xs font-medium text-slate-500">
                          Availability
                        </p>

                        <p className="mt-2 text-sm font-bold uppercase text-slate-900">
                          {
                            workerDetails.availability_status
                          }
                        </p>

                      </div>

                    </div>

                    {/* BIO */}

                    <div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        About the worker
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">

                        {workerDetails.bio ||
                          "This worker has not added a bio yet."}

                      </p>

                    </div>

                    {/* SKILLS */}

                    <div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        Skills
                      </h3>

                      {workerDetails.skills?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">

                          {workerDetails.skills.map(
                            (skill) => (
                              <span
                                key={
                                  skill
                                }
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

                    {/* RECENT REVIEWS */}

                    <div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        Recent reviews
                      </h3>

                      {workerDetails.recent_reviews?.length ? (
                        <div className="mt-3 space-y-3">

                          {workerDetails.recent_reviews.map(
                            (
                              review,
                              index
                            ) => (
                              <div
                                key={`${review.created_at}-${index}`}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div>

                                    <p className="text-sm font-semibold text-slate-800">
                                      {
                                        review.reviewer_name
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {new Date(
                                        review.created_at
                                      ).toLocaleDateString()}
                                    </p>

                                  </div>

                                  <div className="flex items-center gap-1">

                                    <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />

                                    <span className="text-sm font-semibold text-slate-700">
                                      {
                                        review.rating
                                      }
                                    </span>

                                  </div>

                                </div>

                                {review.comment && (
                                  <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {
                                      review.comment
                                    }
                                  </p>
                                )}

                              </div>
                            )
                          )}

                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          This worker has no reviews yet.
                        </p>
                      )}

                    </div>

                    {/* AVAILABILITY */}

                    <div>

                      <h3 className="text-sm font-semibold text-slate-900">
                        Availability
                      </h3>

                      <div className="mt-2">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                            workerDetails.availability_status ===
                            "AVAILABLE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {
                            workerDetails.availability_status
                          }
                        </span>

                      </div>

                    </div>

                    {/* MEMBER INFORMATION */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <h3 className="text-sm font-semibold text-slate-900">
                        Worker information
                      </h3>

                      <div className="mt-3 space-y-2 text-sm">

                        <div className="flex justify-between gap-4">

                          <span className="text-slate-500">
                            Member since
                          </span>

                          <span className="font-medium text-slate-700">
                            {workerDetails.member_since
                              ? new Date(
                                  workerDetails.member_since
                                ).toLocaleDateString()
                              : "Not available"}
                          </span>

                        </div>

                        <div className="flex justify-between gap-4">

                          <span className="text-slate-500">
                            Reviews
                          </span>

                          <span className="font-medium text-slate-700">
                            {
                              workerDetails.total_reviews
                            }
                          </span>

                        </div>

                        <div className="flex justify-between gap-4">

                          <span className="text-slate-500">
                            Verification
                          </span>

                          <span
                            className={`font-medium ${
                              workerDetails.verified
                                ? "text-emerald-700"
                                : "text-slate-700"
                            }`}
                          >
                            {workerDetails.verified
                              ? "Verified"
                              : "Not verified"}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* APPLICATION INFO */}

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
                              selectedWorker.applied_at
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        <div className="flex justify-between gap-4">

                          <span className="text-slate-500">
                            Status
                          </span>

                          <span className="font-medium text-slate-700">
                            {
                              selectedWorker.status_display
                            }
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* MODAL FOOTER */}

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={
                        closeWorkerModal
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>

                    {selectedWorker.status ===
                      "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            actionApplicationId ===
                            selectedWorker.id
                          }
                          onClick={() =>
                            handleApplicationStatus(
                              selectedWorker.id,
                              "reject"
                            )
                          }
                          className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={
                            actionApplicationId ===
                            selectedWorker.id
                          }
                          onClick={() =>
                            handleApplicationStatus(
                              selectedWorker.id,
                              "accept"
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionApplicationId ===
                          selectedWorker.id
                            ? "Updating..."
                            : "Accept Worker"}
                        </button>
                      </>
                    )}

                  </div>
                </>
              )}

          </div>

        </div>
      )}

    </div>
  );
};

export default JobApplications;