import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  CalendarDaysIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import { getMyActiveJobs } from "@/api/jobs";
import DetailsModal from "@/components/pop/DetailsModal/DetailsModal";

/* =========================
   BACKEND JOB TYPE
========================= */

type BackendJob = {
  id: number;
  title: string;
  budget: number | string;
  client_name: string | null;
  category_name: string | null;
  general_location: string | null;
  status: string;
  status_display: string | null;
  posted_at: string;
  is_urgent: boolean;
  urgency_display: string | null;
  job_display_date: string | null;
  duration_hours: number | null;
  search_radius_km: number | null;
};

/* =========================
   API RESPONSE
========================= */

type MyActiveJobsResponse = {
  count: number;
  results: BackendJob[];
};

/* =========================
   WORK STATUS
========================= */

type WorkStatus =
  | "Active"
  | "Awaiting Confirmation"
  | "Completed"
  | "Cancelled";

/* =========================
   WORK TYPE
========================= */

type Work = {
  id: number;
  jobId: number;
  title: string;
  description: string;
  category: string;
  client: string;
  location: string;
  budget: string;
  status: WorkStatus;
  startDate: string;
  deadline: string;
  isUrgent: boolean;
  urgency: string;
};

/* =========================
   FILTER
========================= */

type Filter =
  | "All"
  | "Active"
  | "Awaiting Confirmation"
  | "Completed"
  | "Cancelled";

/* =========================
   MAP BACKEND STATUS
========================= */

const getWorkStatus = (status: string): WorkStatus => {
  const normalizedStatus = status.toUpperCase().trim();

  if (normalizedStatus === "COMPLETED") {
    return "Completed";
  }

  if (normalizedStatus === "CANCELLED") {
    return "Cancelled";
  }

  if (normalizedStatus === "AWAITING_CONFIRMATION") {
    return "Awaiting Confirmation";
  }

  /*
   * ASSIGNED is the normal active state.
   *
   * IN_PROGRESS is kept here as a fallback
   * because the backend model still supports it,
   * even though KaJob no longer has a separate
   * "Start Work" action.
   */
  if (
    normalizedStatus === "ASSIGNED" ||
    normalizedStatus === "IN_PROGRESS"
  ) {
    return "Active";
  }

  return "Active";
};

/* =========================
   FORMAT BUDGET
========================= */

const formatBudget = (budget: number | string): string => {
  const numericBudget = Number(budget);

  if (Number.isNaN(numericBudget)) {
    return `K${budget}`;
  }

  return `K${numericBudget.toLocaleString()}`;
};

/* =========================
   FORMAT DATE
========================= */

const formatDate = (date: string | null): string => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* =========================
   CONVERT API JOB
   TO WORK
========================= */

const mapJobToWork = (job: BackendJob): Work => {
  const status = getWorkStatus(job.status);

  return {
    id: job.id,
    jobId: job.id,
    title: job.title,

    description:
      "View the job details to see the full job description.",

    category: job.category_name || "General Work",

    client: job.client_name || "Client",

    location: job.general_location || "Location not specified",

    budget: formatBudget(job.budget),

    status,

    startDate:
      job.job_display_date || formatDate(job.posted_at),

    deadline: job.duration_hours
      ? `${job.duration_hours} hour${
          job.duration_hours === 1 ? "" : "s"
        }`
      : "Not specified",

    isUrgent: job.is_urgent,

    urgency: job.urgency_display || "",
  };
};

/* =========================
   MY WORK
========================= */

const MyWork = () => {
  const [filter, setFilter] = useState<Filter>("All");

  const [works, setWorks] = useState<Work[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* =========================
     VIEW JOB MODAL
  ========================= */

  const [selectedWork, setSelectedWork] =
    useState<Work | null>(null);

  /* =========================
     LOAD MY ACTIVE WORK
  ========================= */

  useEffect(() => {
    let isMounted = true;

    const loadMyWork = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          (await getMyActiveJobs()) as MyActiveJobsResponse;

        if (!isMounted) {
          return;
        }

        const mappedWorks =
          response.results.map(mapJobToWork);

        setWorks(mappedWorks);
      } catch (err) {
        console.error(
          "Failed to load my work:",
          err
        );

        if (!isMounted) {
          return;
        }

        setError(
          "We couldn't load your work. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMyWork();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================
     FILTER WORK
  ========================= */

  const filteredWorks = useMemo(() => {
    if (filter === "All") {
      return works;
    }

    return works.filter(
      (work) => work.status === filter
    );
  }, [filter, works]);

  /* =========================
     COUNTS
  ========================= */

  const activeCount = works.filter(
    (work) => work.status === "Active"
  ).length;

  const awaitingConfirmationCount =
    works.filter(
      (work) =>
        work.status === "Awaiting Confirmation"
    ).length;

  const completedCount = works.filter(
    (work) => work.status === "Completed"
  ).length;

  const cancelledCount = works.filter(
    (work) => work.status === "Cancelled"
  ).length;

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          My Work
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your assigned, completed,
          and cancelled work.
        </p>
      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

        {/* TOTAL */}

        <button
          type="button"
          onClick={() => setFilter("All")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "All"
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Total Jobs
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "—" : works.length}
          </p>
        </button>

        {/* ACTIVE */}

        <button
          type="button"
          onClick={() => setFilter("Active")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Active"
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Active
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "—" : activeCount}
          </p>
        </button>

        {/* AWAITING CONFIRMATION */}

        <button
          type="button"
          onClick={() =>
            setFilter("Awaiting Confirmation")
          }
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Awaiting Confirmation"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Awaiting Confirmation
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading
              ? "—"
              : awaitingConfirmationCount}
          </p>
        </button>

        {/* COMPLETED */}

        <button
          type="button"
          onClick={() =>
            setFilter("Completed")
          }
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Completed"
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "—" : completedCount}
          </p>
        </button>

        {/* CANCELLED */}

        <button
          type="button"
          onClick={() =>
            setFilter("Cancelled")
          }
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Cancelled"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Cancelled
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading ? "—" : cancelledCount}
          </p>
        </button>

      </div>

      {/* =========================
          FILTER TABS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex flex-wrap gap-1">

          {(
            [
              "All",
              "Active",
              "Awaiting Confirmation",
              "Completed",
              "Cancelled",
            ] as Filter[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === item
                  ? item === "Cancelled"
                    ? "bg-red-600 text-white"
                    : item ===
                        "Awaiting Confirmation"
                    ? "bg-amber-600 text-white"
                    : "bg-emerald-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}

        </div>
      </section>

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex min-h-64 items-center justify-center px-6 py-10">
            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading your work...
              </p>

            </div>
          </div>
        </section>
      ) : filteredWorks.length > 0 ? (

        /* =========================
           WORK LIST
        ========================= */

        <div className="space-y-4">

          {filteredWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              onViewJob={() =>
                setSelectedWork(work)
              }
            />
          ))}

        </div>

      ) : (

        /* =========================
           EMPTY STATE
        ========================= */

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex min-h-64 items-center justify-center px-6 py-10">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <BriefcaseIcon className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No work found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                You don't have any jobs matching
                this filter.
              </p>

              {filter !== "All" && (
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                  className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View all work
                </button>
              )}

            </div>
          </div>
        </section>
      )}

      {/* =========================
          JOB DETAILS POPUP
      ========================= */}

      {selectedWork && (
        <DetailsModal
          title="Job Details"
          onClose={() => setSelectedWork(null)}
          width="lg"
          footer={
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setSelectedWork(null)
                }
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-6">

            {/* JOB HEADER */}

            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedWork.title}
                  </h3>

                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedWork.category}
                  </span>
                </div>

                <WorkStatus
                  status={selectedWork.status}
                />

              </div>
            </div>

            {/* BUDGET */}

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Agreed Amount
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {selectedWork.budget}
              </p>
            </div>

            {/* DESCRIPTION */}

            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Description
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedWork.description}
              </p>
            </div>

            {/* DETAILS */}

            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Job Information
              </h4>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">

                {/* CLIENT */}

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="h-4 w-4 text-slate-500" />

                    <p className="text-xs text-slate-500">
                      Client
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedWork.client}
                  </p>
                </div>

                {/* LOCATION */}

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-slate-500" />

                    <p className="text-xs text-slate-500">
                      Location
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedWork.location}
                  </p>
                </div>

                {/* DATE */}

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-slate-500" />

                    <p className="text-xs text-slate-500">
                      Job Date
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedWork.startDate}
                  </p>
                </div>

                {/* DURATION */}

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-slate-500" />

                    <p className="text-xs text-slate-500">
                      Duration
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedWork.deadline}
                  </p>
                </div>

              </div>
            </div>

            {/* URGENCY */}

            {selectedWork.urgency && (
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Urgency
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedWork.urgency}
                </p>
              </div>
            )}

            {/* STATUS MESSAGE */}

            {selectedWork.status ===
              "Awaiting Confirmation" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">

                  <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-600" />

                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Awaiting Client Confirmation
                    </p>

                    <p className="mt-1 text-sm leading-5 text-amber-700">
                      You marked this job as complete.
                      The client still needs to confirm
                      that the work has been completed.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {selectedWork.status ===
              "Completed" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex gap-3">

                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Work Completed
                    </p>

                    <p className="mt-1 text-sm leading-5 text-emerald-700">
                      This job has been completed and
                      confirmed by the client.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {selectedWork.status ===
              "Cancelled" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">

                  <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Job Cancelled
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-700">
                      This job has been cancelled and
                      can no longer be completed.
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>
        </DetailsModal>
      )}

    </div>
  );
};

/* ==================================================
   WORK CARD
================================================== */

type WorkCardProps = {
  work: Work;
  onViewJob: () => void;
};

const WorkCard = ({
  work,
  onViewJob,
}: WorkCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">

      {/* =========================
          TOP
      ========================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* JOB INFORMATION */}

        <div className="flex gap-4">

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {work.title}
            </h3>

            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {work.category}
            </span>
          </div>

        </div>

        {/* BUDGET */}

        <div className="sm:text-right">

          <p className="text-lg font-bold text-emerald-600">
            {work.budget}
          </p>

          <p className="text-xs text-slate-400">
            Agreed Amount
          </p>

        </div>

      </div>

      {/* =========================
          DESCRIPTION
      ========================= */}

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {work.description}
      </p>

      {/* =========================
          DETAILS
      ========================= */}

      <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">

        {/* CLIENT */}

        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4" />

          <span>
            Client:{" "}
            <span className="font-medium text-slate-700">
              {work.client}
            </span>
          </span>
        </div>

        {/* LOCATION */}

        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4" />

          <span>
            {work.location}
          </span>
        </div>

        {/* START DATE */}

        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4" />

          <span>
            Date: {work.startDate}
          </span>
        </div>

        {/* DURATION */}

        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />

          <span>
            Duration: {work.deadline}
          </span>
        </div>

      </div>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        <WorkStatus status={work.status} />

        <button
          type="button"
          onClick={onViewJob}
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
        >
          <EyeIcon className="h-4 w-4" />

          View Job
        </button>

      </div>

    </article>
  );
};

/* ==================================================
   WORK STATUS
================================================== */

type WorkStatusProps = {
  status: WorkStatus;
};

const WorkStatus = ({
  status,
}: WorkStatusProps) => {
  if (status === "Active") {
    return (
      <div className="flex items-center gap-2">

        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

        <span className="text-sm font-medium text-blue-700">
          Active
        </span>

      </div>
    );
  }

  if (status === "Awaiting Confirmation") {
    return (
      <div className="flex items-center gap-2">

        <ClockIcon className="h-5 w-5 text-amber-600" />

        <span className="text-sm font-medium text-amber-700">
          Awaiting Confirmation
        </span>

      </div>
    );
  }

  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2">

        <XCircleIcon className="h-5 w-5 text-red-600" />

        <span className="text-sm font-medium text-red-700">
          Cancelled
        </span>

      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">

      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />

      <span className="text-sm font-medium text-emerald-700">
        Completed
      </span>

    </div>
  );
};

export default MyWork;