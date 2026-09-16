import { useEffect, useState } from "react";

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

    loadPerformanceData();
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

    if (selectedPeriod === "month") {
      return;
    }

    loadEarningsTrend();
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
        return "bg-emerald-100 text-emerald-700";

      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";

      case "ASSIGNED":
        return "bg-indigo-100 text-indigo-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
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
      (total, value) => total + value,
      0
    );

  const getRatingPercentage = (
    rating: number
  ) => {
    if (totalRatings === 0) {
      return 0;
    }

    return (
      (ratingDistribution[
        rating as keyof typeof ratingDistribution
      ] /
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Performance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your work, ratings, applications,
            and earnings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Performance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your work, ratings, applications,
          and earnings.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {analytics && (
        <>
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Overview
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Applications
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    analytics.overview
                      .total_applications
                  }
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Accepted Applications
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    analytics.overview
                      .accepted_applications
                  }
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Acceptance Rate
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {formatPercentage(
                    analytics.overview
                      .acceptance_rate
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Average Rating
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {Number(
                    analytics.performance
                      .average_rating || 0
                  ).toFixed(1)}

                  <span className="ml-1 text-lg font-medium text-slate-400">
                    / 5
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Jobs
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Total Jobs
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.jobs.total}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Active Jobs
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.jobs.active}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.jobs.in_progress}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.jobs.completed}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Earnings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your earnings from completed work.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Total Earnings
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      analytics.earnings.total
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Average per Job
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      analytics.earnings
                        .average_per_job
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Highest Paying
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatCurrency(
                      analytics.earnings
                        .highest_paying
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Lowest Paying
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatCurrency(
                      analytics.earnings
                        .lowest_paying
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Performance
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Average Rating
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {Number(
                      analytics.performance
                        .average_rating || 0
                    ).toFixed(1)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Reviews
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {
                      analytics.performance
                        .total_reviews
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Completion Rate
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatPercentage(
                      analytics.performance
                        .completion_rate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Positive Reviews
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {
                      analytics.performance
                        .positive_reviews
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Rating Distribution
              </h2>

              <div className="mt-6 space-y-4">
                {[5, 4, 3, 2, 1].map(
                  (rating) => {
                    const count =
                      ratingDistribution[
                        rating as keyof typeof ratingDistribution
                      ];

                    const percentage =
                      getRatingPercentage(
                        rating
                      );

                    return (
                      <div
                        key={rating}
                        className="flex items-center gap-3"
                      >
                        <span className="w-12 text-sm font-medium text-slate-600">
                          {rating} / 5
                        </span>

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-8 text-right text-sm text-slate-500">
                          {count}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Earnings Trend
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Earnings over the selected
                    period.
                  </p>
                </div>

                <select
                  value={selectedPeriod}
                  onChange={(event) =>
                    setSelectedPeriod(
                      event.target
                        .value as
                        | "week"
                        | "month"
                        | "quarter"
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                <div className="mt-6 h-48 animate-pulse rounded-lg bg-slate-100" />
              ) : earningsTrend?.data &&
                earningsTrend.data.length > 0 ? (
                <div className="mt-6 space-y-3">
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
                          <span className="w-20 text-xs text-slate-500">
                            {formatDate(
                              item.date
                            )}
                          </span>

                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>

                          <span className="w-24 text-right text-sm font-medium text-slate-700">
                            {formatCurrency(
                              earnings
                            )}
                          </span>
                        </div>
                      );
                    }
                  )}

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500">
                      Period total
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatCurrency(
                        earningsTrend.total_earnings
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">
                    No earnings recorded for this
                    period.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Work
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your most recent assigned jobs.
              </p>
            </div>

            {jobHistory.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Job
                      </th>

                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Client
                      </th>

                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Budget
                      </th>

                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Rating
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {jobHistory
                      .slice(0, 5)
                      .map((job) => (
                        <tr
                          key={job.job_id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-4 pr-4">
                            <p className="font-medium text-slate-900">
                              {job.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                job.assigned_at
                              )}
                            </p>
                          </td>

                          <td className="py-4 pr-4 text-sm text-slate-600">
                            {job.client_name}
                          </td>

                          <td className="py-4 pr-4 text-sm font-medium text-slate-700">
                            {formatCurrency(
                              job.budget
                            )}
                          </td>

                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                job.status
                              )}`}
                            >
                              {job.status_display ||
                                job.status}
                            </span>
                          </td>

                          <td className="py-4 text-sm text-slate-600">
                            {job.rating !== null &&
                            job.rating !== undefined
                              ? `${Number(
                                  job.rating
                                ).toFixed(1)} / 5`
                              : "Not rated"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6 rounded-lg bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm text-slate-500">
                  You do not have any work history
                  yet.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Performance;