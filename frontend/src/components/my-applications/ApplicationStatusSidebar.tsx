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
  | "REJECTED";

type ApplicationStatusSidebarProps = {
  status: ApplicationStatus;
  setStatus: (status: ApplicationStatus) => void;

  counts: {
    ALL: number;
    PENDING: number;
    ACCEPTED: number;
    REJECTED: number;
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
  ];

  return (
    <>
      {/* ==========================================
          MOBILE — horizontal pill row
      ========================================== */}

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
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3.5
                  py-2
                  text-sm
                  font-semibold
                  transition
                  ${
                    isActive
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />

                <span>{item.label}</span>

                <span
                  className={`
                    min-w-[20px]
                    rounded-full
                    px-1.5
                    py-0.5
                    text-center
                    text-xs
                    font-bold
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {counts[item.value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          DESKTOP — vertical card
      ========================================== */}

      <aside className="hidden h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:block lg:sticky lg:top-6">
        <div className="px-3 pb-3 pt-2">
          <h2 className="text-sm font-semibold text-gray-900">
            My Applications
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Filter by application status
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
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />

                <span className="flex-1">{item.fullLabel}</span>

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
    </>
  );
};

export default ApplicationStatusSidebar;
