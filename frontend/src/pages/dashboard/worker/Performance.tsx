import {
  BriefcaseIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  StarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const Performance = () => {
  const stats = [
    {
      title: "Jobs Completed",
      value: "32",
      change: "+6",
      description: "this month",
      icon: CheckCircleIcon,
    },
    {
      title: "Average Rating",
      value: "4.8",
      change: "+0.2",
      description: "from last month",
      icon: StarIcon,
    },
    {
      title: "Total Earnings",
      value: "K8,750",
      change: "+18%",
      description: "this month",
      icon: CurrencyDollarIcon,
    },
    {
      title: "Applications",
      value: "48",
      change: "+9",
      description: "this month",
      icon: DocumentTextIcon,
    },
  ];

  const monthlyEarnings = [
    { month: "Jan", value: 1200 },
    { month: "Feb", value: 1800 },
    { month: "Mar", value: 1500 },
    { month: "Apr", value: 2300 },
    { month: "May", value: 1900 },
    { month: "Jun", value: 2800 },
  ];

  const maxEarnings = Math.max(
    ...monthlyEarnings.map(
      (item) => item.value
    )
  );

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Performance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your work, earnings, ratings and
          application success.
        </p>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="
                rounded-xl
                border border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>

                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                  {stat.change}
                </span>

              </div>

              <div className="mt-4">

                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>

              </div>

            </div>
          );
        })}

      </div>

      {/* =========================
          EARNINGS + RATING
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Earnings Chart */}

        <div
          className="
            rounded-xl
            border border-slate-200
            bg-white
            p-6
            shadow-sm
            lg:col-span-2
          "
        >

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Earnings
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your earnings over the last six months
            </p>
          </div>

          <div className="mt-8 flex h-64 items-end gap-4 sm:gap-6">

            {monthlyEarnings.map((item) => {
              const height =
                (item.value / maxEarnings) * 100;

              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >

                  <span className="text-xs font-medium text-slate-500">
                    K{item.value}
                  </span>

                  <div className="flex h-full w-full items-end">

                    <div
                      className="
                        w-full
                        rounded-t-md
                        bg-emerald-500
                        transition-all
                      "
                      style={{
                        height: `${height}%`,
                      }}
                    />

                  </div>

                  <span className="text-xs text-slate-400">
                    {item.month}
                  </span>

                </div>
              );
            })}

          </div>

        </div>

        {/* Rating */}

        <div
          className="
            rounded-xl
            border border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="text-base font-semibold text-slate-900">
            Rating
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your overall client rating
          </p>

          <div className="mt-8 text-center">

            <p className="text-5xl font-bold text-slate-900">
              4.8
            </p>

            <div className="mt-3 flex justify-center gap-1">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <StarIcon
                    key={star}
                    className="
                      h-5 w-5
                      fill-amber-400
                      text-amber-400
                    "
                  />
                )
              )}

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Based on 28 reviews
            </p>

          </div>

          <div className="mt-8 space-y-3">

            {[
              {
                stars: 5,
                percentage: 82,
              },
              {
                stars: 4,
                percentage: 12,
              },
              {
                stars: 3,
                percentage: 4,
              },
              {
                stars: 2,
                percentage: 2,
              },
              {
                stars: 1,
                percentage: 0,
              },
            ].map((rating) => (
              <div
                key={rating.stars}
                className="flex items-center gap-2"
              >

                <span className="w-8 text-xs text-slate-500">
                  {rating.stars} ★
                </span>

                <div className="h-2 flex-1 rounded-full bg-slate-100">

                  <div
                    className="h-2 rounded-full bg-amber-400"
                    style={{
                      width: `${rating.percentage}%`,
                    }}
                  />

                </div>

                <span className="w-8 text-right text-xs text-slate-400">
                  {rating.percentage}%
                </span>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* =========================
          APPLICATION PERFORMANCE
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Application Success */}

        <div
          className="
            rounded-xl
            border border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div>

              <h2 className="text-base font-semibold text-slate-900">
                Application Success
              </h2>

              <p className="text-xs text-slate-500">
                How often your applications are accepted
              </p>

            </div>

          </div>

          <div className="mt-6">

            <div className="flex items-end justify-between">

              <div>

                <p className="text-3xl font-bold text-slate-900">
                  38%
                </p>

                <p className="mt-1 text-sm text-emerald-600">
                  +7% from last month
                </p>

              </div>

              <p className="text-sm text-slate-500">
                18 / 48 accepted
              </p>

            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-100">

              <div className="h-3 w-[38%] rounded-full bg-emerald-500" />

            </div>

          </div>

        </div>

        {/* Work Summary */}

        <div
          className="
            rounded-xl
            border border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2 className="text-base font-semibold text-slate-900">
            Work Summary
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Overview of your completed work
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                32
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                In Progress
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                3
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Cancelled
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                1
              </p>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Success Rate
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                94%
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Performance;