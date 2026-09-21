import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { getCurrentUser } from "@/shared/auth";

import {
  getClientAnalytics,
  type ClientAnalytics,
} from "@/api/analytics/client";

const ClientDashboard = () => {
  const navigate = useNavigate();

  const user = getCurrentUser();

  const firstName = user?.first_name || "there";

  const [analytics, setAnalytics] =
    useState<ClientAnalytics | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response =
          await getClientAnalytics();

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

  const activeJobs =
    (analytics?.jobs?.assigned ?? 0) +
    (analytics?.jobs?.in_progress ?? 0);

  const recentJobs =
    analytics?.recent_activity
      ?.filter(
        (activity) =>
          activity.type === "job_posted"
      )
      .slice(0, 4) ?? [];

  const completionRate =
    Number(
      analytics?.summary?.completion_rate ?? 0
    );

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "COMPLETED":
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";

      case "IN_PROGRESS":
        return "border border-blue-200 bg-blue-50 text-blue-700";

      case "ASSIGNED":
        return "border border-amber-200 bg-amber-50 text-amber-700";

      case "CANCELLED":
        return "border border-red-200 bg-red-50 text-red-700";

      default:
        return "border border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* HERO SKELETON */}
          <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />

          {/* STATS SKELETON */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          {/* PERFORMANCE SKELETON */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          {/* RECENT JOBS SKELETON */}
          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* PAGE INTRO */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Client Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your jobs, keep track of workers,
            and stay on top of your projects.
          </p>
        </div>

        {/* ERROR NOTICE */}
        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
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
          </div>
        )}

        {/* HERO */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          {/* SOFT LIGHTING */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                    <BriefcaseIcon className="h-5 w-5 text-emerald-300" />
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Welcome back
                  </p>
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                  Hi, {firstName}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  {analytics && activeJobs > 0
                    ? `You currently have ${activeJobs} active ${
                        activeJobs === 1
                          ? "job"
                          : "jobs"
                      }.`
                    : "You currently have no active jobs."}{" "}
                  Keep your projects moving or post a
                  new job when you need help.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/client/dashboard/post-job"
                    )
                  }
                  className="
                    mt-6 inline-flex items-center gap-2
                    rounded-xl bg-emerald-500
                    px-5 py-3 text-sm font-semibold
                    text-white shadow-sm
                    transition hover:bg-emerald-600
                    focus:outline-none
                    focus:ring-2 focus:ring-emerald-400
                    focus:ring-offset-2
                    focus:ring-offset-slate-900
                  "
                >
                  <PlusIcon className="h-5 w-5" />

                  Post a new job

                  <span className="ml-1 text-base">
                    
                  </span>
                </button>
              </div>

              {/* HERO SUMMARY */}
              <div className="grid grid-cols-2 gap-3 sm:min-w-[330px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">
                    {analytics?.jobs?.total ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Jobs posted
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-emerald-300">
                    {completionRate.toFixed(1)}%
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Completion rate
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-amber-300">
                    {analytics?.applications
                      ?.pending ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Pending applications
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">
                    {analytics?.workers
                      ?.total_hired ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Workers hired
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
              Your activity
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* ACTIVE JOBS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Current
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Active jobs
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {activeJobs}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Currently running
              </p>
            </div>

            {/* COMPLETED */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Finished
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Completed
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {analytics?.jobs?.completed ?? 0}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Jobs finished
              </p>
            </div>

            {/* PENDING APPLICATIONS */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Attention
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Pending apps
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {analytics?.applications
                  ?.pending ?? 0}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Awaiting review
              </p>
            </div>

            {/* WORKERS HIRED */}
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
                {analytics?.workers
                  ?.total_hired ?? 0}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total hired
              </p>
            </div>
          </div>
        </section>

        {/* PERFORMANCE */}
        {analytics && (
          <section className="mb-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Performance
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Project overview
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* JOBS POSTED */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Jobs posted
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {analytics.jobs?.total ?? 0}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <BriefcaseIcon className="h-5 w-5 text-slate-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Total jobs created
                </p>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-slate-400" />
                </div>
              </div>

              {/* APPLICATIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Applications
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {analytics.applications
                        ?.total ?? 0}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Across all your jobs
                </p>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${
                        (analytics.applications
                          ?.total ?? 0) > 0
                          ? Math.min(
                              ((analytics
                                .applications
                                ?.pending ?? 0) /
                                (analytics
                                  .applications
                                  ?.total ?? 1)) *
                                100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {analytics.applications
                    ?.pending ?? 0}{" "}
                  pending
                </p>
              </div>

              {/* COMPLETION RATE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Completion rate
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {completionRate.toFixed(1)}%
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <CheckCircleIcon className="h-5 w-5 text-amber-600" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Of all posted jobs
                </p>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
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
            </div>
          </section>
        )}

        {/* RECENT JOBS */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Recent jobs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your recently posted jobs.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/client/dashboard/jobs"
                )
              }
              className="
                inline-flex w-fit items-center gap-1
                rounded-xl px-3 py-2
                text-sm font-semibold text-emerald-600
                transition hover:bg-emerald-50
                hover:text-emerald-700
                focus:outline-none
                focus:ring-2 focus:ring-emerald-200
              "
            >
              View all

              <span className="text-base">
                
              </span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* EMPTY STATE */}
            {!errorMessage &&
              recentJobs.length === 0 && (
                <div className="flex min-h-80 items-center justify-center px-8 py-12">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <BriefcaseIcon className="h-7 w-7 text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      No jobs posted yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Create your first job to start
                      finding the right workers for
                      your projects.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/client/dashboard/post-job"
                        )
                      }
                      className="
                        mt-6 inline-flex items-center
                        gap-2 rounded-xl
                        bg-emerald-500 px-5 py-2.5
                        text-sm font-semibold text-white
                        shadow-sm transition
                        hover:bg-emerald-600
                        focus:outline-none
                        focus:ring-2
                        focus:ring-emerald-400
                        focus:ring-offset-2
                      "
                    >
                      <PlusIcon className="h-5 w-5" />

                      Post your first job
                    </button>
                  </div>
                </div>
              )}

            {/* JOB LIST */}
            {!errorMessage &&
              recentJobs.length > 0 && (
                <div className="grid sm:grid-cols-2">
                  {recentJobs.map(
                    (activity, index) => (
                      <div
                        key={`${activity.timestamp}-${index}`}
                        className="
                          border-b border-slate-100
                          p-5 transition
                          hover:bg-slate-50/70
                          sm:p-6
                          sm:[&:nth-child(odd)]:border-r
                          sm:[&:nth-child(n+3)]:border-b-0
                        "
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                                  {activity.title}
                                </h3>

                                <p className="mt-2 text-xs text-slate-500">
                                  Posted{" "}
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

                              <span
                                className={`
                                  inline-flex shrink-0
                                  rounded-full px-2.5 py-1
                                  text-[11px] font-semibold
                                  ${getStatusClass(
                                    activity.status
                                  )}
                                `}
                              >
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/client/dashboard/jobs"
                            )
                          }
                          className="
                            mt-5 inline-flex items-center
                            rounded-lg px-2 py-1
                            text-xs font-semibold
                            text-emerald-600
                            transition
                            hover:bg-emerald-50
                            hover:text-emerald-700
                          "
                        >
                          View details
                          <span className="ml-1">
                            
                          </span>
                        </button>
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

export default ClientDashboard;
