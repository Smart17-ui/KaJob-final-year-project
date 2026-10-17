import { useCallback, useEffect, useState } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import { getCurrentUser } from "@/shared/auth";

import {
  getWorkerAnalytics,
  type WorkerAnalytics,
} from "@/api/analytics/worker";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value: number) =>
  `K${Number(value || 0).toLocaleString("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatPercentage = (value: number) =>
  `${Number(value || 0).toFixed(1)}%`;

const clampPercent = (value: number) =>
  Math.min(Math.max(Number(value || 0), 0), 100);

const formatDate = (value: string | null) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-600 bg-emerald-600 text-white";

    case "IN_PROGRESS":
    case "ASSIGNED":
      return "border-slate-900 bg-slate-900 text-white";

    case "CANCELLED":
      return "border-slate-900/30 bg-white text-slate-900/60";

    default:
      return "border-slate-900/30 bg-white text-slate-900";
  }
};

const getAccentClass = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-600";

    case "CANCELLED":
      return "bg-slate-900/20";

    default:
      return "bg-slate-900";
  }
};

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

const cardBase =
  "rounded-2xl border border-slate-900/10 bg-white shadow-sm shadow-slate-900/5";

/* -------------------------------------------------------------------------- */
/* Shared components                                                           */
/* -------------------------------------------------------------------------- */

const SectionHeading = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex items-stretch gap-3">
      <span
        className="w-1 rounded-full bg-emerald-600"
        aria-hidden="true"
      />

      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-sm text-slate-900/60">
          {description}
        </p>
      </div>
    </div>

    {action}
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-full bg-slate-50">
    <div
      className="mx-auto max-w-7xl animate-pulse px-5 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="rounded-3xl bg-slate-900 px-6 py-10 sm:px-10">
        <div className="h-4 w-28 rounded-full bg-white/15" />
        <div className="mt-4 h-9 w-72 rounded-lg bg-white/15" />
        <div className="mt-4 h-4 w-full max-w-md rounded bg-white/10" />
        <div className="mt-2 h-4 w-64 rounded bg-white/10" />
        <div className="mt-8 h-11 w-48 rounded-xl bg-emerald-600/70" />
      </div>

      <div className="mt-10 h-5 w-32 rounded bg-slate-900/10" />

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`h-36 ${cardBase}`} />
        ))}
      </div>

      <div className="mt-12 h-5 w-44 rounded bg-slate-900/10" />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`h-44 ${cardBase}`} />
        ))}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Worker dashboard                                                            */
/* -------------------------------------------------------------------------- */

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const firstName = user?.first_name || "there";

  const [analytics, setAnalytics] = useState<WorkerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const analyticsResponse = await getWorkerAnalytics();
      setAnalytics(analyticsResponse);
    } catch (error) {
      console.error("Failed to load worker dashboard:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard statistics."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const applicationsCount = analytics?.overview.total_applications ?? 0;
  const activeJobsCount = analytics?.jobs.active ?? 0;
  const completedJobsCount = analytics?.jobs.completed ?? 0;

  const recentJobs = analytics?.recent_jobs ?? [];
  const latestJob = recentJobs[0];

  const activityStats: {
    label: string;
    value: number;
    hint: string;
    icon: ElementType;
    to?: string;
  }[] = [
    {
      label: "Applications",
      value: applicationsCount,
      hint: "Total submitted",
      icon: ClipboardDocumentListIcon,
    },
    {
      label: "Active jobs",
      value: activeJobsCount,
      hint: "Currently assigned",
      icon: BriefcaseIcon,
      to: "/worker/dashboard/my-work",
    },
    {
      label: "Completed",
      value: completedJobsCount,
      hint: "Jobs finished",
      icon: CheckCircleIcon,
      to: "/worker/dashboard/my-work",
    },
  ];

  const performanceMetrics = analytics
    ? [
        {
          label: "Acceptance rate",
          value: formatPercentage(analytics.overview.acceptance_rate),
          caption: "of applications approved",
          icon: CheckCircleIcon,
          progress: clampPercent(analytics.overview.acceptance_rate),
        },
        {
          label: "Your rating",
          value: Number(
            analytics.performance.average_rating || 0
          ).toFixed(1),
          caption: `${analytics.performance.total_reviews} ${
            analytics.performance.total_reviews === 1 ? "review" : "reviews"
          }`,
          icon: StarIcon,
          progress: clampPercent(
            (Number(analytics.performance.average_rating || 0) / 5) * 100
          ),
        },
        {
          label: "Total earnings",
          value: formatCurrency(analytics.earnings.total),
          caption: "from completed work",
          icon: CurrencyDollarIcon,
          progress: null as number | null,
        },
        {
          label: "Completion rate",
          value: formatPercentage(analytics.performance.completion_rate),
          caption: "jobs finished successfully",
          icon: ClockIcon,
          progress: clampPercent(analytics.performance.completion_rate),
        },
      ]
    : [];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* ERROR STATE */}
        {errorMessage && (
          <div
            role="alert"
            className={`mb-6 flex flex-col gap-4 border-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between ${cardBase}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  We couldn’t load your dashboard
                </p>

                <p className="mt-0.5 text-sm text-slate-900/70">
                  {errorMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboardData()}
              className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white ${focusRing}`}
            >
              Try again
            </button>
          </div>
        )}

        {/* HERO */}
        <section aria-label="Welcome">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl shadow-slate-900/20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-emerald-600/25 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-36 left-1/4 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              {/* Greeting */}
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  Worker dashboard
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {getGreeting()}, {firstName}
                </h1>

                <p className="mt-3 text-base leading-7 text-white/80">
                  {activeJobsCount > 0
                    ? `You have ${activeJobsCount} active ${
                        activeJobsCount === 1 ? "job" : "jobs"
                      } in progress.`
                    : "You have no active jobs right now."}{" "}
                  Find your next opportunity and keep building your reputation
                  on KaJob.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/worker/dashboard/find-jobs")}
                  className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Browse available jobs

                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </button>
              </div>

              {/* Latest assignment */}
              {latestJob && (
                <button
                  type="button"
                  onClick={() => navigate("/worker/dashboard/my-work")}
                  className="group w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:w-96 lg:shrink-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white/70">
                      Latest assignment
                    </p>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        latestJob.status === "COMPLETED"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-white/30 text-white"
                      }`}
                    >
                      {latestJob.status_display || latestJob.status}
                    </span>
                  </div>

                  <h3 className="mt-3 truncate text-lg font-bold text-white">
                    {latestJob.title}
                  </h3>

                  <p className="mt-0.5 truncate text-sm text-white/70">
                    {latestJob.client_name}
                  </p>

                  <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs text-white/60">Budget</p>

                      <p className="mt-0.5 text-xl font-bold text-white">
                        {formatCurrency(latestJob.budget)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                      View work

                      <ArrowRightIcon className="h-4 w-4 text-emerald-600 transition group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="mt-12" aria-label="Your activity">
          <SectionHeading
            title="Your activity"
            description="A quick overview of your work on KaJob."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {activityStats.map((stat) => {
              const Icon = stat.icon;
              const Wrapper: ElementType = stat.to ? "button" : "div";

              return (
                <Wrapper
                  key={stat.label}
                  {...(stat.to
                    ? {
                        type: "button",
                        onClick: () => navigate(stat.to as string),
                      }
                    : {})}
                  className={`group relative overflow-hidden p-6 text-left transition hover:shadow-md hover:shadow-slate-900/10 ${cardBase} ${
                    stat.to ? focusRing : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-slate-900"
                  />

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900/70">
                        {stat.label}
                      </p>

                      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-sm text-slate-900/60">
                        {stat.hint}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </section>

        {/* PERFORMANCE */}
        {analytics && (
          <section className="mt-12" aria-label="Performance snapshot">
            <SectionHeading
              title="Performance snapshot"
              description="See how you are performing across your work."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {performanceMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.label}
                    className={`flex flex-col p-6 transition hover:shadow-md hover:shadow-slate-900/10 ${cardBase}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900/70">
                        {metric.label}
                      </p>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                      {metric.value}
                    </p>

                    <p className="mt-1 text-sm text-slate-900/60">
                      {metric.caption}
                    </p>

                    {metric.progress !== null && (
                      <div
                        className="mt-auto pt-5"
                        role="progressbar"
                        aria-label={metric.label}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(metric.progress)}
                      >
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/10">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-500 motion-reduce:transition-none"
                            style={{ width: `${metric.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RECENT WORK */}
        {analytics && recentJobs.length > 0 && (
          <section className="mt-12" aria-label="Recent work">
            <SectionHeading
              title="Recent work"
              description="Your most recently assigned jobs."
              action={
                <button
                  type="button"
                  onClick={() => navigate("/worker/dashboard/my-work")}
                  className={`group inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900/5 sm:self-auto ${focusRing}`}
                >
                  View all

                  <ArrowRightIcon className="h-4 w-4 text-emerald-600 transition group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </button>
              }
            />

            <div className="grid gap-4 lg:grid-cols-2">
              {recentJobs.slice(0, 4).map((job) => (
                <div
                  key={job.job_id}
                  className={`relative overflow-hidden p-5 pl-6 transition hover:shadow-md hover:shadow-slate-900/10 ${cardBase}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1.5 ${getAccentClass(
                      job.status
                    )}`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <BriefcaseIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {job.title}
                        </h3>

                        <p className="mt-0.5 truncate text-sm text-slate-900/60">
                          {job.client_name}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                        job.status
                      )}`}
                    >
                      {job.status_display || job.status}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-slate-900/10 pt-4">
                    <div>
                      <p className="text-xs text-slate-900/60">Assigned</p>

                      <p className="mt-0.5 text-sm font-medium text-slate-900">
                        {formatDate(job.assigned_at)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-900/60">Budget</p>

                      <p className="mt-0.5 text-base font-bold text-slate-900">
                        {formatCurrency(job.budget)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate("/worker/dashboard/my-work")}
                      className={`group inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900/5 ${focusRing}`}
                    >
                      View details

                      <ArrowRightIcon className="h-4 w-4 text-emerald-600 transition group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;