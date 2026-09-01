import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   APPLICATION TYPES
========================= */

type ApplicationStatus =
  | "Pending"
  | "Accepted"
  | "Rejected";

type Application = {
  id: number;
  jobId: number;
  jobTitle: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  status: ApplicationStatus;
  appliedAt: string;
};

/* =========================
   SAMPLE APPLICATIONS
========================= */

const applications: Application[] = [
  {
    id: 1,
    jobId: 1,
    jobTitle: "House Cleaning",
    description:
      "Looking for someone to clean a three-bedroom house and organize the rooms.",
    category: "Cleaning",
    location: "Roma, Lusaka",
    budget: "K250",
    status: "Pending",
    appliedAt: "2 days ago",
  },

  {
    id: 2,
    jobId: 2,
    jobTitle: "Garden Maintenance",
    description:
      "Need someone to clean the garden, trim the grass and remove unwanted weeds.",
    category: "Gardening",
    location: "Woodlands, Lusaka",
    budget: "K180",
    status: "Accepted",
    appliedAt: "5 days ago",
  },

  {
    id: 3,
    jobId: 3,
    jobTitle: "Moving Assistance",
    description:
      "Looking for two people to help move furniture and boxes to a new house.",
    category: "Moving",
    location: "Chilenje, Lusaka",
    budget: "K400",
    status: "Rejected",
    appliedAt: "1 week ago",
  },

  {
    id: 4,
    jobId: 4,
    jobTitle: "Painting Assistant",
    description:
      "Need assistance with painting the interior walls of a small house.",
    category: "Construction",
    location: "Ibex Hill, Lusaka",
    budget: "K350",
    status: "Pending",
    appliedAt: "1 week ago",
  },
];

/* =========================
   FILTER TYPE
========================= */

type Filter =
  | "All"
  | "Pending"
  | "Accepted"
  | "Rejected";

/* =========================
   COMPONENT
========================= */

const MyApplications = () => {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState<Filter>("All");

  /* =========================
     FILTER APPLICATIONS
  ========================= */

  const filteredApplications =
    useMemo(() => {
      if (filter === "All") {
        return applications;
      }

      return applications.filter(
        (application) =>
          application.status === filter
      );
    }, [filter]);

  /* =========================
     STATUS COUNTS
  ========================= */

  const pendingCount =
    applications.filter(
      (application) =>
        application.status === "Pending"
    ).length;

  const acceptedCount =
    applications.filter(
      (application) =>
        application.status === "Accepted"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        application.status === "Rejected"
    ).length;

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the jobs you've applied for.
        </p>
      </section>

      {/* =========================
          APPLICATION SUMMARY
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
            Total
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {applications.length}
          </p>
        </button>

        {/* PENDING */}

        <button
          type="button"
          onClick={() => setFilter("Pending")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Pending"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {pendingCount}
          </p>
        </button>

        {/* ACCEPTED */}

        <button
          type="button"
          onClick={() => setFilter("Accepted")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Accepted"
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Accepted
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {acceptedCount}
          </p>
        </button>

        {/* REJECTED */}

        <button
          type="button"
          onClick={() => setFilter("Rejected")}
          className={`rounded-xl border bg-white p-4 text-left transition ${
            filter === "Rejected"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-sm text-slate-500">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {rejectedCount}
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
              "Pending",
              "Accepted",
              "Rejected",
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
          APPLICATIONS
      ========================= */}

      {filteredApplications.length > 0 ? (

        <div className="space-y-4">

          {filteredApplications.map(
            (application) => (

              <ApplicationCard
                key={application.id}
                application={application}
                onViewJob={() =>
                  navigate(
                    `/worker/dashboard/jobs/${application.jobId}`
                  )
                }
              />

            )
          )}

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
                No applications found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                You don't have any applications
                matching this filter.
              </p>

              {filter !== "All" && (
                <button
                  type="button"
                  onClick={() =>
                    setFilter("All")
                  }
                  className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View all applications
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
   APPLICATION CARD
================================================== */

type ApplicationCardProps = {
  application: Application;
  onViewJob: () => void;
};

const ApplicationCard = ({
  application,
  onViewJob,
}: ApplicationCardProps) => {

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">

      {/* =========================
          TOP
      ========================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* JOB INFO */}

        <div className="flex gap-4">

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">

            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />

          </div>

          <div>

            <h3 className="text-base font-semibold text-slate-900">
              {application.jobTitle}
            </h3>

            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {application.category}
            </span>

          </div>

        </div>

        {/* BUDGET */}

        <div className="sm:text-right">

          <p className="text-lg font-bold text-emerald-600">
            {application.budget}
          </p>

          <p className="text-xs text-slate-400">
            Budget
          </p>

        </div>

      </div>

      {/* =========================
          DESCRIPTION
      ========================= */}

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {application.description}
      </p>

      {/* =========================
          INFORMATION
      ========================= */}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

        <div className="flex items-center gap-1.5">

          <MapPinIcon className="h-4 w-4" />

          <span>
            {application.location}
          </span>

        </div>

        <div className="flex items-center gap-1.5">

          <ClockIcon className="h-4 w-4" />

          <span>
            Applied {application.appliedAt}
          </span>

        </div>

      </div>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        {/* STATUS */}

        <StatusBadge
          status={application.status}
        />

        {/* VIEW BUTTON */}

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
   STATUS BADGE
================================================== */

type StatusBadgeProps = {
  status: ApplicationStatus;
};

const StatusBadge = ({
  status,
}: StatusBadgeProps) => {

  if (status === "Pending") {
    return (
      <div className="flex items-center gap-2">

        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

        <span className="text-sm font-medium text-amber-700">
          Pending
        </span>

      </div>
    );
  }

  if (status === "Accepted") {
    return (
      <div className="flex items-center gap-2">

        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />

        <span className="text-sm font-medium text-emerald-700">
          Accepted
        </span>

      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">

      <XCircleIcon className="h-5 w-5 text-red-500" />

      <span className="text-sm font-medium text-red-600">
        Rejected
      </span>

    </div>
  );
};

export default MyApplications;