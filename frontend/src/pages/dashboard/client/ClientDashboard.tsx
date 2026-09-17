import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import StatCard from "@/components/dashboard/StatCard/StatCard";

import { getCurrentUser } from "@/shared/auth";

import {
  getClientAnalytics,
  type ClientAnalytics,
} from "@/api/analytics/client";

const ClientDashboard = () => {
  const navigate = useNavigate();

  /* =========================
     GET CURRENT USER
  ========================= */

  const user = getCurrentUser();

  const firstName = user?.first_name || "there";

  /* =========================
     STATE
  ========================= */

  const [analytics, setAnalytics] =
    useState<ClientAnalytics | null>(null);

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
        const response =
          await getClientAnalytics();

        console.log(
          "CLIENT ANALYTICS RESPONSE:",
          response
        );

        setAnalytics(response);
      } catch (error) {
        console.error(
          "Failed to load client dashboard:",
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
     CALCULATE ACTIVE JOBS
  ========================= */

  const activeJobs =
    (analytics?.jobs?.assigned ?? 0) +
    (analytics?.jobs?.in_progress ?? 0);

  /* =========================
     RECENT JOBS
  ========================= */

  const recentJobs =
    analytics?.recent_activity
      ?.filter(
        (activity) =>
          activity.type === "job_posted"
      )
      .slice(0, 3) ?? [];

  /* =========================
     COMPLETION RATE
  ========================= */

  const completionRate =
    Number(
      analytics?.summary?.completion_rate ?? 0
    );

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-8">
      {/* =========================
          WELCOME SECTION
      ========================= */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your
            jobs today.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/client/dashboard/post-job"
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <PlusIcon className="h-5 w-5" />

          Post a Job
        </button>
      </section>

      {/* =========================
          ERROR
      ========================= */}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Jobs"
          value={
            isLoading
              ? "..."
              : activeJobs
          }
          description="Currently active"
          icon={BriefcaseIcon}
          iconBackground="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Completed Jobs"
          value={
            isLoading
              ? "..."
              : analytics?.jobs?.completed ?? 0
          }
          description="Jobs completed"
          icon={CheckCircleIcon}
          iconBackground="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Pending Applications"
          value={
            isLoading
              ? "..."
              : analytics?.applications?.pending ?? 0
          }
          description="Waiting for review"
          icon={ClockIcon}
          iconBackground="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Workers Hired"
          value={
            isLoading
              ? "..."
              : analytics?.workers?.total_hired ?? 0
          }
          description="Total workers hired"
          icon={UsersIcon}
          iconBackground="bg-purple-50"
          iconColor="text-purple-600"
        />
      </section>

      {/* =========================
          QUICK SUMMARY
      ========================= */}

      {analytics && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Jobs Posted
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {analytics.jobs?.total ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total jobs created
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Applications Received
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {analytics.applications?.total ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Across all your jobs
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Completion Rate
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {completionRate.toFixed(1)}%
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Based on your posted jobs
            </p>
          </div>
        </section>
      )}

      {/* =========================
          RECENT JOBS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">
        {/* =========================
            HEADER
        ========================= */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Jobs
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your recently posted jobs
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/client/dashboard/jobs"
              )
            }
            className="text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            View all
          </button>
        </div>

        {/* =========================
            LOADING
        ========================= */}

        {isLoading && (
          <div className="flex min-h-64 items-center justify-center px-6 py-10">
            <p className="text-sm text-slate-500">
              Loading your jobs...
            </p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!isLoading &&
          errorMessage && (
            <div className="flex min-h-64 items-center justify-center px-6 py-10">
              <p className="text-sm text-slate-500">
                Unable to load recent jobs.
              </p>
            </div>
          )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!isLoading &&
          !errorMessage &&
          recentJobs.length === 0 && (
            <div className="flex min-h-64 items-center justify-center px-6 py-10">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <BriefcaseIcon className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  No jobs yet
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  You haven't posted any
                  jobs yet. Create your first
                  job and start finding the
                  right worker.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/client/dashboard/post-job"
                    )
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <PlusIcon className="h-4 w-4" />

                  Post your first job
                </button>
              </div>
            </div>
          )}

        {/* =========================
            RECENT JOB LIST
        ========================= */}

        {!isLoading &&
          !errorMessage &&
          recentJobs.length > 0 && (
            <div className="divide-y divide-slate-100">
              {recentJobs.map(
                (activity, index) => (
                  <div
                    key={`${activity.timestamp}-${index}`}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {activity.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Posted on{" "}
                          {new Date(
                            activity.timestamp
                          ).toLocaleDateString(
                            "en-ZM",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          activity.status ===
                          "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : activity.status ===
                              "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : activity.status ===
                              "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : activity.status ===
                              "ASSIGNED"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </section>
    </div>
  );
};

export default ClientDashboard;