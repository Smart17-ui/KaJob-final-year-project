import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "@/shared/auth";

import {
  getWorkerAnalytics,
  type WorkerAnalytics,
} from "@/api/analytics/worker";

/* =========================
   COMPONENT
========================= */

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

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */

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

    loadDashboardData();
  }, []);

  /* =========================
     HELPERS
  ========================= */

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

  /* =========================
     DERIVED STATISTICS
  ========================= */

  const applicationsCount =
    analytics?.overview.total_applications ?? 0;

  const activeJobsCount =
    analytics?.jobs.active ?? 0;

  const completedJobsCount =
    analytics?.jobs.completed ?? 0;

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-8">
      {/* =========================
          WELCOME
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}!
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Find jobs, manage your applications,
          and keep track of your work.
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
          MAIN STATISTICS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        {/* APPLICATIONS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Applications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {isLoading
              ? "..."
              : applicationsCount}
          </p>
        </div>

        {/* ACTIVE JOBS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Active Jobs
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {isLoading
              ? "..."
              : activeJobsCount}
          </p>
        </div>

        {/* COMPLETED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {isLoading
              ? "..."
              : completedJobsCount}
          </p>
        </div>
      </div>

      {/* =========================
          PERFORMANCE SUMMARY
      ========================= */}

      {analytics && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick look at your activity on
              KaJob.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* ACCEPTANCE RATE */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Acceptance Rate
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatPercentage(
                  analytics.overview
                    .acceptance_rate
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Based on your applications
              </p>
            </div>

            {/* RATING */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Average Rating
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {Number(
                  analytics.performance
                    .average_rating || 0
                ).toFixed(1)}

                <span className="ml-1 text-sm font-medium text-slate-400">
                  / 5
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {analytics.performance.total_reviews}{" "}
                reviews
              </p>
            </div>

            {/* EARNINGS */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Total Earnings
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(
                  analytics.earnings.total
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                From completed work
              </p>
            </div>

            {/* COMPLETION RATE */}

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Completion Rate
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatPercentage(
                  analytics.performance
                    .completion_rate
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Jobs completed successfully
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================
          RECENT WORK
      ========================= */}

      {analytics &&
        analytics.recent_jobs &&
        analytics.recent_jobs.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Work
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your most recent assigned jobs.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/worker/dashboard/my-work"
                  )
                }
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View My Work
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {analytics.recent_jobs
                .slice(0, 3)
                .map((job) => (
                  <div
                    key={job.job_id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {job.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {job.client_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Assigned{" "}
                        {formatDate(
                          job.assigned_at
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(
                          job.budget
                        )}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          job.status
                        )}`}
                      >
                        {job.status_display ||
                          job.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* =========================
          FIND JOBS CTA
      ========================= */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/worker/dashboard/find-jobs"
          )
        }
        className="block w-full rounded-2xl bg-emerald-600 p-6 text-left text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <h2 className="text-xl font-semibold">
          Find your next job
        </h2>

        <p className="mt-2 max-w-xl text-sm text-emerald-50">
          Browse available jobs near you,
          submit applications, and start
          earning through KaJob.
        </p>

        <span className="mt-4 inline-block text-sm font-semibold text-white">
          Browse available jobs
        </span>
      </button>
    </div>
  );
};

export default WorkerDashboard;