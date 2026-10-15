import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Avatar from "@/components/shared/Avatar";

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
  client_name?: string | null;
  client_photo_url?: string | null;
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
  if (!budget) return "K0";
  if (budget.startsWith("K")) return budget;
  return `K${budget}`;
};

const formatDate = (date: string | null): string => {
  if (!date) return "Flexible";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

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
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      className="
        flex
        min-w-0
        cursor-pointer
        flex-col
        rounded-2xl
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
      <div className="flex flex-1 flex-col p-4 sm:p-4">
        {/* HEADER — category + title + budget */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {job.category_name && (
              <span className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {job.category_name}
              </span>
            )}

            <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-5 text-gray-900">
              {job.title}
            </h3>
          </div>

          <p className="shrink-0 text-base font-bold text-gray-900">
            {formatBudget(job.budget)}
          </p>
        </div>

        {/* DESCRIPTION */}

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">
          {job.description}
        </p>

        {/* LOCATION */}

        <div className="mt-3 flex items-start gap-2">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {job.general_location || "Location available"}
            </p>

            <p className="text-xs text-gray-500">
              {item.distance_display ||
                `${item.distance_km} km away`}
            </p>
          </div>
        </div>

        {/* DATE + DURATION */}

        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="text-xs text-gray-500">Date</span>
            </div>

            <p className="mt-1 truncate text-xs font-medium text-gray-800">
              {formatDate(job.job_date)}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="text-xs text-gray-500">Duration</span>
            </div>

            <p className="mt-1 truncate text-xs font-medium text-gray-800">
              {job.duration_hours
                ? `${job.duration_hours} hrs`
                : "Not specified"}
            </p>
          </div>
        </div>

        {/* BADGES */}

        <div className="mt-3 flex min-h-[24px] flex-wrap items-center gap-1.5">
          {job.urgency_display && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getUrgencyClasses(
                job.urgency
              )}`}
            >
              {job.urgency_display}
            </span>
          )}

          {job.required_skills &&
            job.required_skills.slice(0, 1).map((skill) => (
              <span
                key={skill}
                className="max-w-[120px] truncate rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500"
              >
                {skill}
              </span>
            ))}

          {job.required_skills &&
            job.required_skills.length > 1 && (
              <span className="shrink-0 text-xs text-gray-400">
                +{job.required_skills.length - 1}
              </span>
            )}
        </div>

        {/* POSTED BY */}

        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          <Avatar
            photoUrl={job.client_photo_url}
            name={job.client_name}
            size="xs"
          />

          <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
            Posted by{" "}
            <span className="font-medium text-gray-700">
              {job.client_name || "Client"}
            </span>
          </span>
        </div>

        {/* ACTIONS */}

        <div className="mt-3 flex gap-2">
          {isApplied ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onCancel(item);
                }}
                disabled={cancelling}
                className="
                  flex-1
                  min-h-[40px]
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-red-700
                  transition
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <XMarkIcon className="h-4 w-4" />
                  {cancelling ? "Cancelling..." : "Cancel"}
                </span>
              </button>

              <button
                type="button"
                disabled
                onClick={(event) => event.stopPropagation()}
                className="
                  flex-1
                  min-h-[40px]
                  cursor-not-allowed
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-green-700
                "
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4" />
                  Applied
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewJob(item);
                }}
                className="
                  flex-1
                  min-h-[40px]
                  rounded-xl
                  border
                  border-gray-200
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                View Details
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onApply(item);
                }}
                disabled={applying}
                className="
                  flex-1
                  min-h-[40px]
                  rounded-xl
                  bg-gray-900
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {applying ? "Applying..." : "Apply"}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
