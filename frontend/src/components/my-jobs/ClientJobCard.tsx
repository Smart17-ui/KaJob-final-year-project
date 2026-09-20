import {
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import type { MyJob } from "../../shared/types/job";

type ClientJobCardProps = {
  job: MyJob;
  onView: (jobId: number) => void;
  onCancel?: (jobId: number) => void;
  onDelete: (jobId: number) => void;
  onConfirmCompletion: (jobId: number) => void;
};

const ClientJobCard = ({
  job,
  onView,
  onCancel,
  onDelete,
  onConfirmCompletion,
}: ClientJobCardProps) => {
  /*
   * A client can cancel a job only after
   * a worker has been assigned.
   *
   * IN_PROGRESS jobs are no longer cancellable
   * from this card.
   */
  const canCancel =
    job.status === "ASSIGNED" &&
    onCancel !== undefined;

  // Completed jobs are kept as part of the client's
  // job history and are not deletable from the UI.
  const canDelete =
    job.status === "OPEN" ||
    job.status === "CANCELLED";

  const canConfirmCompletion =
    job.status === "AWAITING_CONFIRMATION";

  const statusStyles = {
    OPEN: "bg-green-50 text-green-700 ring-green-100",
    ASSIGNED: "bg-blue-50 text-blue-700 ring-blue-100",
    IN_PROGRESS:
      "bg-purple-50 text-purple-700 ring-purple-100",
    AWAITING_CONFIRMATION:
      "bg-yellow-50 text-yellow-700 ring-yellow-100",
    COMPLETED:
      "bg-emerald-50 text-emerald-700 ring-emerald-100",
    CANCELLED:
      "bg-red-50 text-red-700 ring-red-100",
  };

  const statusStyle =
    statusStyles[job.status];

  return (
    <article
      className="
        rounded-xl
        border
        border-gray-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:border-gray-300
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {job.title}
          </h3>

          <p className="mt-0.5 truncate text-xs text-gray-500">
            {job.category_name ||
              "General task"}
          </p>
        </div>

        <span
          className={`
            shrink-0
            rounded-full
            px-2.5
            py-1
            text-[11px]
            font-semibold
            ring-1
            ring-inset
            ${statusStyle}
          `}
        >
          {job.status_display ||
            job.status}
        </span>
      </div>

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
          sm:grid-cols-4
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <CurrencyDollarIcon className="h-4 w-4 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Budget
            </p>

            <p className="truncate text-sm font-semibold text-gray-900">
              K{job.budget}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <MapPinIcon className="h-4 w-4 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Location
            </p>

            <p className="truncate text-sm font-medium text-gray-700">
              {job.general_location ||
                "Not specified"}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Date
            </p>

            <p className="truncate text-sm font-medium text-gray-700">
              {job.job_display_date ||
                "Flexible"}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" />

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Duration
            </p>

            <p className="truncate text-sm font-medium text-gray-700">
              {job.duration_hours
                ? `${job.duration_hours} hrs`
                : "Not set"}
            </p>
          </div>
        </div>
      </div>

      {job.is_urgent && (
        <div className="mt-3 flex items-center gap-1.5">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />

          <span className="text-xs font-medium text-red-600">
            {job.urgency_display ||
              "Urgent"}
          </span>
        </div>
      )}

      <div
        className="
          mt-4
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          border-t
          border-gray-100
          pt-3
        "
      >
        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={() =>
                onCancel(job.id)
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-red-200
                px-3
                py-1.5
                text-xs
                font-semibold
                text-red-600
                transition
                hover:bg-red-50
              "
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() =>
                onDelete(job.id)
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-gray-200
                px-3
                py-1.5
                text-xs
                font-semibold
                text-gray-600
                transition
                hover:bg-gray-50
              "
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>
          )}

          {canConfirmCompletion && (
            <button
              type="button"
              onClick={() =>
                onConfirmCompletion(job.id)
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-green-600
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-green-700
              "
            >
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Confirm completion
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onView(job.id)
          }
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            bg-gray-900
            px-3.5
            py-1.5
            text-xs
            font-semibold
            text-white
            transition
            hover:bg-gray-800
          "
        >
          View job
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {job.posted_at && (
        <p className="mt-2 text-[10px] text-gray-400">
          Posted{" "}
          {new Date(
            job.posted_at
          ).toLocaleDateString()}
        </p>
      )}
    </article>
  );
};

export default ClientJobCard;
