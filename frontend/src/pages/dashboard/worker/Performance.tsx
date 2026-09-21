import { useEffect, useState } from "react";

import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import {
  getWorkerAnalytics,
  getWorkerEarningsTrend,
  getWorkerJobHistory,
  type WorkerAnalytics,
  type WorkerEarningsTrendResponse,
  type WorkerJobHistoryItem,
} from "@/api/analytics/worker";

const Performance = () => {
  const [analytics, setAnalytics] =
    useState<WorkerAnalytics | null>(null);

  const [jobHistory, setJobHistory] =
    useState<WorkerJobHistoryItem[]>([]);

  const [earningsTrend, setEarningsTrend] =
    useState<WorkerEarningsTrendResponse | null>(
      null
    );

  const [selectedPeriod, setSelectedPeriod] =
    useState<"week" | "month" | "quarter">(
      "month"
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingTrend, setIsLoadingTrend] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadPerformanceData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [
          analyticsData,
          jobHistoryData,
          earningsTrendData,
        ] = await Promise.all([
          getWorkerAnalytics(),
          getWorkerJobHistory(),
          getWorkerEarningsTrend("month"),
        ]);

        setAnalytics(analyticsData);

        setJobHistory(
          jobHistoryData.results ?? []
        );

        setEarningsTrend(
          earningsTrendData
        );
      } catch (error) {
        console.error(
          "Failed to load worker performance:",
          error
        );

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Failed to load performance data."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadPerformanceData();
  }, []);

  useEffect(() => {
    const loadEarningsTrend = async () => {
      setIsLoadingTrend(true);

      try {
        const data =
          await getWorkerEarningsTrend(
            selectedPeriod
          );

        setEarningsTrend(data);
      } catch (error) {
        console.error(
          "Failed to load earnings trend:",
          error
        );
      } finally {
        setIsLoadingTrend(false);
      }
    };

    if (selectedPeriod !== "month") {
      void loadEarningsTrend();
    }
  }, [selectedPeriod]);

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

  const ratingDistribution =
    analytics?.rating_distribution ?? {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

  const totalRatings =
    Object.values(ratingDistribution).reduce(
      (total, value) =>
        total + Number(value || 0),
      0
    );

  const getRatingPercentage = (
    rating: number
  ) => {
    if (totalRatings === 0) {
      return 0;
    }

    return (
      (Number(
        ratingDistribution[
          rating as keyof typeof ratingDistribution
        ] || 0
      ) /
        totalRatings) *
      100
    );
  };

  const maxEarnings =
    earningsTrend?.data?.reduce(
      (maximum, item) =>
        Math.max(
          maximum,
          Number(item.earnings || 0)
        ),
      0
    ) ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-full bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded-full bg-slate-200" />
            <div className="mt-2 h-5 w-52 rounded bg-slate-200" />
          </div>

          {/* Hero skeleton */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="animate-pulse bg-slate-900 px-6 py-8 sm:px-8 sm:py-10">
              <div className="h-3 w-24 rounded-full bg-slate-700" />
              <div className="mt-5 h-12 w-56 rounded-lg bg-slate-700" />
              <div className="mt-4 h-4 w-72 rounded bg-slate-700" />
            </div>
          </div>

          {/* Metrics skeleton */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          {/* Two-column skeleton */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {/* PAGE HEADER */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Performance
          </p>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Your performance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your earnings, ratings and work history.
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
                Unable to load your performance
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {analytics && (
          <>
            {/* EARNINGS HERO */}
            <section>
              <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)]">
                {/* Soft lighting */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

                <div className="relative px-6 py-8 sm:px-8 sm:py-10">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Your earnings
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                    <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                      {formatCurrency(
                        analytics.earnings.total
                      )}
                    </h2>

                    <p className="text-sm text-slate-400 sm:mb-2 sm:text-base">
                      total earned
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-300">
                    <span>
                      {analytics.jobs.completed}{" "}
                      {analytics.jobs.completed === 1
                        ? "job"
                        : "jobs"}{" "}
                      completed
                    </span>

                    <span className="hidden text-slate-600 sm:inline">
                      •
                    </span>

                    <span>
                      Average{" "}
                      {formatCurrency(
                        analytics.earnings
                          .average_per_job
                      )}{" "}
                      per job
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* KEY METRICS */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Key metrics
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  A quick view of your current performance.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* RATING */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Your rating
                      </p>

                      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        {Number(
                          analytics.performance
                            .average_rating || 0
                        ).toFixed(1)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {analytics.performance.total_reviews}{" "}
                        {analytics.performance.total_reviews === 1
                          ? "review"
                          : "reviews"}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <StarIcon className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>

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

                {/* ACCEPTANCE RATE */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Acceptance rate
                      </p>

                      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        {formatPercentage(
                          analytics.overview
                            .acceptance_rate
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          analytics.overview
                            .accepted_applications
                        }{" "}
                        of{" "}
                        {
                          analytics.overview
                            .total_applications
                        }{" "}
                        accepted
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>

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

                {/* COMPLETION RATE */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Completion rate
                      </p>

                      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        {formatPercentage(
                          analytics.performance
                            .completion_rate
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {analytics.jobs.completed}{" "}
                        {analytics.jobs.completed === 1
                          ? "job"
                          : "jobs"}{" "}
                        finished
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

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

            {/* RATING + EARNINGS */}
            <section className="mt-8 grid gap-4 lg:grid-cols-2">
              {/* RATING DISTRIBUTION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Rating distribution
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      How clients have rated your completed work.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <StarIcon className="h-5 w-5 text-amber-500" />
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {[5, 4, 3, 2, 1].map(
                    (rating) => {
                      const count =
                        Number(
                          ratingDistribution[
                            rating as keyof typeof ratingDistribution
                          ] || 0
                        );

                      const percentage =
                        getRatingPercentage(
                          rating
                        );

                      return (
                        <div
                          key={rating}
                          className="flex items-center gap-3"
                        >
                          <span className="w-10 shrink-0 text-xs font-semibold text-slate-600">
                            {rating} star
                          </span>

                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-500">
                            {count}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    {totalRatings === 0
                      ? "No ratings have been received yet."
                      : `${totalRatings} ${
                          totalRatings === 1
                            ? "rating"
                            : "ratings"
                        } received`}
                  </p>
                </div>
              </div>

              {/* EARNINGS TREND */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Earnings trend
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Track earnings across the selected period.
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
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-slate-700
                      shadow-sm
                      outline-none
                      transition
                      hover:border-slate-300
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  >
                    <option value="week">
                      This Week
                    </option>

                    <option value="month">
                      This Month
                    </option>

                    <option value="quarter">
                      This Quarter
                    </option>
                  </select>
                </div>

                {isLoadingTrend ? (
                  <div className="mt-7 space-y-4">
                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-5 animate-pulse rounded-full bg-slate-100"
                        />
                      )
                    )}
                  </div>
                ) : earningsTrend?.data &&
                  earningsTrend.data.length > 0 ? (
                  <div className="mt-7 space-y-4">
                    {earningsTrend.data.map(
                      (item) => {
                        const earnings =
                          Number(
                            item.earnings || 0
                          );

                        const width =
                          maxEarnings > 0
                            ? (earnings /
                                maxEarnings) *
                              100
                            : 0;

                        return (
                          <div
                            key={item.date}
                            className="flex items-center gap-3"
                          >
                            <span className="w-16 shrink-0 text-[11px] font-medium text-slate-500">
                              {formatDate(
                                item.date
                              )}
                            </span>

                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{
                                  width: `${width}%`,
                                }}
                              />
                            </div>

                            <span className="w-24 shrink-0 text-right text-xs font-bold text-slate-900">
                              {formatCurrency(
                                earnings
                              )}
                            </span>
                          </div>
                        );
                      }
                    )}

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Period total
                      </p>

                      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        {formatCurrency(
                          earningsTrend.total_earnings
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
                    </div>

                    <p className="mt-3 text-xs font-medium text-slate-500">
                      No earnings recorded for this period.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* JOB ACTIVITY */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Job activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Overview of your work across different statuses.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total jobs
                    </p>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                      <BriefcaseIcon className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                    {analytics.jobs.total}
                  </p>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Active
                    </p>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                      <BriefcaseIcon className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight text-amber-600">
                    {analytics.jobs.active}
                  </p>
                </div>

                {/* IN PROGRESS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      In progress
                    </p>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight text-blue-600">
                    {analytics.jobs.in_progress}
                  </p>
                </div>

                {/* COMPLETED */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Completed
                    </p>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight text-emerald-600">
                    {analytics.jobs.completed}
                  </p>
                </div>
              </div>
            </section>

            {/* RECENT WORK */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Recent work
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest job activity and client ratings.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {jobHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Job
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Client
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Budget
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Rating
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {jobHistory
                          .slice(0, 8)
                          .map((job) => (
                            <tr
                              key={job.job_id}
                              className="transition-colors hover:bg-slate-50/60"
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm font-semibold text-slate-900">
                                  {job.title}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-500">
                                  Assigned{" "}
                                  {formatDate(
                                    job.assigned_at
                                  )}
                                </p>
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-600">
                                {job.client_name}
                              </td>

                              <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                {formatCurrency(
                                  job.budget
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`
                                    inline-flex
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
                              </td>

                              <td className="px-6 py-4">
                                {job.rating !== null &&
                                job.rating !==
                                  undefined ? (
                                  <div className="flex items-center gap-1.5">
                                    <StarIcon className="h-4 w-4 text-amber-500" />

                                    <span className="text-sm font-semibold text-slate-700">
                                      {Number(
                                        job.rating
                                      ).toFixed(1)}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                      / 5
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    Not rated
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                      <BriefcaseIcon className="h-6 w-6 text-slate-400" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-800">
                      No work history yet
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                      Apply to available jobs and your completed
                      work will appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Performance;