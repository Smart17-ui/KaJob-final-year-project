import {
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          {/* Hero skeleton */}
          <div className="mb-8 h-44 animate-pulse rounded-2xl bg-slate-200" />

          {/* Cards skeleton */}
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-200" />

                  <div className="min-w-0 flex-1">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>

                <div className="mt-6 h-10 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              Client dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Applications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review and manage applications submitted for your posted jobs.
            </p>
          </div>

          {/* Error card */}
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900">
                  Unable to load your jobs
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={loadJobs}
                  className="
                    mt-5 inline-flex items-center gap-2
                    rounded-xl bg-slate-900 px-4 py-2.5
                    text-sm font-semibold text-white
                    transition hover:bg-slate-800
                    focus:outline-none focus:ring-2
                    focus:ring-slate-400 focus:ring-offset-2
                  "
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              Client dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Applications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review and manage applications from workers interested in your
              jobs.
            </p>
          </div>

          {/* Empty hero */}
          <section className="relative mb-8 overflow-hidden rounded-2xl bg-slate-900 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
            {/* Soft lighting */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
                <BriefcaseIcon className="h-6 w-6 text-emerald-300" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                Get started
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                No jobs posted yet
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Post your first job and start receiving applications from
                workers in your area.
              </p>

              <button
                type="button"
                onClick={() => navigate("/client/dashboard/post-job")}
                className="
                  mt-6 inline-flex items-center gap-2
                  rounded-xl bg-slate-900 px-5 py-3
                  text-sm font-bold text-white
                  ring-1 ring-white/10
                  transition hover:bg-slate-800
                  focus:outline-none focus:ring-2
                  focus:ring-slate-500 focus:ring-offset-2
                  focus:ring-offset-slate-900
                "
              >
                <PlusIcon className="h-5 w-5 text-emerald-400" />
                Post your first job
              </button>
            </div>
          </section>

          {/* Empty state */}
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Your applications will appear here
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once you post a job, workers can apply for it. You will be able
              to review applicants, compare their profiles, and manage each
              job's applications from this page.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
            Client dashboard
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Applications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review workers who have applied to your posted jobs and manage
                each job's applications.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/client/dashboard/post-job")}
              className="
                inline-flex shrink-0 items-center justify-center gap-2
                rounded-xl bg-slate-900 px-4 py-2.5
                text-sm font-bold text-white
                shadow-sm transition
                hover:bg-slate-800
                focus:outline-none focus:ring-2
                focus:ring-slate-400 focus:ring-offset-2
              "
            >
              <PlusIcon className="h-5 w-5 text-emerald-400" />
              Post a job
            </button>
          </div>
        </div>

        {/* SUMMARY HERO */}
        <section className="relative mb-8 overflow-hidden rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-sm sm:px-8">
          {/* Soft lighting */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
                  <BriefcaseIcon className="h-6 w-6 text-emerald-300" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Posted jobs
                  </p>

                  <p className="mt-0.5 text-2xl font-bold">{jobs.length}</p>
                </div>
              </div>

              <h2 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl">
                Manage your job applications
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Select a job below to view applicants, review worker
                information, and manage the application process.
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <BriefcaseIcon className="h-9 w-9 text-emerald-300" />
              </div>
            </div>
          </div>
        </section>

        {/* JOBS SECTION */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Your jobs
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Select a job
              </h2>
            </div>

            <p className="hidden text-sm text-slate-500 sm:block">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleViewApplications(job.id)}
                className="
                  group w-full rounded-2xl
                  border border-slate-200 bg-white
                  p-5 text-left shadow-sm
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-emerald-300
                  hover:shadow-md
                  focus:outline-none
                  focus:ring-2 focus:ring-emerald-400
                  focus:ring-offset-2
                "
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="
                      flex h-12 w-12 shrink-0 items-center
                      justify-center rounded-xl
                      bg-emerald-50
                      transition-colors duration-200
                      group-hover:bg-emerald-100
                    "
                  >
                    <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
                  </div>

                  {/* Main content */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className="
                        truncate text-base font-bold
                        text-slate-900
                        transition-colors
                        group-hover:text-emerald-700
                      "
                    >
                      {job.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      View applicants and manage applications for this job.
                    </p>
                  </div>
                </div>

                {/* Bottom action strip */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Applications
                  </span>

                  <span
                    className="
                      inline-flex items-center justify-center
                      rounded-xl bg-slate-900
                      px-4 py-2
                      text-sm font-semibold text-white
                      shadow-sm
                      transition-all duration-200
                      group-hover:bg-slate-800
                    "
                  >
                    View applicants
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Applications;