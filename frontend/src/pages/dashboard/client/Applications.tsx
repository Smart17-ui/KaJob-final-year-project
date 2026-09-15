import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getJobApplications,
  updateApplicationStatus,
} from "../../../components/services/applicationService";

import { getMyJobs } from "../../../components/services/jobService";

import ApplicationCard from "../../../components/application/ApplicationCard";

import WorkerDetailsCard from "@/components/application/WorkerDetailsCard";

import type { JobApplication } from "../../../shared/types/application";
import type { MyJob } from "../../../shared/types/job";

type ApplicationFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<MyJob | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedWorker, setSelectedWorker] =
    useState<JobApplication | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [actionApplicationId, setActionApplicationId] =
    useState<number | null>(null);

  const [activeFilter, setActiveFilter] =
    useState<ApplicationFilter>("ALL");

  const loadApplications = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!jobId) {
        throw new Error("NO_JOB_POSTED");
      }

      const parsedJobId = Number(jobId);

      if (!Number.isInteger(parsedJobId)) {
        throw new Error("The selected job could not be found.");
      }

      const jobsResponse = await getMyJobs();
      const jobs = jobsResponse.results || [];

      if (jobs.length === 0) {
        throw new Error("NO_JOB_POSTED");
      }

      const selectedJob = jobs.find(
        (item) => item.id === parsedJobId
      );

      if (!selectedJob) {
        throw new Error("The selected job could not be found.");
      }

      setJob(selectedJob);

      const response = await getJobApplications(parsedJobId);

      const jobApplications = response.results.map(
        (application) => ({
          ...application,
          job_title:
            application.job_title || selectedJob.title,
        })
      );

      jobApplications.sort(
        (a, b) =>
          new Date(b.applied_at).getTime() -
          new Date(a.applied_at).getTime()
      );

      setApplications(jobApplications);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to load applications.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const handleApplicationStatus = async (
    applicationId: number,
    status: "accept" | "reject"
  ) => {
    setActionApplicationId(applicationId);
    setActionError("");

    try {
      const response = await updateApplicationStatus(
        applicationId,
        status
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: response.application.status,
                status_display:
                  response.application.status_display,
              }
            : application
        )
      );

      setSelectedWorker((currentWorker) =>
        currentWorker &&
        currentWorker.id === applicationId
          ? {
              ...currentWorker,
              status: response.application.status,
              status_display:
                response.application.status_display,
            }
          : currentWorker
      );
    } catch (error) {
      if (error instanceof Error) {
        setActionError(error.message);
      } else {
        setActionError("Failed to update application.");
      }
    } finally {
      setActionApplicationId(null);
    }
  };

  const pendingCount = applications.filter(
    (application) => application.status === "PENDING"
  ).length;

  const acceptedCount = applications.filter(
    (application) => application.status === "ACCEPTED"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "REJECTED"
  ).length;

  const filteredApplications = applications.filter(
    (application) => {
      if (activeFilter === "ALL") return true;

      return application.status === activeFilter;
    }
  );

  const filterButtons: {
    label: string;
    value: ApplicationFilter;
    count: number;
    icon: typeof FunnelIcon;
  }[] = [
    {
      label: "All",
      value: "ALL",
      count: applications.length,
      icon: FunnelIcon,
    },
    {
      label: "Pending",
      value: "PENDING",
      count: pendingCount,
      icon: ExclamationCircleIcon,
    },
    {
      label: "Accepted",
      value: "ACCEPTED",
      count: acceptedCount,
      icon: CheckCircleIcon,
    },
    {
      label: "Rejected",
      value: "REJECTED",
      count: rejectedCount,
      icon: XCircleIcon,
    },
  ];

  /*
   * Friendly empty state when the client has no jobs.
   * This is intentionally NOT displayed as an error.
   */
  if (errorMessage === "NO_JOB_POSTED") {
    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() =>
            navigate("/client/dashboard/applications")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Applications
        </button>

        <section className="flex min-h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
              <BriefcaseIcon className="h-10 w-10 text-emerald-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              No job posted yet
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              You haven't posted a job yet. Once you post a
              job, workers can apply and their applications
              will appear here for you to review.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/client/dashboard/post-job")
              }
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
            >
              <BriefcaseIcon className="h-5 w-5" />
              Post a Job
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/client/dashboard")
              }
              className="mt-4 block w-full text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Go to Dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Real errors are still shown as errors.
   */
  if (errorMessage) {
    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() =>
            navigate("/client/dashboard/applications")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Applications
        </button>

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

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() =>
            navigate("/client/dashboard/applications")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Applications
        </button>

        <section className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="text-center">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading applications...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch the applicants for
              this job.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() =>
          navigate("/client/dashboard/applications")
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Applications
      </button>

      {/* Job header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Applications for
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {job?.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review workers who applied for this job.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-900">
                {pendingCount}
              </p>
            </div>

            <ExclamationCircleIcon className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Accepted
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {acceptedCount}
              </p>
            </div>

            <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">
                Rejected
              </p>

              <p className="mt-1 text-2xl font-bold text-red-900">
                {rejectedCount}
              </p>
            </div>

            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </section>

      {/* Action error */}
      {actionError && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />

            <p className="text-sm font-medium text-red-700">
              {actionError}
            </p>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((filter) => {
            const Icon = filter.icon;
            const isActive =
              activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.value)
                }
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />

                {filter.label}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Applications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Applicants
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review and manage workers who have applied for
            this job.
          </p>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <BriefcaseIcon className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {applications.length === 0
                  ? "No applications yet"
                  : "No applications found"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {applications.length === 0
                  ? "Workers who apply for this job will appear here. You’ll be able to review their profiles and choose the right person for the job."
                  : "There are no applications matching the selected filter."}
              </p>

              {applications.length === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/client/dashboard/applications"
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Applications
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onAccept={() =>
                  handleApplicationStatus(
                    application.id,
                    "accept"
                  )
                }
                onReject={() =>
                  handleApplicationStatus(
                    application.id,
                    "reject"
                  )
                }
                onViewWorker={() =>
                  setSelectedWorker(application)
                }
                isUpdating={
                  actionApplicationId === application.id
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Worker details */}
      {selectedWorker && (
        <WorkerDetailsCard
          application={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onAccept={() =>
            handleApplicationStatus(
              selectedWorker.id,
              "accept"
            )
          }
          onReject={() =>
            handleApplicationStatus(
              selectedWorker.id,
              "reject"
            )
          }
          isUpdating={
            actionApplicationId === selectedWorker.id
          }
        />
      )}
    </div>
  );
};

export default JobApplications;