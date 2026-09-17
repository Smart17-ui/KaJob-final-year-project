import { useEffect, useMemo, useState } from "react";

import {
  BriefcaseIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import {
  getClientAnalytics,
  getClientTrends,
  type ClientAnalytics,
  type ClientTrendsResponse,
} from "@/api/analytics/client";

/* =========================
   COMPONENT
========================= */

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

  /* =========================
     LOAD ANALYTICS
  ========================= */

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

  /* =========================
     LOAD TREND
  ========================= */

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

  /* =========================
     HELPERS
  ========================= */

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

  /* =========================
     CALCULATED VALUES
  ========================= */

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

  const withdrawnApplications = 0;

  /* =========================
     ACTIVITY HELPERS
  ========================= */

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
        return "bg-emerald-100 text-emerald-700";

      case "PENDING":
      case "ASSIGNED":
      case "ACTIVE":
        return "bg-amber-100 text-amber-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  /* =========================
     TREND CHART DATA
  ========================= */

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

  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your jobs, spending,
            applications and hiring activity.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Loading your analytics...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (errorMessage && !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your jobs, spending,
            applications and hiring activity.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-6">
      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your jobs, spending,
          applications and hiring activity.
        </p>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* JOBS POSTED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500">
              Jobs Posted
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {analytics.jobs.total}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {analytics.jobs.open} currently
              open
            </p>
          </div>
        </div>

        {/* COMPLETED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500">
              Jobs Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {analytics.jobs.completed}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {formatPercentage(
                completionRate
              )}{" "}
              completion rate
            </p>
          </div>
        </div>

        {/* TOTAL BUDGET */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500">
              Total Job Budget
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatCurrency(
                analytics.spending.total
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Across all posted jobs
            </p>
          </div>
        </div>

        {/* APPLICATIONS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <UserGroupIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500">
              Applications
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {analytics.applications.total}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {analytics.applications.pending}{" "}
              pending
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          JOB TREND + HIRING
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* JOBS CHART */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Job Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Jobs posted over the selected
                period
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
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-emerald-500"
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
            <div className="mt-8 flex h-64 items-center justify-center">
              <p className="text-sm text-slate-500">
                Loading trend data...
              </p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="mt-8 flex h-64 items-center justify-center">
              <p className="text-sm text-slate-500">
                No trend data available.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <div
                className="flex h-64 items-end gap-3"
                style={{
                  minWidth:
                    chartData.length > 14
                      ? `${chartData.length * 34}px`
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
                      className="flex h-full min-w-[24px] flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[10px] font-medium text-slate-500">
                        {item.jobs_posted}
                      </span>

                      <div className="flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-md bg-emerald-500 transition-all"
                          style={{
                            height: `${Math.max(
                              height,
                              item.jobs_posted >
                                0
                                ? 4
                                : 0
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="whitespace-nowrap text-[10px] text-slate-400">
                        {formatShortDate(
                          item.date
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Jobs posted
            </div>

            <div>
              Applications received:{" "}
              <span className="font-semibold text-slate-700">
                {chartData.reduce(
                  (total, item) =>
                    total +
                    item.applications_received,
                  0
                )}
              </span>
            </div>

            <div>
              Jobs completed:{" "}
              <span className="font-semibold text-slate-700">
                {chartData.reduce(
                  (total, item) =>
                    total +
                    item.jobs_completed,
                  0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* HIRING OVERVIEW */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Hiring Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your current hiring activity
          </p>

          <div className="mt-6 space-y-5">
            {/* APPLICATIONS */}

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Applications received
                </span>

                <span className="font-semibold text-slate-900">
                  {analytics.applications.total}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
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
            </div>

            {/* WORKERS HIRED */}

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Workers hired
                </span>

                <span className="font-semibold text-slate-900">
                  {
                    analytics.workers
                      .total_hired
                  }
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
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

            {/* COMPLETED */}

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Jobs completed
                </span>

                <span className="font-semibold text-slate-900">
                  {
                    analytics.jobs
                      .completed
                  }
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      completionRate,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Completion rate
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatPercentage(
                completionRate
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {analytics.jobs.completed} of{" "}
              {analytics.jobs.total} jobs
              completed
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          SPENDING + CATEGORIES
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SPENDING */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Spending
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Based on the budgets of your
                posted jobs
              </p>
            </div>

            <CurrencyDollarIcon className="h-10 w-10 text-emerald-500" />
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(
                analytics.spending.total
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Total job budget
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Completed jobs
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(
                  analytics.spending
                    .completed
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Active jobs
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(
                  analytics.spending
                    .in_progress
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Average per job
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(
                  averagePerJob
                )}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Note
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              This figure represents job budgets.
              It does not represent confirmed
              payments.
            </p>
          </div>
        </div>

        {/* POPULAR CATEGORIES */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Popular Job Categories
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Categories you post most frequently
          </p>

          {analytics.top_categories.length ===
          0 ? (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                No job categories available yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {analytics.top_categories.map(
                (category) => {
                  const maximum =
                    analytics.top_categories[0]
                      ?.count || 1;

                  const percentage =
                    (category.count /
                      maximum) *
                    100;

                  return (
                    <div
                      key={category.name}
                    >
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">
                          {category.name}
                        </span>

                        <span className="text-sm font-medium text-slate-900">
                          {category.count}{" "}
                          {category.count ===
                          1
                            ? "job"
                            : "jobs"}
                        </span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
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
      </div>

      {/* =========================
          STATUS + WORKER RATING
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* JOB STATUS */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Job Status
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current status of your posted jobs
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg bg-slate-50 p-4">
              <BriefcaseIcon className="h-5 w-5 text-slate-500" />

              <p className="mt-3 text-xs text-slate-500">
                Open
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {analytics.jobs.open}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <UserGroupIcon className="h-5 w-5 text-slate-500" />

              <p className="mt-3 text-xs text-slate-500">
                Assigned
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {analytics.jobs.assigned}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <ClockIcon className="h-5 w-5 text-slate-500" />

              <p className="mt-3 text-xs text-slate-500">
                In Progress
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {analytics.jobs.in_progress}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />

              <p className="mt-3 text-xs text-slate-500">
                Completed
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {analytics.jobs.completed}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <XCircleIcon className="h-5 w-5 text-red-500" />

              <p className="mt-3 text-xs text-slate-500">
                Cancelled
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {analytics.jobs.cancelled}
              </p>
            </div>
          </div>
        </div>

        {/* WORKER FEEDBACK */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Worker Feedback
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Ratings from workers
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <StarIcon className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">
                {Number(
                  analytics.workers
                    .average_rating || 0
                ).toFixed(1)}
                <span className="ml-1 text-sm font-medium text-slate-400">
                  / 5
                </span>
              </p>

              <p className="text-xs text-slate-500">
                {analytics.workers.total_reviews}{" "}
                reviews
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Workers hired
              </span>

              <span className="font-semibold text-slate-900">
                {
                  analytics.workers
                    .total_hired
                }
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Active workers
              </span>

              <span className="font-semibold text-slate-900">
                {analytics.workers.active}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Completed assignments
              </span>

              <span className="font-semibold text-slate-900">
                {
                  analytics.workers
                    .completed
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          RECENT ACTIVITY
      ========================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your latest hiring activity
          </p>
        </div>

        {analytics.recent_activity.length ===
        0 ? (
          <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No recent activity yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-slate-100">
            {analytics.recent_activity.map(
              (activity, index) => (
                <div
                  key={`${activity.timestamp}-${index}`}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />

                    <div>
                      <p className="text-sm text-slate-700">
                        {getActivityText(
                          activity
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(
                          activity.timestamp
                        )}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${getActivityStatusClass(
                      activity.status
                    )}`}
                  >
                    {activity.status}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;