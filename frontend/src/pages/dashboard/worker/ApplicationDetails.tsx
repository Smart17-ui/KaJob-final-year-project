import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getWorkerJobDetails } from "@/api/jobs";
import { getMyApplications } from "@/components/services/applicationService";
import type { JobApplication } from "@/shared/types/application";

type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

interface JobDetails {
  id: number;
  title: string;
  description?: string;
  budget?: number;
  category_name?: string;
  general_location?: string;
  status?: string;
  status_display?: string;
  job_display_date?: string;
  duration_hours?: number;
  urgency_display?: string;
  is_urgent?: boolean;
}

const getApplicationStatus = (status: string): ApplicationStatus => {
  const normalized = status.toUpperCase();
  if (normalized === "ACCEPTED") return "ACCEPTED";
  if (normalized === "REJECTED") return "REJECTED";
  return "PENDING";
};

const formatDate = (date?: string): string => {
  if (!date) return "Date not available";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatBudget = (budget?: number): string => {
  if (budget === undefined || budget === null)
    return "Budget not specified";

  return `K${Number(budget).toLocaleString("en-US")}`;
};

const getStatusClasses = (status: ApplicationStatus): string => {
  switch (status) {
    case "ACCEPTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
};

const getStatusIndicator = (status: ApplicationStatus): string => {
  switch (status) {
    case "ACCEPTED":
      return "✓";
    case "REJECTED":
      return "×";
    default:
      return "•";
  }
};

const ApplicationDetails = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();

  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        if (!applicationId) throw new Error("Application not found.");

        const numericApplicationId = Number(applicationId);
        if (Number.isNaN(numericApplicationId))
          throw new Error("Invalid application ID.");

        const response = await getMyApplications();
        const results = response?.results ?? [];

        const found = results.find(
          (item: JobApplication) =>
            Number(item.id) === numericApplicationId
        );

        if (!found)
          throw new Error("The application could not be found.");

        const mapped: Application = {
          id: Number(found.id),
          jobId: Number(found.job),
          jobTitle: found.job_title || "Untitled Job",
          status: getApplicationStatus(String(found.status ?? "")),
          appliedAt: found.applied_at,
        };

        setApplication(mapped);

        try {
          const jobResponse = await getWorkerJobDetails(mapped.jobId);
          const jobData = jobResponse?.job ?? jobResponse;
          setJob(jobData as JobDetails);
        } catch {
          setJob(null);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load application details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
          <p className="mt-3 text-sm text-gray-500">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !application) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600">
            !
          </div>

          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            Unable to load application
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {errorMessage || "The application could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/worker/dashboard/applications")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 pb-8">
      {/* HEADER */}
      <section className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/worker/dashboard/applications")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Applications
        </button>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Application
            </p>

            <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
              Application Details
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Review your application and the job you applied for.
            </p>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
              application.status
            )}`}
          >
            <span className="text-sm">
              {getStatusIndicator(application.status)}
            </span>
            {application.status}
          </span>
        </div>
      </section>

      {/* APPLICATION INFO */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <span className="text-sm font-bold text-gray-600">A</span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Your Application
            </h2>

            <p className="text-xs text-gray-500">
              Application information
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">
              Application ID
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              #{application.id}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {application.status}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">
              Date Applied
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(application.appliedAt)}
            </p>
          </div>
        </div>

        {/* STATUS MESSAGE */}
        <div
          className={`mt-5 rounded-xl border p-4 ${
            application.status === "ACCEPTED"
              ? "border-emerald-100 bg-emerald-50"
              : application.status === "REJECTED"
              ? "border-red-100 bg-red-50"
              : "border-amber-100 bg-amber-50"
          }`}
        >
          {application.status === "ACCEPTED" && (
            <>
              <p className="text-sm font-semibold text-emerald-800">
                Application Accepted
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                The client selected you for this job. Your
                assigned work can be managed from My Work.
              </p>

              <button
                type="button"
                onClick={() => navigate("/worker/dashboard/my-work")}
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
              >
                Go to My Work
              </button>
            </>
          )}

          {application.status === "PENDING" && (
            <>
              <p className="text-sm font-semibold text-amber-800">
                Application Pending
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Your application is waiting for the client to
                review and respond.
              </p>
            </>
          )}

          {application.status === "REJECTED" && (
            <>
              <p className="text-sm font-semibold text-red-800">
                Application Not Accepted
              </p>
              <p className="mt-1 text-sm text-red-700">
                The client did not select your application for
                this job.
              </p>
            </>
          )}
        </div>
      </section>

      {/* JOB INFO */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Job
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
            {job?.title || application.jobTitle}
          </h2>
        </div>

        {job ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.status_display && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {job.status_display}
                </span>
              )}

              {job.urgency_display && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {job.urgency_display}
                </span>
              )}
            </div>

            {job.description && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Job Description
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {job.description}
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
              {job.budget !== undefined && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Budget
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {formatBudget(job.budget)}
                  </p>
                </div>
              )}

              {job.category_name && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Category
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {job.category_name}
                  </p>
                </div>
              )}

              {job.general_location && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Location
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {job.general_location}
                  </p>
                </div>
              )}

              {job.job_display_date && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Job Date
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {job.job_display_date}
                  </p>
                </div>
              )}

              {job.duration_hours !== undefined && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Duration
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {job.duration_hours} hour
                    {job.duration_hours === 1 ? "" : "s"}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Job details unavailable
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              The application exists, but the related job
              details could not be loaded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ApplicationDetails;
