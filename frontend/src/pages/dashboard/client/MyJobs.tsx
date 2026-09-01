import {
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";

type JobStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "DRAFT";

type Job = {
  id: number;
  title: string;
  location: string;
  budget: string;
  status: JobStatus;
  applications: number;
  postedAt: string;
};

const MyJobs = () => {
  const navigate = useNavigate();

  /*
   * Temporary data.
   *
   * This will later come from the Django REST API.
   */
  const jobs: Job[] = [];

  return (
    <div className="space-y-6">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Jobs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the jobs you have posted.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/post-job")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <PlusIcon className="h-5 w-5" />

          Post a Job
        </button>

      </section>

      {/* =========================
          FILTER / SEARCH
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 sm:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search your jobs..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />

          </div>

          {/* STATUS FILTER */}

          <select
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            defaultValue="ALL"
          >
            <option value="ALL">
              All Jobs
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="DRAFT">
              Draft
            </option>
          </select>

        </div>

      </section>

      {/* =========================
          JOBS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">

        {/* HEADER */}

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="text-base font-semibold text-slate-900">
            Your Jobs
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            View and manage your posted jobs.
          </p>

        </div>

        {/* =========================
            EMPTY STATE
        ========================= */}

        {jobs.length === 0 && (
          <div className="flex min-h-80 items-center justify-center px-6 py-12">

            <div className="max-w-sm text-center">

              {/* ICON */}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                <BriefcaseIcon className="h-7 w-7 text-slate-400" />

              </div>

              {/* TITLE */}

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                You don't have any jobs yet
              </h3>

              {/* DESCRIPTION */}

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Post your first job to start finding
                skilled workers near you.
              </p>

              {/* BUTTON */}

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/post-job")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <PlusIcon className="h-4 w-4" />

                Post your first job
              </button>

            </div>

          </div>
        )}

        {/* =========================
            JOB LIST
        ========================= */}

        {jobs.length > 0 && (
          <div className="divide-y divide-slate-100">

            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 transition-colors hover:bg-slate-50"
              >

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {job.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.location}
                    </p>

                  </div>

                  <div className="flex items-center gap-4">

                    <span className="text-sm font-semibold text-slate-900">
                      {job.budget}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {job.status}
                    </span>

                  </div>

                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                  <span>
                    {job.applications} applications
                  </span>

                  <span>
                    Posted {job.postedAt}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
};

export default MyJobs;