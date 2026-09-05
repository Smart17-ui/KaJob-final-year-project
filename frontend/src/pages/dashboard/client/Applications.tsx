import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

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

/*
 * =========================
 * CLIENT APPLICATION
 * =========================
 *
 * The applications endpoint currently
 * does not return the job ID.
 *
 * Since we fetch applications job-by-job,
 * we add the job ID ourselves.
 */

type ClientApplication =
  JobApplication & {
    jobId: number;
  };

const Applications = () => {
  const navigate = useNavigate();

  /*
   * =========================
   * STATE
   * =========================
   */

  const [
    applications,
    setApplications,
  ] = useState<ClientApplication[]>(
    []
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

  /*
   * =========================
   * LOAD APPLICATIONS
   * =========================
   *
   * There is currently no:
   *
   * GET /applications/
   *
   * endpoint.
   *
   * Therefore:
   *
   * 1. Get the client's jobs.
   * 2. Get applications for each job.
   * 3. Combine them into one array.
   *
   * We intentionally fetch them
   * sequentially instead of using
   * Promise.all() to avoid sending
   * many requests at once and triggering
   * the backend rate limiter.
   */

  const loadApplications = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      /*
       * Get all jobs belonging
       * to the current client.
       */

      const jobsResponse =
        await getMyJobs();

      const jobs =
        jobsResponse.results || [];

      /*
       * No jobs means there
       * cannot be applications.
       */

      if (jobs.length === 0) {
        setApplications([]);
        return;
      }

      /*
       * Store all applications here.
       */

      const allApplications: ClientApplication[] =
        [];

      /*
       * Fetch applications
       * one job at a time.
       */

      for (const job of jobs) {
        const response =
          await getJobApplications(
            job.id
          );

        const jobApplications =
          response.results.map(
            (application) => ({
              ...application,

              /*
               * Add the job ID because
               * the backend response currently
               * doesn't provide it.
               */

              jobId: job.id,

              /*
               * Use the job title from the
               * application response if available.
               *
               * Otherwise use the title
               * from the client's job.
               */

              job_title:
                application.job_title ||
                job.title,
            })
          );

        allApplications.push(
          ...jobApplications
        );
      }

      /*
       * Sort newest applications first.
       */

      allApplications.sort(
        (a, b) =>
          new Date(
            b.applied_at
          ).getTime() -
          new Date(
            a.applied_at
          ).getTime()
      );

      setApplications(
        allApplications
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

  /*
   * =========================
   * LOAD WHEN PAGE OPENS
   * =========================
   */

  useEffect(() => {
    loadApplications();
  }, []);

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

        /*
         * Update only the application
         * that was changed.
         */

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
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <div className="space-y-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />

          Back to Dashboard
        </button>

        {/* LOADING CARD */}

        <section className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">

          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-green-600" />

          <p className="mt-4 text-sm font-medium text-slate-700">
            Loading applications...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we fetch
            the applications.
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

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />

          Back to Dashboard
        </button>

        {/* ERROR */}

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

      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/client/dashboard"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />

        Back to Dashboard
      </button>

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section>

        <h1 className="text-2xl font-bold text-slate-900">
          Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review workers who have applied
          to your jobs.
        </p>

      </section>

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* PENDING */}

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

        {/* ACCEPTED */}

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

        {/* REJECTED */}

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

      {/* =========================
          ACTION ERROR
      ========================= */}

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

      {/* =========================
          APPLICATIONS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">

        {/* HEADER */}

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-base font-semibold text-slate-900">
            Applicants
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Workers who have applied to
            your jobs.
          </p>

        </div>

        {/* LIST */}

        <div className="divide-y divide-slate-100">

          {applications.length === 0 ? (
            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <BriefcaseIcon className="h-6 w-6 text-slate-400" />

              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No applications yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Workers who apply to your
                jobs will appear here.
              </p>

            </div>
          ) : (
            applications.map(
              (application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
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
                    console.log(
                      "View worker:",
                      application.worker_name
                    );
                  }}
                />
              )
            )
          )}

        </div>

      </section>

    </div>
  );
};

export default Applications;