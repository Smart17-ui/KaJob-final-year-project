import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import { getCurrentUser } from "@/shared/auth";

import {
  getWorkerAnalytics,
  type WorkerAnalytics,
} from "@/api/analytics/worker";

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const user = getCurrentUser();

  const firstName = user?.first_name || "there";

  const [analytics, setAnalytics] =
    useState<WorkerAnalytics | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const analyticsResponse =
          await getWorkerAnalytics();

        setAnalytics(analyticsResponse);
      } catch (error) {
        console.error(
          "Failed to load worker dashboard:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Failed to load dashboard statistics."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const formatCurrency = (
    value: number
  ) => {
    return `K${Number(value || 0).toLocaleString(
      "en-ZM",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatPercentage = (
    value: number
  ) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString(
      "en-ZM",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "IN_PROGRESS":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "ASSIGNED":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  const applicationsCount =
    analytics?.overview.total_applications ?? 0;

  const activeJobsCount =
    analytics?.jobs.active ?? 0;

  const completedJobsCount =
    analytics?.jobs.completed ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          {/* Hero skeleton */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="animate-pulse bg-slate-900 px-6 py-8 sm:px-8 sm:py-10">
              <div className="h-3 w-24 rounded-full bg-slate-700" />
              <div className="mt-4 h-8 w-48 rounded-lg bg-slate-700" />
              <div className="mt-4 h-4 max-w-md rounded bg-slate-700" />
              <div className="mt-2 h-4 w-64 rounded bg-slate-700" />
              <div className="mt-7 h-11 w-44 rounded-xl bg-slate-700" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="mt-8">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          </div>

          {/* Performance skeleton */}
          <div className="mt-10">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {/* PAGE INTRODUCTION */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Worker Dashboard
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Keep track of your applications, jobs and performance.
          </p>
        </div>

        {/* ERROR STATE */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <span className="text-sm font-bold text-red-600">
                !
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load your dashboard
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* HERO */}
        <section>
          <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)]">
            {/* Soft lighting */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Welcome back
                  </p>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Hi, {firstName}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  {activeJobsCount > 0
                    ? `You currently have ${activeJobsCount} active ${
                        activeJobsCount === 1
                          ? "job"
                          : "jobs"
                      }.`
                    : "You currently have no active jobs."}{" "}
                  Find your next opportunity and keep building
                  your reputation on KaJob.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/find-jobs"
                    )
                  }
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-emerald-500
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    duration-200
                    hover:bg-emerald-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-emerald-400
                    focus:ring-offset-2
                    focus:ring-offset-slate-900
                  "
                >
                  Browse available jobs

                  
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Your activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                A quick overview of your work on KaJob.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* APPLICATIONS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Applications
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {applicationsCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Total submitted
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition group-hover:bg-slate-100">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* ACTIVE JOBS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Active Jobs
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-amber-600">
                    {activeJobsCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Currently assigned
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                  <BriefcaseIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* COMPLETED */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Completed
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                    {completedJobsCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Jobs finished
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE */}
        {analytics && (
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Performance snapshot
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                See how you are performing across your work.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* ACCEPTANCE RATE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acceptance rate
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  {formatPercentage(
                    analytics.overview.acceptance_rate
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  of applications approved
                </p>

                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          Number(
                            analytics.overview
                              .acceptance_rate || 0
                          ),
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* RATING */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Your rating
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                    <StarIcon className="h-5 w-5 text-amber-500" />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  {Number(
                    analytics.performance.average_rating || 0
                  ).toFixed(1)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {analytics.performance.total_reviews}{" "}
                  {analytics.performance.total_reviews === 1
                    ? "review"
                    : "reviews"}
                </p>

                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          (Number(
                            analytics.performance
                              .average_rating || 0
                          ) /
                            5) *
                            100,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* EARNINGS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total earnings
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(
                    analytics.earnings.total
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  from completed work
                </p>

                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-blue-500" />
                </div>
              </div>

              {/* COMPLETION RATE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Completion rate
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  {formatPercentage(
                    analytics.performance.completion_rate
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  jobs finished successfully
                </p>

                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          Number(
                            analytics.performance
                              .completion_rate || 0
                          ),
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RECENT WORK */}
        {analytics &&
          analytics.recent_jobs &&
          analytics.recent_jobs.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recent work
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your most recently assigned jobs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/my-work"
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    self-start
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-emerald-600
                    transition
                    hover:bg-emerald-50
                    hover:text-emerald-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-emerald-200
                    sm:self-auto
                  "
                >
                  View all

                 
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {analytics.recent_jobs
                  .slice(0, 4)
                  .map((job) => (
                    <div
                      key={job.job_id}
                      className="
                        group
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-5
                        shadow-sm
                        transition
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-md
                      "
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                              <BriefcaseIcon className="h-4 w-4 text-slate-500" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {job.title}
                              </h3>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {job.client_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`
                            inline-flex
                            shrink-0
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            ${getStatusClass(
                              job.status
                            )}
                          `}
                        >
                          {job.status_display ||
                            job.status}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Assigned
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {formatDate(
                              job.assigned_at
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Budget
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {formatCurrency(
                              job.budget
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/worker/dashboard/my-work"
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                            hover:text-slate-900
                            focus:outline-none
                            focus:ring-2
                            focus:ring-slate-200
                          "
                        >
                          View details

                          
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* EMPTY RECENT WORK */}
        {analytics &&
          (!analytics.recent_jobs ||
            analytics.recent_jobs.length === 0) && (
            <section className="mt-10">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                  <BriefcaseIcon className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  No recent work yet
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                  Once you are assigned jobs, your recent work
                  will appear here.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/worker/dashboard/find-jobs"
                    )
                  }
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-900
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-slate-800
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-300
                    focus:ring-offset-2
                  "
                >
                  Find jobs

                
                </button>
              </div>
            </section>
          )}
      </div>
    </div>
  );
};

export default WorkerDashboard;