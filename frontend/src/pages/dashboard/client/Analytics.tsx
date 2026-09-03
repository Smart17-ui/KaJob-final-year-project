import {
  BriefcaseIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const Analytics = () => {
  const stats = [
    {
      title: "Jobs Posted",
      value: "24",
      change: "+12%",
      description: "from last month",
      icon: BriefcaseIcon,
    },
    {
      title: "Jobs Completed",
      value: "18",
      change: "+8%",
      description: "from last month",
      icon: CheckCircleIcon,
    },
    {
      title: "Total Spent",
      value: "K12,450",
      change: "+15%",
      description: "from last month",
      icon: CurrencyDollarIcon,
    },
    {
      title: "Applications",
      value: "86",
      change: "+21%",
      description: "from last month",
      icon: UserGroupIcon,
    },
  ];

  const monthlyJobs = [
    { month: "Jan", value: 4 },
    { month: "Feb", value: 6 },
    { month: "Mar", value: 5 },
    { month: "Apr", value: 8 },
    { month: "May", value: 7 },
    { month: "Jun", value: 10 },
  ];

  const maxJobs = Math.max(
    ...monthlyJobs.map((item) => item.value)
  );

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track your jobs, spending, applications and
          hiring activity.
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
          CHART + HIRING
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Jobs Chart */}

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

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Jobs Posted
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Jobs posted over the last six months
              </p>
            </div>

            <select
              className="
                rounded-md
                border border-slate-200
                bg-white
                px-3 py-2
                text-xs
                text-slate-600
                outline-none
                focus:border-emerald-500
              "
              defaultValue="6"
            >
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>

          </div>

          {/* Chart */}

          <div className="mt-8 flex h-64 items-end gap-4 sm:gap-6">

            {monthlyJobs.map((item) => {
              const height =
                (item.value / maxJobs) * 100;

              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >

                  <span className="text-xs font-medium text-slate-500">
                    {item.value}
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

        {/* Hiring Overview */}

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
            Hiring Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your current hiring activity
          </p>

          <div className="mt-6 space-y-5">

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Applications received
                </span>

                <span className="font-semibold text-slate-900">
                  86
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[80%] rounded-full bg-emerald-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Workers hired
                </span>

                <span className="font-semibold text-slate-900">
                  18
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[55%] rounded-full bg-emerald-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Jobs completed
                </span>

                <span className="font-semibold text-slate-900">
                  18
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[75%] rounded-full bg-emerald-500" />
              </div>
            </div>

          </div>

          <div className="mt-8 rounded-lg bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
              Hiring rate
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              21%
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              +4.2% from last month
            </p>

          </div>

        </div>

      </div>

      {/* =========================
          SPENDING + CATEGORIES
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Spending */}

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
            Spending
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your spending summary
          </p>

          <div className="mt-6 flex items-end justify-between">

            <div>
              <p className="text-3xl font-bold text-slate-900">
                K12,450
              </p>

              <p className="mt-1 text-sm text-emerald-600">
                +15% from last month
              </p>
            </div>

            <CurrencyDollarIcon className="h-10 w-10 text-emerald-500" />

          </div>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Completed jobs
              </span>

              <span className="text-sm font-semibold text-slate-900">
                K8,200
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Active jobs
              </span>

              <span className="text-sm font-semibold text-slate-900">
                K3,250
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Other
              </span>

              <span className="text-sm font-semibold text-slate-900">
                K1,000
              </span>
            </div>

          </div>

        </div>

        {/* Popular Categories */}

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
            Popular Job Categories
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Categories you post most frequently
          </p>

          <div className="mt-6 space-y-5">

            {[
              {
                name: "Cleaning",
                jobs: 10,
                percentage: 75,
              },
              {
                name: "Gardening",
                jobs: 7,
                percentage: 55,
              },
              {
                name: "Construction",
                jobs: 5,
                percentage: 40,
              },
              {
                name: "Moving",
                jobs: 2,
                percentage: 20,
              },
            ].map((category) => (
              <div key={category.name}>

                <div className="flex justify-between">

                  <span className="text-sm text-slate-600">
                    {category.name}
                  </span>

                  <span className="text-sm font-medium text-slate-900">
                    {category.jobs} jobs
                  </span>

                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">

                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${category.percentage}%`,
                    }}
                  />

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;