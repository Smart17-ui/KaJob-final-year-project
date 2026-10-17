
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type ApplicationStatus =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

type ApplicationStatusSidebarProps = {
  status: ApplicationStatus;
  setStatus: (status: ApplicationStatus) => void;
  counts: {
    ALL: number;
    PENDING: number;
    ACCEPTED: number;
    REJECTED: number;
    WITHDRAWN: number;
  };
};

const ApplicationStatusSidebar = ({
  status,
  setStatus,
  counts,
}: ApplicationStatusSidebarProps) => {
  const items = [
    {
      value: "ALL" as const,
      label: "All",
      fullLabel: "All Applications",
      icon: BriefcaseIcon,
    },
    {
      value: "PENDING" as const,
      label: "Pending",
      fullLabel: "Pending",
      icon: ClockIcon,
    },
    {
      value: "ACCEPTED" as const,
      label: "Accepted",
      fullLabel: "Accepted",
      icon: CheckCircleIcon,
    },
    {
      value: "REJECTED" as const,
      label: "Rejected",
      fullLabel: "Rejected",
      icon: XCircleIcon,
    },
    {
      value: "WITHDRAWN" as const,
      label: "Withdrawn",
      fullLabel: "Withdrawn",
      icon: XCircleIcon,
    },
  ];

  const getFilterClasses = (isActive: boolean) =>
    isActive
      ? "border-slate-800 bg-slate-800 text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

  const getCountClasses = (isActive: boolean) =>
    isActive
      ? "bg-slate-700 text-white"
      : "bg-slate-100 text-slate-600";

  return (
    <>
      {/* MOBILE — HORIZONTAL FILTERS */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = status === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatus(item.value)}
                aria-pressed={isActive}
                className={`
                  inline-flex shrink-0 items-center gap-2
                  rounded-full border px-3.5 py-2
                  text-sm font-semibold
                  transition-colors duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                  ${getFilterClasses(isActive)}
                `}
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />

                <span>{item.label}</span>

                <span
                  className={`
                    min-w-[20px] rounded-full px-1.5 py-0.5
                    text-center text-xs font-bold
                    ${getCountClasses(isActive)}
                  `}
                >
                  {counts[item.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP — VERTICAL FILTER CARD */}
      <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:block lg:sticky lg:top-6">
        <div className="px-3 pb-3 pt-2">
          <h2 className="text-sm font-semibold text-slate-900">
            My Applications
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Filter by application status
          </p>
        </div>

        <nav className="space-y-1" aria-label="Application status filters">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = status === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatus(item.value)}
                aria-pressed={isActive}
                className={`
                  flex w-full items-center gap-3
                  rounded-xl border px-3 py-3
                  text-left text-sm font-medium
                  transition-colors duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-emerald-500
                  focus-visible:ring-offset-2
                  ${getFilterClasses(isActive)}
                `}
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />

                <span className="flex-1">{item.fullLabel}</span>

                <span
                  className={`
                    min-w-[28px] rounded-full px-2 py-0.5
                    text-center text-xs font-semibold
                    ${getCountClasses(isActive)}
                  `}
                >
                  {counts[item.value]}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default ApplicationStatusSidebar;
