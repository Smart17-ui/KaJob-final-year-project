import {
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PlayIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMyJobs,
  markJobComplete,
  startJob,
} from "@/api/jobs";

import type {
  Job,
  JobStatus,
} from "@/shared/types/job";

/* =========================================================
   WORK STATUS
========================================================= */

type WorkStatus =
  | "Assigned"
  | "In Progress"
  | "Awaiting Confirmation"
  | "Completed"
  | "Cancelled";

/* =========================================================
   FILTER
========================================================= */

type Filter =
  | "All"
  | WorkStatus;

/* =========================================================
   WORK TYPE
========================================================= */

type Work = {
  id: number;
  job: Job;
  status: WorkStatus;
};

/* =========================================================
   MAP BACKEND STATUS
========================================================= */

const getWorkStatus = (
  status: JobStatus | string
): WorkStatus => {
  const normalizedStatus =
    status.toUpperCase().trim();

  switch (normalizedStatus) {
    case "ASSIGNED":
      return "Assigned";

    case "IN_PROGRESS":
      return "In Progress";

    case "AWAITING_CONFIRMATION":
      return "Awaiting Confirmation";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return "Assigned";
  }
};

/* =========================================================
   WORK STATUSES
========================================================= */

const WORK_JOB_STATUSES: JobStatus[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "AWAITING_CONFIRMATION",
  "COMPLETED",
  "CANCELLED",
];

/* =========================================================
   FORMAT BUDGET
========================================================= */

const formatBudget = (
  budget: number | string
): string => {
  const numericBudget = Number(budget);

  if (Number.isNaN(numericBudget)) {
    return `K${budget}`;
  }

  return `K${numericBudget.toLocaleString(
    "en-ZM",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (
  date?: string | null
): string => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};

/* =========================================================
   FORMAT TIME
========================================================= */

const formatTime = (
  time?: string | null
): string => {
  if (!time) {
    return "Not specified";
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-GB",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

/* =========================================================
   FORMAT DURATION
========================================================= */

const formatDuration = (
  duration?: number | string | null
): string => {
  if (
    duration === null ||
    duration === undefined ||
    duration === ""
  ) {
    return "Not specified";
  }

  const value = Number(duration);

  if (Number.isNaN(value)) {
    return String(duration);
  }

  return `${value} hour${
    value === 1 ? "" : "s"
  }`;
};

/* =========================================================
   MAP JOB TO WORK
========================================================= */

const mapJobToWork = (
  job: Job
): Work => {
  return {
    id: job.id,
    job,
    status: getWorkStatus(
      job.status
    ),
  };
};

/* =========================================================
   MY WORK
========================================================= */

const MyWork = () => {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState<Filter>("All");

  const [works, setWorks] =
    useState<Work[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState<
      "start" | "complete" | null
    >(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [actionSuccess, setActionSuccess] =
    useState<string | null>(null);

  /* =======================================================
     LOAD MY WORK
  ======================================================= */

  const loadMyWork = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getMyJobs();

      const jobs =
        response?.results ?? [];

      const workerJobs =
        jobs.filter((job) =>
          WORK_JOB_STATUSES.includes(
            job.status
          )
        );

      setWorks(
        workerJobs.map(
          mapJobToWork
        )
      );
    } catch (err) {
      console.error(
        "Failed to load my work:",
        err
      );

      setError(
        "We couldn't load your work. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyJobs();

        if (!mounted) {
          return;
        }

        const jobs =
          response?.results ?? [];

        const workerJobs =
          jobs.filter((job) =>
            WORK_JOB_STATUSES.includes(
              job.status
            )
          );

        setWorks(
          workerJobs.map(
            mapJobToWork
          )
        );
      } catch (err) {
        console.error(
          "Failed to load my work:",
          err
        );

        if (mounted) {
          setError(
            "We couldn't load your work. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     GET DIRECTIONS
  ======================================================= */

  const handleGetDirections = (
    jobId: number
  ) => {
    navigate(
      `/worker/dashboard/directions/${jobId}`
    );
  };

  /* =======================================================
     START WORK
  ======================================================= */

  const handleStartWork = async (
    jobId: number
  ) => {
    try {
      setActionLoading("start");
      setActionError(null);
      setActionSuccess(null);

      const response =
        await startJob(jobId);

      if (response?.job) {
        const updatedWork =
          mapJobToWork(
            response.job
          );

        setWorks(
          (currentWorks) =>
            currentWorks.map(
              (work) =>
                work.id === jobId
                  ? updatedWork
                  : work
            )
        );
      }

      setActionSuccess(
        "Work has started. The job is now in progress."
      );
    } catch (err) {
      console.error(
        "Failed to start work:",
        err
      );

      setActionError(
        "We couldn't start this work. Please make sure you are ready to begin and try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =======================================================
     MARK WORK COMPLETE
  ======================================================= */

  const handleMarkComplete = async (
    jobId: number
  ) => {
    try {
      setActionLoading(
        "complete"
      );

      setActionError(null);
      setActionSuccess(null);

      const response =
        await markJobComplete(
          jobId
        );

      if (response?.job) {
        const updatedWork =
          mapJobToWork(
            response.job
          );

        setWorks(
          (currentWorks) =>
            currentWorks.map(
              (work) =>
                work.id === jobId
                  ? updatedWork
                  : work
            )
        );
      }

      setActionSuccess(
        "Work marked as complete. The client now needs to confirm the completion."
      );
    } catch (err) {
      console.error(
        "Failed to mark work complete:",
        err
      );

      setActionError(
        "We couldn't mark this work as complete. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =======================================================
     FILTER WORK
  ======================================================= */

  const filteredWorks =
    useMemo(() => {
      if (filter === "All") {
        return works;
      }

      return works.filter(
        (work) =>
          work.status === filter
      );
    }, [
      filter,
      works,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      All: works.length,

      Assigned:
        works.filter(
          (work) =>
            work.status ===
            "Assigned"
        ).length,

      "In Progress":
        works.filter(
          (work) =>
            work.status ===
            "In Progress"
        ).length,

      "Awaiting Confirmation":
        works.filter(
          (work) =>
            work.status ===
            "Awaiting Confirmation"
        ).length,

      Completed:
        works.filter(
          (work) =>
            work.status ===
            "Completed"
        ).length,

      Cancelled:
        works.filter(
          (work) =>
            work.status ===
            "Cancelled"
        ).length,
    }),
    [works]
  );

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      className="
        flex
        h-[calc(100vh-136px)]
        min-h-0
        min-w-0
        flex-col
        sm:h-[calc(100vh-144px)]
        lg:h-[calc(100vh-152px)]
      "
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="shrink-0 pb-6">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              My Work
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your assigned work and track each job through completion.
            </p>

          </div>

        </div>

      </div>

      {/* ===================================================
          ACTION FEEDBACK
      =================================================== */}

      {(actionSuccess ||
        actionError) && (
        <section className="mb-4 shrink-0">

          {actionSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">

              <div className="flex items-center gap-3">

                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />

                <p className="text-sm font-medium text-emerald-700">
                  {actionSuccess}
                </p>

              </div>

            </div>
          )}

          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3">

              <div className="flex items-center gap-3">

                <XCircleIcon className="h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm font-medium text-red-700">
                  {actionError}
                </p>

              </div>

            </div>
          )}

        </section>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <section className="mb-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-5 py-3">

          <div className="flex items-center justify-between gap-4">

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadMyWork
              }
              className="
                shrink-0
                rounded-lg
                bg-red-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
              "
            >
              Try again
            </button>

          </div>

        </section>
      )}

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      {loading ? (

        <section className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />

          <p className="mt-4 text-sm font-semibold text-gray-700">
            Loading your work...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch your work.
          </p>

        </section>

      ) : works.length === 0 ? (

        <section className="min-h-0 flex-1 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

            <BriefcaseIcon className="h-6 w-6 text-gray-400" />

          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No work yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Jobs you are assigned to will appear here.
            Once a client accepts your application,
            you can manage the work from this page.
          </p>

        </section>

      ) : (

        <div className="flex min-h-0 min-w-0 flex-1 gap-6">

          {/* =================================================
              STATUS SIDEBAR
          ================================================= */}

          <aside className="-mt-4 w-60 shrink-0">

            <WorkStatusSidebar
              filter={filter}
              setFilter={setFilter}
              counts={counts}
            />

          </aside>

          {/* =================================================
              WORK LIST
          ================================================= */}

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

            <div className="mb-4">

              <h2 className="text-lg font-semibold text-gray-900">
                {filter === "All"
                  ? "All Work"
                  : filter}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredWorks.length}{" "}
                {filteredWorks.length === 1
                  ? "job"
                  : "jobs"}
              </p>

            </div>

            {filteredWorks.length === 0 ? (

              <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">

                <BriefcaseIcon className="mx-auto h-10 w-10 text-gray-300" />

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No work found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  There are no jobs matching the selected status.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setFilter("All")
                  }
                  className="mt-5 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Show all work
                </button>

              </section>

            ) : (

              <div className="space-y-3 pb-6">

                {filteredWorks.map(
                  (work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      onGetDirections={() =>
                        handleGetDirections(
                          work.id
                        )
                      }
                      onStartWork={() =>
                        handleStartWork(
                          work.id
                        )
                      }
                      onMarkComplete={() =>
                        handleMarkComplete(
                          work.id
                        )
                      }
                      actionLoading={
                        actionLoading
                      }
                    />
                  )
                )}

              </div>

            )}

          </main>

        </div>

      )}

    </div>
  );
};

/* =========================================================
   WORK STATUS SIDEBAR
========================================================= */

type WorkStatusSidebarProps = {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  counts: Record<Filter, number>;
};

const WorkStatusSidebar = ({
  filter,
  setFilter,
  counts,
}: WorkStatusSidebarProps) => {

  const items: {
    value: Filter;
    label: string;
    icon: typeof BriefcaseIcon;
  }[] = [

    {
      value: "All",
      label: "All Work",
      icon: BriefcaseIcon,
    },

    {
      value: "Assigned",
      label: "Assigned",
      icon: PlayIcon,
    },

    {
      value: "In Progress",
      label: "In Progress",
      icon: ClockIcon,
    },

    {
      value: "Awaiting Confirmation",
      label: "Awaiting Confirmation",
      icon: ClockIcon,
    },

    {
      value: "Completed",
      label: "Completed",
      icon: CheckCircleIcon,
    },

    {
      value: "Cancelled",
      label: "Cancelled",
      icon: XCircleIcon,
    },

  ];

  return (
    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">

      <div className="px-3 pb-3 pt-2">

        <h2 className="text-sm font-semibold text-gray-900">
          My Work
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Filter by work status
        </p>

      </div>

      <nav className="space-y-1">

        {items.map(
          (item) => {

            const Icon =
              item.icon;

            const isActive =
              filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFilter(
                    item.value
                  )
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >

                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                />

                <span className="flex-1">
                  {item.label}
                </span>

                <span
                  className={`min-w-[28px] rounded-full px-2 py-0.5 text-center text-xs font-semibold ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {counts[
                    item.value
                  ]}
                </span>

              </button>
            );
          }
        )}

      </nav>

    </aside>
  );
};

/* =========================================================
   WORK CARD
========================================================= */

type WorkCardProps = {
  work: Work;
  onGetDirections: () => void;
  onStartWork: () => void;
  onMarkComplete: () => void;
  actionLoading:
    | "start"
    | "complete"
    | null;
};

const WorkCard = ({
  work,
  onGetDirections,
  onStartWork,
  onMarkComplete,
  actionLoading,
}: WorkCardProps) => {

  const job =
    work.job;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      {/* =====================================================
          CARD HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">

            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />

          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-base font-semibold text-gray-900">
                {job.title}
              </h3>

              <WorkStatus
                status={
                  work.status
                }
              />

            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">

              <span>
                {job.category_name ||
                  "General Work"}
              </span>

              {job.posted_at && (
                <>
                  <span className="text-gray-300">
                    •
                  </span>

                  <span>
                    Posted{" "}
                    {formatDate(
                      job.posted_at
                    )}
                  </span>
                </>
              )}

            </div>

          </div>

        </div>

        <div className="shrink-0 sm:text-right">

          <p className="text-lg font-bold text-emerald-600">
            {formatBudget(
              job.budget
            )}
          </p>

          <p className="text-xs text-gray-400">
            Agreed Amount
          </p>

        </div>

      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
        {job.description ||
          "No description provided."}
      </p>

      {/* =====================================================
          JOB INFORMATION
      ===================================================== */}

      <div className="mt-4 grid gap-3 text-sm text-gray-500 sm:grid-cols-2">

        <div className="flex items-center gap-2">

          <BriefcaseIcon className="h-4 w-4 shrink-0" />

          <span>
            Client:{" "}
            <span className="font-medium text-gray-700">
              {job.client_name ||
                "Client"}
            </span>
          </span>

        </div>

        <div className="flex items-center gap-2 min-w-0">

          <MapPinIcon className="h-4 w-4 shrink-0" />

          <span className="truncate">
            {job.general_location ||
              "Location not specified"}
          </span>

        </div>

        <div className="flex items-center gap-2">

          <CalendarDaysIcon className="h-4 w-4 shrink-0" />

          <span>
            Date:{" "}
            {formatDate(
              job.job_date
            )}
          </span>

        </div>

        <div className="flex items-center gap-2">

          <ClockIcon className="h-4 w-4 shrink-0" />

          <span>
            Duration:{" "}
            {formatDuration(
              job.duration_hours
            )}
          </span>

        </div>

      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        <WorkStatus
          status={
            work.status
          }
        />

        <div className="flex flex-col gap-2 sm:flex-row">

          {/* =================================================
              ASSIGNED
          ================================================= */}

          {work.status ===
            "Assigned" && (
            <>

              <button
                type="button"
                onClick={
                  onGetDirections
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >

                <MapPinIcon className="h-4 w-4" />

                Get Directions

              </button>

              <button
                type="button"
                disabled={
                  actionLoading !== null
                }
                onClick={
                  onStartWork
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <PlayIcon className="h-4 w-4" />

                {actionLoading ===
                "start"
                  ? "Starting..."
                  : "Start Work"}

              </button>

            </>
          )}

          {/* =================================================
              IN PROGRESS
          ================================================= */}

          {work.status ===
            "In Progress" && (

            <button
              type="button"
              disabled={
                actionLoading !== null
              }
              onClick={
                onMarkComplete
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <CheckCircleIcon className="h-4 w-4" />

              {actionLoading ===
              "complete"
                ? "Submitting..."
                : "Mark Complete"}

            </button>

          )}

        </div>

      </div>

    </article>
  );
};

/* =========================================================
   WORK STATUS
========================================================= */

type WorkStatusProps = {
  status: WorkStatus;
};

const WorkStatus = ({
  status,
}: WorkStatusProps) => {

  if (status === "Assigned") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

        <span className="h-2 w-2 rounded-full bg-blue-500" />

        Assigned

      </span>
    );
  }

  if (status === "In Progress") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

        <ClockIcon className="h-4 w-4" />

        In Progress

      </span>
    );
  }

  if (
    status ===
    "Awaiting Confirmation"
  ) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">

        <ClockIcon className="h-4 w-4" />

        Awaiting Confirmation

      </span>
    );
  }

  if (status === "Cancelled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">

        <XCircleIcon className="h-4 w-4" />

        Cancelled

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

      <CheckCircleIcon className="h-4 w-4" />

      Completed

    </span>
  );
};

export default MyWork;