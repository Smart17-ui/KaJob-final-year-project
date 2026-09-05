import {
  BriefcaseIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import EmptyJobs from "../../../components/my-jobs/EmptyJobs";
import JobCard from "../../../components/my-jobs/JobCard";
import JobFilters from "../../../components/my-jobs/JobFilters";

import {
  getMyJobs,
} from "../../../components/services/jobService";

import type {
  MyJob,
} from "../../../shared/types/job";

const MyJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [status, setStatus] = useState("ALL");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * =========================
   * LOAD JOBS
   * =========================
   */

  const loadJobs = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getMyJobs();

      setJobs(response.results);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to load your jobs."
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
    loadJobs();
  }, []);

  /*
   * =========================
   * FILTER JOBS
   * =========================
   */

  const filteredJobs = useMemo(() => {
    if (status === "ALL") {
      return jobs;
    }

    return jobs.filter(
      (job) => job.status === status
    );
  }, [jobs, status]);

  /*
   * =========================
   * VIEW JOB DETAILS
   * =========================
   */

  const handleViewJob = (jobId: number) => {
    navigate(
      `/client/dashboard/jobs/${jobId}`
    );
  };

  /*
   * =========================
   * POST JOB
   * =========================
   */

  const handlePostJob = () => {
    navigate(
      "/client/dashboard/post-job"
    );
  };

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <BriefcaseIcon className="h-6 w-6 text-green-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Jobs
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage the jobs you have posted.
                </p>
              </div>

            </div>
          </div>

        </div>

        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-green-600" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading your jobs...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch your jobs.
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
      <div className="space-y-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <BriefcaseIcon className="h-6 w-6 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Jobs
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage the jobs you have posted.
            </p>
          </div>

        </div>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

            <div className="flex-1">

              <h2 className="font-semibold text-red-800">
                Unable to load your jobs
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadJobs}
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
   * RENDER
   * =========================
   */

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                My Jobs
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage the jobs you have posted.
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={handlePostJob}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5" />

          Post a job
        </button>

      </div>

      {/* =========================
          FILTERS
      ========================= */}

      {jobs.length > 0 && (
        <JobFilters
          status={status}
          setStatus={setStatus}
        />
      )}

      {/* =========================
          NO JOBS
      ========================= */}

      {jobs.length === 0 ? (
        <EmptyJobs
          onPostJob={handlePostJob}
        />
      ) : filteredJobs.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">

          <BriefcaseIcon className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No jobs found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are no jobs matching the selected status.
          </p>

          <button
            type="button"
            onClick={() => setStatus("ALL")}
            className="mt-5 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Show all jobs
          </button>

        </section>
      ) : (
        <div className="space-y-4">

          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleViewJob}
            />
          ))}

        </div>
      )}

    </div>
  );
};

export default MyJobs;