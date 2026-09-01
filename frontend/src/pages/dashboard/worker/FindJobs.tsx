import {
  BriefcaseIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const FindJobs = () => {
  return (
    <div className="space-y-6">

      {/* HEADER */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Find Jobs
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Find available jobs that match your skills.
        </p>
      </section>

      {/* SEARCH */}

      <div className="rounded-xl border border-slate-200 bg-white p-5">

        <div className="flex flex-col gap-3 sm:flex-row">

          <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">

            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />

            <input
              type="text"
              placeholder="Search for jobs..."
              className="w-full border-none bg-transparent text-sm outline-none"
            />

          </div>

          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Search
          </button>

        </div>

      </div>

      {/* EMPTY STATE */}

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="flex min-h-72 items-center justify-center px-6 py-10">

          <div className="text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

              <BriefcaseIcon className="h-6 w-6 text-slate-400" />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No jobs found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
              There are no available jobs matching
              your search right now.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
};

export default FindJobs;