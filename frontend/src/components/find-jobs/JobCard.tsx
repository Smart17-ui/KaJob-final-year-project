import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Job = {
  id: number;
  title: string;
  description: string;
  budget: string;
  general_location: string;
  category_name: string | null;
  status: string;
  urgency: string;
  urgency_display: string;
  job_date: string | null;
  job_time?: string | null;
  is_flexible: boolean;
  duration_hours: string | null;
  posted_at: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_urgent?: boolean;
  required_skills?: string[];
};

type NearbyJob = {
  job: Job;
  distance_km: number;
  distance_display: string;
};

type JobCardProps = {
  item: NearbyJob;
  applying: boolean;
  cancelling: boolean;
  isApplied: boolean;
  onViewJob: (item: NearbyJob) => void;
  onApply: (item: NearbyJob) => void;
  onCancel: (item: NearbyJob) => void;
};

const formatBudget = (budget: string): string => {
  if (!budget) {
    return "K0";
  }

  if (budget.startsWith("K")) {
    return budget;
  }

  return `K${budget}`;
};

const formatDate = (date: string | null): string => {
  if (!date) {
    return "Flexible";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getUrgencyClasses = (urgency: string): string => {
  switch (urgency.toUpperCase()) {
    case "IMMEDIATE":
      return "bg-red-50 text-red-700";

    case "URGENT":
      return "bg-orange-50 text-orange-700";

    case "NORMAL":
      return "bg-blue-50 text-blue-700";

    case "FLEXIBLE":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const JobCard = ({
  item,
  applying,
  cancelling,
  isApplied,
  onViewJob,
  onApply,
  onCancel,
}: JobCardProps) => {
  const job = item.job;

  const handleCardClick = () => {
    onViewJob(item);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className="
        flex
        min-w-0
        cursor-pointer
        flex-col
        rounded-xl
        border
        border-gray-200
        bg-white
        transition
        hover:-translate-y-0.5
        hover:border-gray-300
        hover:shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-gray-200
      "
    >
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {job.category_name && (
              <span className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                {job.category_name}
              </span>
            )}

            <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
              {job.title}
            </h3>
          </div>

          <p className="shrink-0 text-sm font-bold text-gray-900">
            {formatBudget(job.budget)}
          </p>
        </div>

        <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-gray-500">
          {job.description}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-gray-800">
              {job.general_location || "Location available"}
            </p>

            <p className="text-[10px] text-gray-500">
              {item.distance_display ||
                `${item.distance_km} km away`}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />

              <span className="text-[10px] text-gray-500">
                Date
              </span>
            </div>

            <p className="mt-1 truncate text-[10px] font-medium text-gray-800">
              {formatDate(job.job_date)}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />

              <span className="text-[10px] text-gray-500">
                Duration
              </span>
            </div>

            <p className="mt-1 truncate text-[10px] font-medium text-gray-800">
              {job.duration_hours
                ? `${job.duration_hours} hrs`
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex min-h-[22px] items-center gap-1.5 overflow-hidden">
          {job.urgency_display && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${getUrgencyClasses(
                job.urgency
              )}`}
            >
              {job.urgency_display}
            </span>
          )}

          {job.required_skills &&
            job.required_skills
              .slice(0, 1)
              .map((skill) => (
                <span
                  key={skill}
                  className="max-w-[100px] truncate rounded border border-gray-200 px-1.5 py-0.5 text-[9px] text-gray-500"
                >
                  {skill}
                </span>
              ))}

          {job.required_skills &&
            job.required_skills.length > 1 && (
              <span className="shrink-0 text-[9px] text-gray-400">
                +{job.required_skills.length - 1}
              </span>
            )}
        </div>

        {/* ACTION BUTTONS */}

        <div className="mt-3 flex gap-2">
          {isApplied ? (
            <>
              {/* CANCEL */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCancel(item);
                }}
                disabled={cancelling}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-2
                  py-1.5
                  text-[11px]
                  font-semibold
                  text-red-700
                  transition
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <XMarkIcon className="h-3.5 w-3.5" />

                  {cancelling
                    ? "Cancelling..."
                    : "Cancel"}
                </span>
              </button>

              {/* APPLIED */}
              <button
                type="button"
                disabled
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="
                  flex-1
                  cursor-not-allowed
                  rounded-lg
                  border
                  border-green-200
                  bg-green-50
                  px-2
                  py-1.5
                  text-[11px]
                  font-semibold
                  text-green-700
                "
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Applied
                </span>
              </button>
            </>
          ) : (
            <>
              {/* VIEW DETAILS */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewJob(item);
                }}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-gray-200
                  px-2
                  py-1.5
                  text-[11px]
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                View Details
              </button>

              {/* APPLY */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onApply(item);
                }}
                disabled={applying}
                className="
                  flex-1
                  rounded-lg
                  bg-gray-900
                  px-2
                  py-1.5
                  text-[11px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {applying
                  ? "Applying..."
                  : "Apply"}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;