import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";

import type { Job } from "@/shared/types/job";

type JobCardProps = {
  job: Job;
};

const formatBudget = (budget: string | number) => {
  const amount = Number(budget);

  if (Number.isNaN(amount)) {
    return `K${budget}`;
  }

  return `K${amount.toLocaleString()}`;
};

const formatPostedDate = (dateString?: string) => {
  if (!dateString) {
    return "Recently posted";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return date.toLocaleDateString();
};

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

  const timeframe =
    job.timeframe_display ||
    job.timeframe;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md">

      {/* TOP */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex gap-4">

          {/* ICON */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50">

            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />

          </div>

          {/* TITLE */}

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-base font-semibold text-slate-900">
                {job.title}
              </h3>

              {job.is_urgent && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Urgent
                </span>
              )}

            </div>

            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {job.category_name || "General"}
            </span>

          </div>

        </div>

        {/* BUDGET */}

        <div className="sm:text-right">

          <p className="text-lg font-bold text-emerald-600">
            {formatBudget(job.budget)}
          </p>

          <p className="text-xs text-slate-400">
            Budget
          </p>

        </div>

      </div>

      {/* DESCRIPTION */}

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {job.description || "No description provided."}
      </p>

      {/* DETAILS */}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

        {/* LOCATION */}

        {job.general_location && (
          <div className="flex items-center gap-1.5">

            <MapPinIcon className="h-4 w-4" />

            <span>
              {job.general_location}
            </span>

          </div>
        )}

        {/* POSTED */}

        <div className="flex items-center gap-1.5">

          <ClockIcon className="h-4 w-4" />

          <span>
            {formatPostedDate(job.posted_at)}
          </span>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        {/* TAGS */}

        <div className="flex flex-wrap gap-2">

          {timeframe && (
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              {timeframe}
            </span>
          )}

          {job.duration_hours && (
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              {job.duration_hours} hours
            </span>
          )}

        </div>

        {/* BUTTON */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/worker/dashboard/jobs/${job.id}`
            )
          }
          className="rounded-lg border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
        >
          View Details
        </button>

      </div>

    </article>
  );
};

export default JobCard;