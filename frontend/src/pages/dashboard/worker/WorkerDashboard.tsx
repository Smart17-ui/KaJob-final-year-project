import { getCurrentUser } from "@/shared/auth";

const WorkerDashboard = () => {
  /* =========================
     GET CURRENT USER
  ========================= */

  const user = getCurrentUser();

  const firstName = user?.first_name || "there";

  return (
    <div className="space-y-8">

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}! 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Find jobs, manage your applications,
          and keep track of your work.
        </p>
      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* APPLICATIONS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Applications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>

        {/* ACTIVE JOBS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Active Jobs
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>

        {/* COMPLETED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>

        {/* EARNINGS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Earnings
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            K0
          </p>
        </div>

      </div>

      {/* =========================
          WELCOME CARD
      ========================= */}

      <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-sm">

        <h2 className="text-xl font-semibold">
          Find your next job
        </h2>

        <p className="mt-2 max-w-xl text-sm text-emerald-50">
          Browse available jobs near you,
          submit applications, and start
          earning through KaJob.
        </p>

      </div>

    </div>
  );
};

export default WorkerDashboard;