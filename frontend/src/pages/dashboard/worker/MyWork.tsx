const MyWork = () => {
  return (
    <div className="space-y-6">

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          My Work
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your active and completed work.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="flex min-h-64 items-center justify-center px-6 py-10">

          <div className="text-center">

            <h3 className="text-sm font-semibold text-slate-900">
              No active work
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Jobs you are hired for will appear here.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
};

export default MyWork;