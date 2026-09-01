import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";

import StatCard from "@/components/dashboard/StatCard/StatCard";

import { getCurrentUser } from "@/shared/auth";

const ClientDashboard = () => {
  const navigate = useNavigate();

  /* =========================
     GET CURRENT USER
  ========================= */

  const user = getCurrentUser();

  const firstName = user?.first_name || "there";

  return (
    <div className="space-y-8">

      {/* =========================
          WELCOME SECTION
      ========================= */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName}! 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your jobs today.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/client/dashboard/post-job")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <PlusIcon className="h-5 w-5" />

          Post a Job
        </button>

      </section>

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Active Jobs"
          value={0}
          description="Currently active"
          icon={BriefcaseIcon}
          iconBackground="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Completed Jobs"
          value={0}
          description="Jobs completed"
          icon={CheckCircleIcon}
          iconBackground="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Pending Applications"
          value={0}
          description="Waiting for review"
          icon={ClockIcon}
          iconBackground="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Workers Hired"
          value={0}
          description="Total workers hired"
          icon={UsersIcon}
          iconBackground="bg-purple-50"
          iconColor="text-purple-600"
        />

      </section>

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
              navigate("/client/dashboard/jobs")
            }
            className="text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            View all
          </button>

        </div>

        {/* =========================
            EMPTY STATE
        ========================= */}

        <div className="flex min-h-64 items-center justify-center px-6 py-10">

          <div className="text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <BriefcaseIcon className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No jobs yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
              You haven't posted any jobs yet.
              Create your first job and start
              finding the right worker.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/client/dashboard/post-job")
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <PlusIcon className="h-4 w-4" />

              Post your first job
            </button>

          </div>

        </div>

      </section>

    </div>
  );
};

export default ClientDashboard;