import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

import { getSelectedRole } from "@/shared/auth";

/* =========================
   METRIC CARD COMPONENT
========================= */

interface MetricCardProps {
  label: string;
  value: string | number;
  change: number;
  subtext: string;
  icon: React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
}

const MetricCard = ({
  label,
  value,
  change,
  subtext,
  icon: Icon,
}: MetricCardProps) => {
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isPositive ? (
                <ArrowTrendingUpIcon className="h-3 w-3" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3" />
              )}

              <span>
                {isPositive ? "+" : ""}
                {change}%
              </span>
            </div>

            <span className="text-xs text-slate-500">
              {subtext}
            </span>
          </div>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

/* =========================
   ACTIVITY ITEM COMPONENT
========================= */

interface ActivityItemProps {
  title: string;
  description: string;
  timestamp: string;
  type:
    | "job"
    | "message"
    | "application"
    | "payment";
}

const ActivityItem = ({
  title,
  description,
  timestamp,
  type,
}: ActivityItemProps) => {
  const getIcon = () => {
    switch (type) {
      case "job":
        return (
          <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
        );

      case "message":
        return (
          <BellIcon className="h-5 w-5 text-blue-600" />
        );

      case "application":
        return (
          <CheckCircleIcon className="h-5 w-5 text-purple-600" />
        );

      case "payment":
        return (
          <BriefcaseIcon className="h-5 w-5 text-amber-600" />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 border-b border-slate-100 pb-4 last:border-0">
      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
        {getIcon()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {description}
        </p>

        <p className="mt-2 text-xs font-medium text-slate-400">
          {timestamp}
        </p>
      </div>
    </div>
  );
};

/* =========================
   SIMPLE BAR CHART
========================= */

interface BarChartProps {
  data: Array<{
    day: string;
    value: number;
  }>;
  maxValue?: number;
}

const SimpleBarChart = ({
  data,
  maxValue = 800,
}: BarChartProps) => {
  return (
    <div className="flex items-end justify-around gap-2">
      {data.map((item, idx) => {
        const heightPercent =
          (item.value / maxValue) * 100;

        return (
          <div
            key={idx}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="w-8 rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all hover:shadow-lg"
              style={{
                height: `${heightPercent * 2}px`,
                minHeight: "8px",
              }}
            />

            <span className="text-xs font-medium text-slate-500">
              {item.day}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* =========================
   MINI TREND CHART
========================= */

interface TrendChartProps {
  data: number[];
  color?: string;
}

const TrendChart = ({
  data,
  color = "#10b981",
}: TrendChartProps) => {
  if (data.length < 2) {
    return null;
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data
    .map((value, idx) => {
      const x =
        (idx / (data.length - 1)) * 100;

      const y =
        100 -
        ((value - minValue) / range) * 100;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 40"
      className="h-12 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

const DashboardOverview = () => {
  const role = getSelectedRole();

  /* =========================
     MOCK DATA - CLIENT
  ========================= */

  const clientMetrics = [
    {
      label: "Active Jobs",
      value: 12,
      change: 8,
      subtext: "vs last month",
      icon: BriefcaseIcon,
    },
    {
      label: "Total Applications",
      value: 47,
      change: 12,
      subtext: "vs last month",
      icon: CheckCircleIcon,
    },
    {
      label: "Completion Rate",
      value: "94%",
      change: 5,
      subtext: "vs last month",
      icon: ClockIcon,
    },
  ];

  /* =========================
     MOCK DATA - WORKER
  ========================= */

  const workerMetrics = [
    {
      label: "Available Jobs",
      value: 28,
      change: 15,
      subtext: "vs last month",
      icon: BriefcaseIcon,
    },
    {
      label: "Pending Applications",
      value: 9,
      change: -3,
      subtext: "vs last month",
      icon: CheckCircleIcon,
    },
    {
      label: "Average Rating",
      value: "4.8",
      change: 2,
      subtext: "vs last month",
      icon: ClockIcon,
    },
  ];

  const metrics =
    role === "CLIENT"
      ? clientMetrics
      : workerMetrics;

  /* =========================
     MOCK ACTIVITY DATA
  ========================= */

  const activities = [
    {
      title: "New Application",
      description:
        "Sarah Johnson applied for plumbing installation",
      timestamp: "2 hours ago",
      type: "application" as const,
    },
    {
      title: "Job Completed",
      description:
        "Garden landscaping project marked as complete",
      timestamp: "5 hours ago",
      type: "job" as const,
    },
    {
      title: "Message Received",
      description:
        "John sent a message about electrical work",
      timestamp: "Yesterday",
      type: "message" as const,
    },
    {
      title: "Payment Received",
      description:
        "K800 received for completed cleaning job",
      timestamp: "2 days ago",
      type: "payment" as const,
    },
  ];

  /* =========================
     MOCK CHART DATA
  ========================= */

  const chartData = [
    { day: "Mon", value: 245 },
    { day: "Tue", value: 520 },
    { day: "Wed", value: 480 },
    { day: "Thu", value: 650 },
    { day: "Fri", value: 420 },
    { day: "Sat", value: 380 },
    { day: "Sun", value: 200 },
  ];

  const trendData = [
    10,
    15,
    12,
    20,
    18,
    25,
    22,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">
          <p className="text-slate-600">
            {role === "CLIENT"
              ? "Here's an overview of your posted jobs and applications"
              : "Here's an overview of available jobs and your progress"}
          </p>
        </div>

        {/* =========================
            METRICS GRID
        ========================= */}

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {metrics.map((metric, idx) => (
            <MetricCard
              key={idx}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              subtext={metric.subtext}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* =========================
            CHARTS & ACTIVITY ROW
        ========================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* =========================
              ACTIVITY CHART
          ========================= */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {role === "CLIENT"
                    ? "Applications Trend"
                    : "Job Activity"}
                </h2>

                <p className="text-sm text-slate-500">
                  Last 7 days
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {chartData.reduce(
                    (sum, item) =>
                      sum + item.value,
                    0
                  )}
                </p>

                <p className="text-xs font-semibold text-emerald-600">
                  ↑ 12% vs last week
                </p>
              </div>

            </div>

            <div className="mb-6 h-40">
              <SimpleBarChart
                data={chartData}
                maxValue={700}
              />
            </div>
          </div>

          {/* =========================
              LATEST ACTIVITY
          ========================= */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-lg font-bold text-slate-900">
                Latest Updates
              </h2>

              <BellIcon className="h-5 w-5 text-slate-400" />

            </div>

            <div className="space-y-4">
              {activities.map(
                (activity, idx) => (
                  <ActivityItem
                    key={idx}
                    title={activity.title}
                    description={
                      activity.description
                    }
                    timestamp={
                      activity.timestamp
                    }
                    type={activity.type}
                  />
                )
              )}
            </div>

          </div>

        </div>

        {/* =========================
            BOTTOM SECTION
        ========================= */}

        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-6">

            <h2 className="text-lg font-bold text-slate-900">
              {role === "CLIENT"
                ? "Recent Applications"
                : "Recent Jobs"}
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-100">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {role === "CLIENT"
                      ? "Job"
                      : "Title"}
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>
                {[1, 2, 3, 4].map(
                  (item) => (
                    <tr
                      key={item}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Electrical
                            Installation
                          </p>

                          <p className="text-xs text-slate-500">
                            #KJ-
                            {Math.floor(
                              Math.random() *
                                10000
                            )}
                          </p>
                        </div>

                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        2026-08-28
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        K2,500
                      </td>

                      <td className="px-6 py-4">

                        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                          View
                        </button>

                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>

          <div className="border-t border-slate-100 px-6 py-4">

            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              View All →
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;