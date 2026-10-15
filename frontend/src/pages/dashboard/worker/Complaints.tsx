import { useEffect, useState } from "react";

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import {
  REPORT_CATEGORY_LABELS,
  type ReportCategory,
  type ReportableJob,
} from "@/shared/types/report";

import {
  createReport,
  getReportableJobs,
} from "@/components/services/reportService";

type ComplaintType = "JOB" | "GENERAL";

const categoryOptions: ReportCategory[] = [
  "THEFT",
  "VIOLENCE",
  "HARASSMENT",
  "FRAUD",
  "PROPERTY_DAMAGE",
  "NO_SHOW",
  "POOR_CONDUCT",
  "OTHER",
];

export default function WorkerComplaints() {
  const [complaintType, setComplaintType] =
    useState<ComplaintType>("JOB");

  const [jobs, setJobs] = useState<ReportableJob[]>([]);

  const [selectedJobId, setSelectedJobId] =
    useState<string>("");

  const [category, setCategory] =
    useState<ReportCategory | "">("");

  const [description, setDescription] = useState("");

  const [isLoadingJobs, setIsLoadingJobs] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] =
    useState("");

  /* =========================================================
     LOAD REPORTABLE JOBS
  ========================================================= */

  const loadJobs = async () => {
    try {
      setIsLoadingJobs(true);
      setError("");

      const response = await getReportableJobs();
      const reportable = response.results || [];

      setJobs(reportable);

      /*
       * If there are no reportable jobs, default to the
       * "General issue" tab so the user isn't stuck on a
       * dead-end form. We only do this on first load — if
       * the user has already chosen a type, we respect it.
       */
      if (reportable.length === 0) {
        setComplaintType((current) =>
          current === "JOB" ? "GENERAL" : current
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reportable jobs."
      );
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  /* =========================================================
     SELECT COMPLAINT TYPE
  ========================================================= */

  const handleComplaintTypeChange = (
    type: ComplaintType
  ) => {
    setComplaintType(type);
    setSelectedJobId("");
    setCategory("");
    setDescription("");
    setError("");
    setSuccess(false);
    setReferenceNumber("");
  };

  /* =========================================================
     SELECTED JOB
  ========================================================= */

  const selectedJob =
    jobs.find(
      (job) => String(job.id) === selectedJobId
    ) || null;

  const hasReportableJobs = jobs.length > 0;

  /* =========================================================
     SUBMIT REPORT
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (complaintType === "JOB" && !selectedJob) {
      setError(
        "Please select a job before submitting a job-related complaint."
      );
      return;
    }

    if (
      complaintType === "JOB" &&
      selectedJob?.has_existing_report
    ) {
      setError(
        "You have already submitted a complaint for this job."
      );
      return;
    }

    if (!category) {
      setError("Please select a complaint category.");
      return;
    }

    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      setError("Please describe the issue.");
      return;
    }

    if (trimmedDescription.length < 20) {
      setError(
        "Please provide at least 20 characters describing the issue."
      );
      return;
    }

    if (trimmedDescription.length > 2000) {
      setError(
        "The description cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response =
        complaintType === "JOB" && selectedJob
          ? await createReport({
              job_id: selectedJob.id,
              category,
              description: trimmedDescription,
            })
          : await createReport({
              category,
              description: trimmedDescription,
            });

      setReferenceNumber(
        response.report.reference_number
      );
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit report."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     RESET AFTER SUCCESS
  ========================================================= */

  const handleDone = () => {
    setSuccess(false);
    setReferenceNumber("");
    setSelectedJobId("");
    setCategory("");
    setDescription("");
    setError("");

    loadJobs();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">

        {/* PAGE HEADER */}

        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Complaints
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Report an issue to the KaJob support team.
          </p>
        </div>

        {/* SUCCESS STATE */}

        {success ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircleIcon className="h-9 w-9 text-green-600" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900 sm:text-xl">
                Report submitted successfully
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your complaint has been received and will be
                reviewed by the KaJob support team.
              </p>

              {referenceNumber && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Reference number
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {referenceNumber}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Keep this reference number for future
                    follow-up.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleDone}
                className="mt-7 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* FORM HEADER */}

            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Report an Issue
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Provide the details below so we can
                    understand and investigate your complaint.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM CONTENT */}

            <div className="px-5 py-6 sm:px-6">

              {/* COMPLAINT TYPE */}

              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  What is this issue about?
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {/* JOB-RELATED */}

                  <button
                    type="button"
                    onClick={() => {
                      if (!hasReportableJobs) return;
                      handleComplaintTypeChange("JOB");
                    }}
                    disabled={
                      !hasReportableJobs || isLoadingJobs
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      !hasReportableJobs
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                        : complaintType === "JOB"
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <DocumentTextIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-600" />

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          Job-related issue
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {hasReportableJobs
                            ? "Report an issue involving a specific job or client."
                            : "You don't have any jobs to report yet."}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* GENERAL */}

                  <button
                    type="button"
                    onClick={() =>
                      handleComplaintTypeChange("GENERAL")
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      complaintType === "GENERAL"
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-600" />

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          General issue
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Report an issue that is not related to
                          a specific job.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* JOB SELECTION */}

              {complaintType === "JOB" && (
                <div className="mt-6">
                  <label
                    htmlFor="report-job"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Select job
                  </label>

                  {isLoadingJobs ? (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Loading your reportable jobs...
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-700">
                        You have no reportable jobs right now.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Job-related reports are available once a
                        client has assigned you to work. You can
                        still submit a general complaint above.
                      </p>
                    </div>
                  ) : (
                    <select
                      id="report-job"
                      value={selectedJobId}
                      onChange={(event) => {
                        setSelectedJobId(event.target.value);
                        setError("");
                      }}
                      disabled={isSubmitting}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    >
                      <option value="">Select a job...</option>

                      {jobs.map((job) => (
                        <option
                          key={job.id}
                          value={job.id}
                          disabled={job.has_existing_report}
                        >
                          {job.title} — Job #{job.id}
                          {job.has_existing_report
                            ? " (Already reported)"
                            : ""}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* SELECTED JOB DETAILS */}

                  {selectedJob && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                          <DocumentTextIcon className="h-5 w-5 text-slate-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Selected job
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selectedJob.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Job #{selectedJob.id}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white">
                            <UserCircleIcon className="h-5 w-5 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Client
                            </p>

                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {selectedJob.other_party?.full_name ||
                                "Client information unavailable"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GENERAL NOTICE */}

              {complaintType === "GENERAL" && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    General complaint
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    This complaint is not linked to a specific
                    job. Please provide enough detail for the
                    support team to understand and investigate
                    the issue.
                  </p>
                </div>
              )}

              {/* CATEGORY */}

              <div className="mt-6">
                <label
                  htmlFor="complaint-category"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Complaint category
                </label>

                <select
                  id="complaint-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as ReportCategory | ""
                    )
                  }
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                >
                  <option value="">Select a category...</option>

                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {REPORT_CATEGORY_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="complaint-description"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Description
                  </label>

                  <span className="text-xs text-slate-400">
                    {description.length}/2000
                  </span>
                </div>

                <textarea
                  id="complaint-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  disabled={isSubmitting}
                  rows={7}
                  maxLength={2000}
                  placeholder="Please explain what happened..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Please provide at least 20 characters.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />

                    <p className="text-sm leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingJobs}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
