import { useEffect, useMemo, useState } from "react";

import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import {
  getClientAnalytics,
  getClientTrends,
  type ClientAnalytics,
  type ClientTrendsResponse,
} from "@/api/analytics/client";

const Analytics = () => {
  const [analytics, setAnalytics] =
    useState<ClientAnalytics | null>(null);

  const [trends, setTrends] =
    useState<ClientTrendsResponse | null>(null);

  const [selectedPeriod, setSelectedPeriod] =
    useState<"week" | "month" | "quarter">("month");

  const [isLoading, setIsLoading] = useState(true);

  const [isTrendLoading, setIsTrendLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const analyticsResponse =
          await getClientAnalytics();

        setAnalytics(analyticsResponse);

        try {
          const trendsResponse =
            await getClientTrends("month");

          setTrends(trendsResponse);
        } catch (trendError) {
          console.error(
            "Failed to load client trends:",
            trendError
          );
        }
      } catch (error) {
        console.error(
          "Failed to load client analytics:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Failed to load analytics data."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  useEffect(() => {
    if (selectedPeriod === "month") {
      return;
    }

    const loadTrend = async () => {
      setIsTrendLoading(true);

      try {
        const response =
          await getClientTrends(selectedPeriod);

        setTrends(response);
      } catch (error) {
        console.error(
          "Failed to load client trends:",
          error
        );
      } finally {
        setIsTrendLoading(false);
      }
    };

    loadTrend();
  }, [selectedPeriod]);

  const formatCurrency = (value: number | string) => {
    return `K${Number(value || 0).toLocaleString(
      "en-ZM",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatPercentage = (
    value: number | string
  ) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString("en-ZM", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatShortDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-ZM", {
      day: "numeric",
      month: "short",
    });
  };

  const completionRate = useMemo(() => {
    if (!analytics?.jobs.total) {
      return 0;
    }

    return (
      (analytics.jobs.completed /
        analytics.jobs.total) *
      100
    );
  }, [analytics]);

  const averagePerJob = useMemo(() => {
    if (!analytics?.jobs.total) {
      return 0;
    }

    return (
      Number(analytics.spending.total || 0) /
      analytics.jobs.total
    );
  }, [analytics]);

  const getActivityText = (
    activity: ClientAnalytics["recent_activity"][number]
  ) => {
    if (activity.type === "job_posted") {
      return `You posted "${activity.title}"`;
    }

    if (
      activity.type ===
      "application_received"
    ) {
      return `${activity.worker_name} applied for "${activity.job_title}"`;
    }

    if (
      activity.type === "worker_assigned"
    ) {
      return `${activity.worker_name} was assigned to "${activity.job_title}"`;
    }

    return "Recent activity";
  };

  const getActivityStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "COMPLETED":
      case "ACCEPTED":
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";

      case "PENDING":
      case "ASSIGNED":
      case "ACTIVE":
        return "border border-amber-200 bg-amber-50 text-amber-700";

      case "IN_PROGRESS":
        return "border border-blue-200 bg-blue-50 text-blue-700";

      case "REJECTED":
      case "CANCELLED":
        return "border border-red-200 bg-red-50 text-red-700";

      default:
        return "border border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  const chartData = useMemo(() => {
    if (!trends?.data) {
      return [];
    }

    return trends.data;
  }, [trends]);

  const maxJobs = useMemo(() => {
    if (!chartData.length) {
      return 1;
    }

    return Math.max(
      ...chartData.map(
        (item) => item.jobs_posted
      ),
      1
    );
  }, [chartData]);

  const totalTrendJobs = useMemo(() => {
    return chartData.reduce(
      (total, item) => total + item.jobs_posted,
      0
    );
  }, [chartData]);

  const totalTrendApplications = useMemo(() => {
    return chartData.reduce(
      (total, item) =>
        total + item.applications_received,
      0
    );
  }, [chartData]);

  const totalTrendCompleted = useMemo(() => {
    return chartData.reduce(
      (total, item) =>
        total + item.jobs_completed,
      0
    );
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage && !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Client Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Track your jobs, spending, applications,
              and hiring activity.
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <p className="font-semibold text-red-800">
                  Unable to load your analytics
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Client Dashboard
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep track of your jobs, hiring activity,
                spending, and overall project progress.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR NOTICE */}
        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Some analytics could not be loaded
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                    <BriefcaseIcon className="h-5 w-5 text-emerald-300" />
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Your projects
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-5">
                  <div>
                    <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                      {analytics.jobs.total}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      total jobs posted
                    </p>
                  </div>

                  <div className="h-12 w-px bg-slate-700" />

                  <div>
                    <p className="text-2xl font-bold text-amber-300">
                      {formatCurrency(
                        analytics.spending.total
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      total job budget
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-bold text-white">
                    {analytics.jobs.completed}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Completed
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-bold text-white">
                    {analytics.jobs.open}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Open
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xl font-bold text-emerald-300">
                    {formatPercentage(
                      completionRate
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="mb-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Overview
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Quick stats
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* APPLICATIONS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Hiring
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Applications
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {analytics.applications.total}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {analytics.applications.pending}{" "}
                pending review
              </p>
            </div>

            {/* COMPLETION */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Progress
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Completion
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {formatPercentage(
                  completionRate
                )}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                of your jobs completed
              </p>
            </div>

            {/* WORKERS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Workforce
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Workers hired
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {analytics.workers.total_hired}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {analytics.workers.active} currently
                active
              </p>
            </div>

            {/* AVG PER JOB */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                  <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Budget
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Avg per job
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {formatCurrency(averagePerJob)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                average budget allocation
              </p>
            </div>
          </div>
        </section>

        {/* JOB ACTIVITY + HIRING OVERVIEW */}
        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* JOB ACTIVITY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Trends
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  Job activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Jobs posted over the selected period.
                </p>
              </div>

              <select
                value={selectedPeriod}
                onChange={(event) =>
                  setSelectedPeriod(
                    event.target.value as
                      | "week"
                      | "month"
                      | "quarter"
                  )
                }
                className="
                  rounded-xl border border-slate-200
                  bg-white px-3.5 py-2.5
                  text-sm font-medium text-slate-700
                  shadow-sm outline-none transition
                  hover:border-slate-300
                  focus:border-emerald-500
                  focus:ring-2 focus:ring-emerald-100
                "
              >
                <option value="week">
                  Last 7 days
                </option>

                <option value="month">
                  Last 30 days
                </option>

                <option value="quarter">
                  Last 90 days
                </option>
              </select>
            </div>

            {isTrendLoading ? (
              <div className="mt-6 flex h-64 items-center justify-center rounded-2xl bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading trend data...
                  </p>
                </div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <div className="text-center">
                  <BriefcaseIcon className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No trend data available
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Activity will appear here as you
                    post jobs.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                  <div className="overflow-x-auto">
                    <div
                      className="flex h-60 items-end gap-2"
                      style={{
                        minWidth:
                          chartData.length > 14
                            ? `${chartData.length * 40}px`
                            : "100%",
                      }}
                    >
                      {chartData.map((item) => {
                        const height =
                          (item.jobs_posted /
                            maxJobs) *
                          100;

                        return (
                          <div
                            key={item.date}
                            className="group flex h-full min-w-[28px] flex-1 flex-col items-center justify-end gap-2"
                          >
                            <span className="rounded-md bg-slate-800 px-1.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                              {item.jobs_posted}
                            </span>

                            <div className="flex h-full w-full items-end">
                              <div
                                className="
                                  w-full rounded-t-lg
                                  bg-amber-500
                                  transition-all duration-300
                                  group-hover:bg-amber-600
                                "
                                style={{
                                  height: `${Math.max(
                                    height,
                                    item.jobs_posted > 0
                                      ? 4
                                      : 0
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                              {formatShortDate(
                                item.date
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Jobs posted
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {totalTrendJobs}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Applications
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {totalTrendApplications}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Completed
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {totalTrendCompleted}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HIRING OVERVIEW */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Hiring
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Hiring overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your current hiring status.
            </p>

            <div className="mt-7 space-y-6">
              {/* APPLICATIONS */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Applications
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {analytics.applications.total}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${
                        analytics.applications
                          .total > 0
                          ? Math.min(
                              (analytics
                                .applications
                                .accepted /
                                analytics
                                  .applications
                                  .total) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {analytics.applications.accepted}{" "}
                  accepted
                </p>
              </div>

              {/* COMPLETION */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Completion rate
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {formatPercentage(
                      completionRate
                    )}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        completionRate,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* WORKERS */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Workers hired
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {
                      analytics.workers
                        .total_hired
                    }
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${
                        analytics.jobs.total >
                        0
                          ? Math.min(
                              (analytics.workers
                                .total_hired /
                                analytics.jobs
                                  .total) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RATING */}
            <div className="mt-7 rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <StarIcon className="h-5 w-5 text-amber-600" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Worker rating
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {Number(
                      analytics.workers
                        .average_rating || 0
                    ).toFixed(1)}

                    <span className="ml-1 text-sm font-medium text-slate-400">
                      / 5
                    </span>
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Based on{" "}
                {analytics.workers.total_reviews}{" "}
                reviews.
              </p>
            </div>
          </div>
        </section>

        {/* SPENDING + CATEGORIES */}
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* SPENDING */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Budget
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  Spending
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Budget allocation across jobs.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>

            <div className="mt-7">
              <p className="text-4xl font-bold tracking-tight text-slate-900">
                {formatCurrency(
                  analytics.spending.total
                )}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Total job budget
              </p>
            </div>

            <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-600">
                  Completed jobs
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(
                    analytics.spending.completed
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-600">
                  Active jobs
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(
                    analytics.spending.in_progress
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm font-medium text-slate-600">
                  Average per job
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(averagePerJob)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-800">
                Budget note
              </p>

              <p className="mt-1.5 text-xs leading-5 text-blue-700">
                This shows job budgets, not confirmed
                payments.
              </p>
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Activity
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Popular categories
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your most frequently posted job types.
            </p>

            {analytics.top_categories.length ===
            0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <BriefcaseIcon className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No job categories yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Categories will appear as you post
                  jobs.
                </p>
              </div>
            ) : (
              <div className="mt-7 space-y-5">
                {analytics.top_categories.map(
                  (category) => {
                    const maximum =
                      analytics.top_categories[0]
                        ?.count || 1;

                    const percentage =
                      Math.min(
                        (category.count /
                          maximum) *
                          100,
                        100
                      );

                    return (
                      <div
                        key={category.name}
                      >
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <span className="truncate text-sm font-medium text-slate-700">
                            {category.name}
                          </span>

                          <span className="shrink-0 text-sm font-bold text-slate-900">
                            {category.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* JOB STATUS + WORKER FEEDBACK */}
        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* JOB STATUS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Projects
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Job status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current breakdown of your posted jobs.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* OPEN */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                  <BriefcaseIcon className="h-4 w-4 text-slate-500" />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Open
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {analytics.jobs.open}
                </p>
              </div>

              {/* ASSIGNED */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 transition hover:border-amber-200 hover:bg-amber-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
                  <UserGroupIcon className="h-4 w-4 text-amber-600" />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Assigned
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-800">
                  {analytics.jobs.assigned}
                </p>
              </div>

              {/* IN PROGRESS */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                  In Progress
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-800">
                  {analytics.jobs.in_progress}
                </p>
              </div>

              {/* COMPLETED */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Completed
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  {analytics.jobs.completed}
                </p>
              </div>

              {/* CANCELLED */}
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 transition hover:border-red-200 hover:bg-red-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
                  <XCircleIcon className="h-4 w-4 text-red-600" />
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700">
                  Cancelled
                </p>

                <p className="mt-1 text-2xl font-bold text-red-800">
                  {analytics.jobs.cancelled}
                </p>
              </div>
            </div>
          </div>

          {/* WORKER FEEDBACK */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Feedback
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Worker ratings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Feedback from your workers.
            </p>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                <StarIcon className="h-7 w-7 text-amber-500" />
              </div>

              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {Number(
                    analytics.workers
                      .average_rating || 0
                  ).toFixed(1)}

                  <span className="ml-1 text-sm font-medium text-slate-400">
                    / 5
                  </span>
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {analytics.workers.total_reviews}{" "}
                  reviews
                </p>
              </div>
            </div>

            <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-600">
                  Total hired
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {
                    analytics.workers
                      .total_hired
                  }
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-600">
                  Currently active
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {analytics.workers.active}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-600">
                  Completed jobs
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {
                    analytics.workers
                      .completed
                  }
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Timeline
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Recent activity
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {analytics.recent_activity.length ===
            0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                  <ClockIcon className="h-6 w-6 text-slate-300" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-600">
                  No recent activity yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Your job activity will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.recent_activity.map(
                  (activity, index) => (
                    <div
                      key={`${activity.timestamp}-${index}`}
                      className="
                        flex flex-col gap-4
                        px-5 py-5 transition
                        hover:bg-slate-50/70
                        sm:flex-row sm:items-center
                        sm:justify-between sm:px-6
                      "
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium leading-6 text-slate-900">
                            {getActivityText(
                              activity
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(
                              activity.timestamp
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`
                          inline-flex w-fit shrink-0
                          rounded-full px-3 py-1.5
                          text-xs font-semibold
                          ${getActivityStatusClass(
                            activity.status
                          )}
                        `}
                      >
                        {activity.status}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;