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
                    setSelectedWorker(
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
          onClick={() =>
            setSelectedWorker(null)
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
                  {selectedWorker.worker_name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedWorker(null)
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close worker details"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>

            </div>

            {/* PROFILE */}

            <div className="space-y-6 px-6 py-6">

              {/* PROFILE SUMMARY */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50">

                  <UserCircleIcon className="h-12 w-12 text-emerald-600" />

                </div>

                <div className="min-w-0">

                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedWorker.worker_name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Applicant for{" "}
                    {selectedWorker.job_title}
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

                    {selectedWorker
                      .worker_profile
                      ?.average_rating ??
                      "No rating"}

                    {selectedWorker
                      .worker_profile
                      ?.average_rating !=
                      null && (
                      <span className="ml-1 text-sm font-medium text-slate-500">
                        / 5
                      </span>
                    )}

                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium text-slate-500">
                    Jobs completed
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {
                      selectedWorker
                        .worker_profile
                        ?.jobs_completed ??
                      0
                    }
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium text-slate-500">
                    Hourly rate
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">

                    {selectedWorker
                      .worker_profile
                      ?.hourly_rate
                      ? `K${selectedWorker.worker_profile.hourly_rate}`
                      : "Not specified"}

                  </p>

                </div>

              </div>

              {/* BIO */}

              <div>

                <h3 className="text-sm font-semibold text-slate-900">
                  About the worker
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">

                  {selectedWorker
                    .worker_profile
                    ?.bio ||
                    "This worker has not added a bio yet."}

                </p>

              </div>

              {/* SKILLS */}

              <div>

                <h3 className="text-sm font-semibold text-slate-900">
                  Skills
                </h3>

                {selectedWorker
                  .worker_profile
                  ?.skills?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">

                    {selectedWorker.worker_profile.skills.map(
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

              {/* AVAILABILITY */}

              <div>

                <h3 className="text-sm font-semibold text-slate-900">
                  Availability
                </h3>

                <div className="mt-2">

                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                    {selectedWorker
                      .worker_profile
                      ?.availability_status ||
                      "Not specified"}
                  </span>

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
                onClick={() =>
                  setSelectedWorker(null)
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

          </div>

        </div>
      )}

    </div>
  );
};

export default JobApplications;