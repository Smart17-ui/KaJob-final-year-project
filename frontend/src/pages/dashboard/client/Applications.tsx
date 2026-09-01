import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

type Application = {
  id: number;
  jobTitle: string;
  clientName: string;
  location: string;
  amount: string;
  appliedDate: string;
  status: ApplicationStatus;
};

const Applications = () => {
  /*
   * Temporary data.
   *
   * Later this will come from your Django API.
   */
  const applications: Application[] = [
    {
      id: 1,
      jobTitle: "Help with moving furniture",
      clientName: "John Banda",
      location: "Lusaka",
      amount: "K350",
      appliedDate: "Aug 28, 2026",
      status: "PENDING",
    },
    {
      id: 2,
      jobTitle: "Garden cleaning",
      clientName: "Mary Phiri",
      location: "Woodlands",
      amount: "K250",
      appliedDate: "Aug 26, 2026",
      status: "ACCEPTED",
    },
    {
      id: 3,
      jobTitle: "House painting",
      clientName: "Peter Mwansa",
      location: "Chalala",
      amount: "K800",
      appliedDate: "Aug 22, 2026",
      status: "REJECTED",
    },
  ];

  const pendingCount = applications.filter(
    (application) =>
      application.status === "PENDING"
  ).length;

  const acceptedCount = applications.filter(
    (application) =>
      application.status === "ACCEPTED"
  ).length;

  const rejectedCount = applications.filter(
    (application) =>
      application.status === "REJECTED"
  ).length;

  return (
    <div className="space-y-8">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the jobs you have applied for.
        </p>
      </section>

      {/* =========================
          APPLICATION STATISTICS
      ========================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* PENDING */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
              <ClockIcon className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>
            </div>

          </div>
        </div>

        {/* ACCEPTED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Accepted
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {acceptedCount}
              </p>
            </div>

          </div>
        </div>

        {/* REJECTED */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Rejected
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {rejectedCount}
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* =========================
          APPLICATIONS
      ========================= */}

      <section className="rounded-xl border border-slate-200 bg-white">

        {/* HEADER */}

        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Your Applications
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Jobs you have submitted applications for.
          </p>
        </div>

        {/* APPLICATION LIST */}

        <div className="divide-y divide-slate-100">

          {applications.map((application) => (

            <div
              key={application.id}
              className="p-5 transition-colors hover:bg-slate-50"
            >

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* JOB INFORMATION */}

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <BriefcaseIcon className="h-6 w-6 text-slate-500" />
                  </div>

                  <div>

                    <h3 className="text-sm font-semibold text-slate-900">
                      {application.jobTitle}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Client: {application.clientName}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">

                      <span>
                        {application.location}
                      </span>

                      <span>
                        {application.amount}
                      </span>

                      <span>
                        Applied {application.appliedDate}
                      </span>

                    </div>

                  </div>

                </div>

                {/* STATUS */}

                <div className="flex items-center lg:justify-end">

                  {application.status ===
                    "PENDING" && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  )}

                  {application.status ===
                    "ACCEPTED" && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Accepted
                    </span>
                  )}

                  {application.status ===
                    "REJECTED" && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Rejected
                    </span>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
};

export default Applications;