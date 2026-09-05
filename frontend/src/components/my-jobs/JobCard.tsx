import {
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import type { MyJob } from "../../types/job";

type JobCardProps = {
  job: MyJob;

  onView: (
    jobId: number
  ) => void;
};

const JobCard = ({
  job,
  onView,
}: JobCardProps) => {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Top section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-900">
            {job.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {job.category_name}
          </p>
        </div>

        {/* Status */}
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            job.status === "OPEN"
              ? "bg-green-100 text-green-700"
              : job.status === "COMPLETED"
              ? "bg-blue-100 text-blue-700"
              : job.status === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {job.status_display}
        </span>
      </div>

      {/* Job information */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* Budget */}
        <div className="flex items-start gap-3">
          <CurrencyDollarIcon className="h-5 w-5 shrink-0 text-green-600" />

          <div>
            <p className="text-xs text-gray-500">
              Budget
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              K{job.budget}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPinIcon className="h-5 w-5 shrink-0 text-green-600" />

          <div>
            <p className="text-xs text-gray-500">
              Location
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {job.general_location ||
                "Location not specified"}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-start gap-3">
          <CalendarDaysIcon className="h-5 w-5 shrink-0 text-green-600" />

          <div>
            <p className="text-xs text-gray-500">
              Job date
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {job.job_display_date}
            </p>
          </div>
        </div>

        {/* Duration */}
        {job.duration_hours && (
          <div className="flex items-start gap-3">
            <ClockIcon className="h-5 w-5 shrink-0 text-green-600" />

            <div>
              <p className="text-xs text-gray-500">
                Duration
              </p>

              <p className="mt-1 text-sm font-medium text-gray-800">
                {job.duration_hours} hours
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {job.is_urgent ? (
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />

              <span>
                {job.urgency_display}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {job.urgency_display}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onView(job.id)
          }
          className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          View job
        </button>
      </div>

      {/* Posted information */}
      <p className="mt-3 text-xs text-gray-400">
        Posted{" "}
        {new Date(
          job.posted_at
        ).toLocaleDateString()}
      </p>
    </article>
  );
};

export default JobCard;