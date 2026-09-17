import {
  ArrowPathIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyJobs } from "../../../components/services/jobService";

import type { MyJob } from "../../../shared/types/job";

const Applications = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadJobs = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getMyJobs();

      setJobs(response.results || []);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to load your jobs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleViewApplications = (jobId: number) => {
    navigate(`/client/dashboard/applications/${jobId}`);
  };

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">
            Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Select one of your jobs to review the workers who
            applied.
          </p>
        </section>

        <section className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading your jobs...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch your posted jobs.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Error state
   */
  if (errorMessage) {
    return (
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">
            Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Select one of your jobs to review the workers who
            applied.
          </p>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load your jobs
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadJobs}
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
   * Empty state
   */
  if (jobs.length === 0) {
    return (
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">
            Applications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Select one of your jobs to review the workers who
            applied.
          </p>
        </section>

        <section className="flex min-h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
              <BriefcaseIcon className="h-10 w-10 text-emerald-600" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              No jobs posted yet
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Once you post a job, workers can apply for it.
              Their applications will appear here for you to
              review.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/client/dashboard/post-job")
              }
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
            >
              <PlusIcon className="h-5 w-5" />
              Post a Job
            </button>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Jobs list
   */
  return (
    <div className="space-y-8">
      {/* Page header */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Applications
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Select a job to review the workers who applied
              for it.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/client/dashboard/post-job")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <PlusIcon className="h-5 w-5" />
            Post a Job
          </button>
        </div>
      </section>

      {/* Jobs */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Your Posted Jobs
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a job below to see and manage its
            applications.
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() =>
                handleViewApplications(job.id)
              }
              className="group w-full rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Job icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 transition group-hover:bg-emerald-100">
                  <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
                </div>

                {/* Job information */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-emerald-700">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    View workers who applied for this job
                  </p>
                </div>

                {/* Arrow */}
                <div className="shrink-0">
                  <ArrowRightIcon className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Applications;