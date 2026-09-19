import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type JobStatus =
  | "ALL"
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED";

type JobStatusSidebarProps = {
  status: JobStatus;
  setStatus: (status: JobStatus) => void;

  counts: {
    ALL: number;
    OPEN: number;
    ASSIGNED: number;
    IN_PROGRESS: number;
    AWAITING_CONFIRMATION: number;
    COMPLETED: number;
    CANCELLED: number;
  };
};

const JobStatusSidebar = ({
  status,
  setStatus,
  counts,
}: JobStatusSidebarProps) => {
  const items = [
    {
      value: "ALL" as const,
      label: "All Jobs",
      icon: BriefcaseIcon,
    },
    {
      value: "OPEN" as const,
      label: "Open",
      icon: BriefcaseIcon,
    },
    {
      value: "ASSIGNED" as const,
      label: "Assigned",
      icon: CheckCircleIcon,
    },
    {
      value: "IN_PROGRESS" as const,
      label: "In Progress",
      icon: PlayCircleIcon,
    },
    {
      value: "AWAITING_CONFIRMATION" as const,
      label: "Awaiting Confirmation",
      icon: ClockIcon,
    },
    {
      value: "COMPLETED" as const,
      label: "Completed",
      icon: CheckCircleIcon,
    },
    {
      value: "CANCELLED" as const,
      label: "Cancelled",
      icon: XCircleIcon,
    },
  ];

  return (
    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
      <div className="px-3 pb-3 pt-2">
        <h2 className="text-sm font-semibold text-gray-900">
          My Jobs
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Filter by job status
        </p>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = status === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value)}
              className={`
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                text-sm
                font-medium
                transition
                ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon
                className={`
                  h-5
                  w-5
                  shrink-0
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-400"
                  }
                `}
              />

              <span className="flex-1">
                {item.label}
              </span>

              <span
                className={`
                  min-w-[28px]
                  rounded-full
                  px-2
                  py-0.5
                  text-center
                  text-xs
                  font-semibold
                  ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
              >
                {counts[item.value]}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default JobStatusSidebar;