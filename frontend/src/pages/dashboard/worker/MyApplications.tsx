const MyApplications = () => {
  return (
    <div className="space-y-6">

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the jobs you've applied for.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">

        <div className="flex min-h-64 items-center justify-center px-6 py-10">

          <div className="text-center">

            <h3 className="text-sm font-semibold text-slate-900">
              No applications yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your job applications will appear here.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
};

export default MyApplications;