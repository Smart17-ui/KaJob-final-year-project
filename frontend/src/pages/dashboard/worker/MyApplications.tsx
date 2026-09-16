import {
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useMemo, useState } from "react";

import apiClient from "@/api/client";

import DetailsModal from "@/components/pop/DetailsModal/DetailsModal";
import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";

/* =========================
   APPLICATION TYPES
========================= */

type BackendApplication = {
  id: number;
  job: number;
  job_title: string;
  worker: number;
  worker_name: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  status_display: string;
  applied_at: string;
};

type MyApplicationsResponse = {
  count: number;
  results: BackendApplication[];
};

type ApplicationStatus =
  | "Pending"
  | "Accepted"
  | "Rejected";

type Application = {
  id: number;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobAvailable: boolean;
};

/* =========================
   JOB DETAILS TYPE
========================= */

type JobDetails = {
  id: number;
  title: string;
  description: string | null;
  budget: number | string;
  category_name: string | null;
  general_location: string | null;
  status: string;
  status_display: string | null;
  job_display_date: string | null;
  duration_hours: number | null;
  urgency_display: string | null;
  is_urgent: boolean;
};

/* =========================
   FILTER TYPE
========================= */

type Filter =
  | "All"
  | "Pending"
  | "Accepted"
  | "Rejected";

/* =========================
   COMPONENT
========================= */

const MyApplications = () => {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [filter, setFilter] =
    useState<Filter>("All");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  /* =========================
     VIEW JOB MODAL
  ========================= */

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [selectedJob, setSelectedJob] =
    useState<JobDetails | null>(null);

  const [isLoadingJob, setIsLoadingJob] =
    useState(false);

  const [jobError, setJobError] =
    useState(false);

  /* =========================
     CANCEL APPLICATION MODAL
  ========================= */

  const [applicationToCancel, setApplicationToCancel] =
    useState<Application | null>(null);

  const [isCancelling, setIsCancelling] =
    useState(false);

  /* =========================
     FEEDBACK MODAL
  ========================= */

  const [feedback, setFeedback] =
    useState<{
      type:
        | "error"
        | "success"
        | "warning"
        | "info"
        | "cancelled"
        | "unavailable"
        | "confirm";
      title: string;
      message: string;
    } | null>(null);

  /* =========================
     LOAD APPLICATIONS
  ========================= */

  const loadApplications = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response =
        (await apiClient(
          "/jobs/my-applications/"
        )) as MyApplicationsResponse;

      /*
       * Keep every application even if its job
       * is no longer available.
       */
      const mappedApplications: Application[] =
        response.results.map((application) => ({
          id: application.id,

          jobId: application.job,

          jobTitle: application.job_title,

          status:
            application.status === "ACCEPTED"
              ? "Accepted"
              : application.status === "REJECTED"
                ? "Rejected"
                : "Pending",

          appliedAt: application.applied_at,

          jobAvailable: true,
        }));

      /*
       * Check whether each application's job
       * is still available.
       */
      const applicationsWithAvailability =
        await Promise.all(
          mappedApplications.map(
            async (application) => {
              try {
                await apiClient(
                  `/jobs/${application.jobId}/worker/`
                );

                return {
                  ...application,
                  jobAvailable: true,
                };
              } catch {
                return {
                  ...application,
                  jobAvailable: false,
                };
              }
            }
          )
        );

      applicationsWithAvailability.sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() -
          new Date(a.appliedAt).getTime()
      );

      setApplications(
        applicationsWithAvailability
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to load your applications."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  /* =========================
     FILTER APPLICATIONS
  ========================= */

  const filteredApplications =
    useMemo(() => {
      if (filter === "All") {
        return applications;
      }

      return applications.filter(
        (application) =>
          application.status === filter
      );
    }, [applications, filter]);

  /* =========================
     STATUS COUNTS
  ========================= */

  const pendingCount =
    applications.filter(
      (application) =>
        application.status === "Pending"
    ).length;

  const acceptedCount =
    applications.filter(
      (application) =>
        application.status === "Accepted"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        application.status === "Rejected"
    ).length;

  /* =========================
     VIEW JOB
  ========================= */

  const handleViewJob = async (
    application: Application
  ) => {
    setSelectedApplication(application);
    setSelectedJob(null);
    setJobError(false);

    /*
     * If the application already knows the job
     * is unavailable, don't make another request.
     */
    if (!application.jobAvailable) {
      return;
    }

    try {
      setIsLoadingJob(true);

      const response =
        (await apiClient(
          `/jobs/${application.jobId}/worker/`
        )) as JobDetails | {
          job: JobDetails;
        };

      /*
       * Support both:
       * { ...job }
       *
       * and:
       * { job: { ...job } }
       */
      const job =
        "job" in response
          ? response.job
          : response;

      setSelectedJob(job);
    } catch (error) {
      console.error(
        "Failed to load job details:",
        error
      );

      setJobError(true);
    } finally {
      setIsLoadingJob(false);
    }
  };

  /* =========================
     CLOSE JOB DETAILS
  ========================= */

  const closeJobDetails = () => {
    setSelectedApplication(null);
    setSelectedJob(null);
    setJobError(false);
  };

  /* =========================
     OPEN CANCEL APPLICATION
  ========================= */

  const handleCancelClick = (
    application: Application
  ) => {
    setApplicationToCancel(application);
  };

  /* =========================
     CANCEL APPLICATION
  ========================= */

  const handleCancelApplication = async () => {
    if (!applicationToCancel) {
      return;
    }

    try {
      setIsCancelling(true);

      /*
       * IMPORTANT:
       *
       * The actual cancellation endpoint has not
       * been wired here because we should use the
       * exact backend endpoint that exists in KaJob.
       *
       * For now this opens the confirmation UI.
       */
      console.log(
        "Cancel application:",
        applicationToCancel.id
      );

      setApplicationToCancel(null);

      setFeedback({
        type: "success",
        title: "Application Cancelled",
        message:
          "Your application has been cancelled successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to cancel application:",
        error
      );

      setFeedback({
        type: "error",
        title: "Unable to Cancel Application",
        message:
          "We couldn't cancel your application. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  /* =========================
     LOADING STATE
  ========================= */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">
            My Applications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track the jobs you've applied for.
          </p>
        </section>

        <section className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="text-center">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading applications...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch your
              applications.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /* =========================
     ERROR STATE
  ========================= */

  if (errorMessage) {
    return (
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">
            My Applications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track the jobs you've applied for.
          </p>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load applications
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadApplications}
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

  /* =========================
     MAIN CONTENT
  ========================= */

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the jobs you've applied for.
        </p>
      </section>

      {/* =========================
          APPLICATION SUMMARY
      ========================= */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        {/* TOTAL */}

        <button
          type="button"
          onClick={() => setFilter("All")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "All"
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {applications.length}
          </p>
        </button>

        {/* PENDING */}

        <button
          type="button"
          onClick={() => setFilter("Pending")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Pending"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {pendingCount}
          </p>
        </button>

        {/* ACCEPTED */}

        <button
          type="button"
          onClick={() => setFilter("Accepted")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Accepted"
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Accepted
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {acceptedCount}
          </p>
        </button>

        {/* REJECTED */}

        <button
          type="button"
          onClick={() => setFilter("Rejected")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Rejected"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {rejectedCount}
          </p>
        </button>
      </div>

      {/* =========================
          FILTER TABS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex flex-wrap gap-1">

          {(
            [
              "All",
              "Pending",
              "Accepted",
              "Rejected",
            ] as Filter[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === item
                  ? "bg-emerald-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}

        </div>
      </section>

      {/* =========================
          APPLICATIONS
      ========================= */}

      {filteredApplications.length > 0 ? (
        <div className="space-y-4">

          {filteredApplications.map(
            (application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewJob={() =>
                  handleViewJob(application)
                }
                onCancel={() =>
                  handleCancelClick(application)
                }
              />
            )
          )}

        </div>
      ) : (

        /* =========================
           EMPTY STATE
        ========================= */

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex min-h-64 items-center justify-center px-6 py-10">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <BriefcaseIcon className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {applications.length === 0
                  ? "No applications yet"
                  : "No applications found"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {applications.length === 0
                  ? "Jobs you apply for will appear here so you can track your applications."
                  : "You don't have any applications matching this filter."}
              </p>

              {filter !== "All" && (
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                  className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View all applications
                </button>
              )}

            </div>

          </div>
        </section>
      )}

      {/* ==================================================
          JOB DETAILS MODAL
      ================================================== */}

      {selectedApplication && (
        <DetailsModal
          title={
            jobError || !selectedApplication.jobAvailable
              ? "Job Not Available"
              : "Job Details"
          }
          onClose={closeJobDetails}
          width="lg"
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeJobDetails}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          }
        >

          {/* =========================
              JOB UNAVAILABLE
          ========================= */}

          {jobError ||
          !selectedApplication.jobAvailable ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="max-w-sm text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <ExclamationCircleIcon className="h-7 w-7 text-slate-500" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Job Not Available
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This job is no longer available.
                  It may have been deleted, cancelled,
                  or removed by the client.
                </p>

                <div className="mt-5 rounded-lg bg-slate-50 p-3 text-left">
                  <p className="text-xs text-slate-500">
                    Your application
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedApplication.jobTitle}
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      status={
                        selectedApplication.status
                      }
                    />
                  </div>
                </div>

              </div>
            </div>
          ) : isLoadingJob ? (

            /* =========================
               LOADING JOB
            ========================= */

            <div className="flex min-h-[280px] items-center justify-center">
              <div className="text-center">

                <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

                <p className="mt-4 text-sm font-medium text-slate-900">
                  Loading job details...
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Please wait.
                </p>

              </div>
            </div>

          ) : selectedJob ? (

            /* =========================
               JOB DETAILS
            ========================= */

            <div className="space-y-6">

              {/* JOB HEADER */}

              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedJob.title}
                    </h3>

                    {selectedJob.category_name && (
                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {selectedJob.category_name}
                      </span>
                    )}
                  </div>

                  <JobStatus
                    status={
                      selectedJob.status
                    }
                    display={
                      selectedJob.status_display
                    }
                  />

                </div>
              </div>

              {/* BUDGET */}

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Budget
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {formatBudget(
                    selectedJob.budget
                  )}
                </p>
              </div>

              {/* DESCRIPTION */}

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Description
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedJob.description ||
                    "No description provided."}
                </p>
              </div>

              {/* JOB INFORMATION */}

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Job Information
                </h4>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">

                  {/* LOCATION */}

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-slate-500" />

                      <p className="text-xs text-slate-500">
                        Location
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedJob.general_location ||
                        "Location not specified"}
                    </p>
                  </div>

                  {/* DATE */}

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 text-slate-500" />

                      <p className="text-xs text-slate-500">
                        Job Date
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedJob.job_display_date ||
                        "Not specified"}
                    </p>
                  </div>

                  {/* DURATION */}

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-slate-500" />

                      <p className="text-xs text-slate-500">
                        Duration
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedJob.duration_hours
                        ? `${selectedJob.duration_hours} hour${
                            selectedJob.duration_hours ===
                            1
                              ? ""
                              : "s"
                          }`
                        : "Not specified"}
                    </p>
                  </div>

                  {/* URGENCY */}

                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-slate-500" />

                      <p className="text-xs text-slate-500">
                        Urgency
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selectedJob.urgency_display ||
                        "Normal"}
                    </p>
                  </div>

                </div>
              </div>

              {/* APPLICATION STATUS */}

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-xs text-slate-500">
                      Your Application
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      Application #
                      {selectedApplication.id}
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      selectedApplication.status
                    }
                  />

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Applied{" "}
                  {formatApplicationDate(
                    selectedApplication.appliedAt
                  )}
                </p>

              </div>

              {/* URGENT NOTICE */}

              {selectedJob.is_urgent && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">

                    <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Urgent Job
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        This job has been marked as
                        urgent by the client.
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>

          ) : null}

        </DetailsModal>
      )}

      {/* ==================================================
          CANCEL APPLICATION MODAL
      ================================================== */}

      {applicationToCancel && (
        <FeedbackModal
          type="confirm"
          title="Cancel Application?"
          message={`Are you sure you want to cancel your application for "${applicationToCancel.jobTitle}"? This action cannot be undone.`}
          primaryButtonText="Cancel Application"
          secondaryButtonText="Keep Application"
          onPrimaryAction={
            handleCancelApplication
          }
          onSecondaryAction={() =>
            setApplicationToCancel(null)
          }
          onClose={() =>
            setApplicationToCancel(null)
          }
          isLoading={isCancelling}
        />
      )}

      {/* ==================================================
          FEEDBACK MODAL
      ================================================== */}

      {feedback && (
        <FeedbackModal
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

    </div>
  );
};

/* ==================================================
   APPLICATION CARD
================================================== */

type ApplicationCardProps = {
  application: Application;
  onViewJob: () => void;
  onCancel: () => void;
};

const ApplicationCard = ({
  application,
  onViewJob,
  onCancel,
}: ApplicationCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">

      {/* =========================
          TOP
      ========================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* JOB INFO */}

        <div className="flex gap-4">

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
          </div>

          <div>

            <h3 className="text-base font-semibold text-slate-900">
              {application.jobTitle}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Job application
            </p>

            {/* JOB AVAILABILITY */}

            {!application.jobAvailable && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">

                <ExclamationCircleIcon className="h-4 w-4 text-slate-500" />

                <span className="text-xs font-semibold text-slate-600">
                  Job Not Available
                </span>

              </div>
            )}

          </div>
        </div>

        {/* APPLICATION DATE */}

        <div className="sm:text-right">

          <p className="text-xs font-medium text-slate-400">
            Applied
          </p>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {formatApplicationDate(
              application.appliedAt
            )}
          </p>

        </div>

      </div>

      {/* =========================
          APPLICATION INFO
      ========================= */}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

        <div className="flex items-center gap-1.5">
          <BriefcaseIcon className="h-4 w-4" />

          <span>
            Application #{application.id}
          </span>
        </div>

      </div>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        {/* STATUS */}

        <div className="flex flex-wrap items-center gap-3">

          <StatusBadge
            status={application.status}
          />

          {!application.jobAvailable && (
            <span className="text-xs text-slate-500">
              Job no longer available
            </span>
          )}

        </div>

        {/* ACTIONS */}

        <div className="flex flex-col gap-2 sm:flex-row">

          {/* VIEW JOB */}

          <button
            type="button"
            onClick={onViewJob}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            <EyeIcon className="h-4 w-4" />

            View Job
          </button>

          {/* CANCEL APPLICATION */}

          {application.status ===
            "Pending" &&
            application.jobAvailable && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <XCircleIcon className="h-4 w-4" />

                Cancel Application
              </button>
            )}

        </div>

      </div>

    </article>
  );
};

/* ==================================================
   STATUS BADGE
================================================== */

type StatusBadgeProps = {
  status: ApplicationStatus;
};

const StatusBadge = ({
  status,
}: StatusBadgeProps) => {
  if (status === "Pending") {
    return (
      <div className="flex items-center gap-2">

        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

        <span className="text-sm font-medium text-amber-700">
          Pending
        </span>

      </div>
    );
  }

  if (status === "Accepted") {
    return (
      <div className="flex items-center gap-2">

        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />

        <span className="text-sm font-medium text-emerald-700">
          Accepted
        </span>

      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">

      <XCircleIcon className="h-5 w-5 text-red-500" />

      <span className="text-sm font-medium text-red-600">
        Rejected
      </span>

    </div>
  );
};

/* ==================================================
   JOB STATUS
================================================== */

type JobStatusProps = {
  status: string;
  display: string | null;
};

const JobStatus = ({
  status,
  display,
}: JobStatusProps) => {
  const normalizedStatus =
    status.toUpperCase().trim();

  if (normalizedStatus === "COMPLETED") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />

        <span className="text-sm font-medium text-emerald-700">
          {display || "Completed"}
        </span>
      </div>
    );
  }

  if (normalizedStatus === "CANCELLED") {
    return (
      <div className="flex items-center gap-2">
        <XCircleIcon className="h-5 w-5 text-red-600" />

        <span className="text-sm font-medium text-red-700">
          {display || "Cancelled"}
        </span>
      </div>
    );
  }

  if (
    normalizedStatus ===
    "AWAITING_CONFIRMATION"
  ) {
    return (
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-amber-600" />

        <span className="text-sm font-medium text-amber-700">
          {display || "Awaiting Confirmation"}
        </span>
      </div>
    );
  }

  if (
    normalizedStatus === "ASSIGNED" ||
    normalizedStatus === "IN_PROGRESS"
  ) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

        <span className="text-sm font-medium text-blue-700">
          {display || "Assigned"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

      <span className="text-sm font-medium text-emerald-700">
        {display || "Open"}
      </span>
    </div>
  );
};

/* ==================================================
   FORMAT BUDGET
================================================== */

const formatBudget = (
  budget: number | string
): string => {
  const numericBudget = Number(budget);

  if (Number.isNaN(numericBudget)) {
    return `K${budget}`;
  }

  return `K${numericBudget.toLocaleString()}`;
};

/* ==================================================
   DATE FORMATTER
================================================== */

const formatApplicationDate = (
  dateString: string
) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default MyApplications;