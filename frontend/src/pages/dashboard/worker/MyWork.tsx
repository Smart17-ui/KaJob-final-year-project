import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   WORK STATUS
========================= */

type WorkStatus =
  | "Active"
  | "In Progress"
  | "Completed";

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
};

/* =========================
   SAMPLE WORK
========================= */

const works: Work[] = [
  {
    id: 1,
    jobId: 2,
    title: "Garden Maintenance",
    description:
      "Clean the garden, trim the grass and remove unwanted weeds.",
    category: "Gardening",
    client: "John Banda",
    location: "Woodlands, Lusaka",
    budget: "K180",
    status: "In Progress",
    startDate: "30 August 2026",
    deadline: "2 September 2026",
  },

  {
    id: 2,
    jobId: 5,
    title: "House Painting",
    description:
      "Paint the interior walls of a three-bedroom house.",
    category: "Painting",
    client: "Mary Phiri",
    location: "Chalala, Lusaka",
    budget: "K650",
    status: "Active",
    startDate: "3 September 2026",
    deadline: "6 September 2026",
  },

  {
    id: 3,
    jobId: 6,
    title: "Furniture Assembly",
    description:
      "Assemble bedroom furniture and organize the room.",
    category: "General Work",
    client: "Peter Mwale",
    location: "Roma, Lusaka",
    budget: "K300",
    status: "Completed",
    startDate: "25 August 2026",
    deadline: "25 August 2026",
  },
];

/* =========================
   FILTER
========================= */

type Filter =
  | "All"
  | "Active"
  | "In Progress"
  | "Completed";

/* =========================
   MY WORK
========================= */

const MyWork = () => {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState<Filter>("All");

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
  }, [filter]);

  /* =========================
     COUNTS
  ========================= */

  const activeCount =
    works.filter(
      (work) => work.status === "Active"
    ).length;

  const inProgressCount =
    works.filter(
      (work) => work.status === "In Progress"
    ).length;

  const completedCount =
    works.filter(
      (work) => work.status === "Completed"
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
          Manage your active and completed work.
        </p>
      </section>

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

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
            {works.length}
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
            {activeCount}
          </p>
        </button>

        {/* IN PROGRESS */}

        <button
          type="button"
          onClick={() =>
            setFilter("In Progress")
          }
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "In Progress"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            In Progress
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {inProgressCount}
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
            {completedCount}
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
              "In Progress",
              "Completed",
            ] as Filter[]
          ).map((item) => (

            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === item
                  ? "bg-emerald-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

      </section>

      {/* =========================
          WORK LIST
      ========================= */}

      {filteredWorks.length > 0 ? (

        <div className="space-y-4">

          {filteredWorks.map((work) => (

            <WorkCard
              key={work.id}
              work={work}
              onViewJob={() =>
                navigate(
                  `/worker/dashboard/jobs/${work.jobId}`
                )
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
            Start: {work.startDate}
          </span>

        </div>

        {/* DEADLINE */}

        <div className="flex items-center gap-2">

          <ClockIcon className="h-4 w-4" />

          <span>
            Deadline: {work.deadline}
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

  if (status === "In Progress") {
    return (
      <div className="flex items-center gap-2">

        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />

        <span className="text-sm font-medium text-amber-700">
          In Progress
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