import type {
  FormErrors,
  JobForm,
  Timeframe,
  Urgency,
} from "../../types/job";

import {
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type JobScheduleFormProps = {
  form: JobForm;
  errors: FormErrors;

  onChange: (
    field: keyof JobForm,
    value: string
  ) => void;

  onFlexibleChange: (
    value: boolean
  ) => void;
};

const JobScheduleForm = ({
  form,
  errors,
  onChange,
  onFlexibleChange,
}: JobScheduleFormProps) => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Schedule
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Let workers know when the job should be done.
        </p>
      </div>

      <div className="space-y-6">
        {/* Date + time */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Date */}
          <div>
            <label
              htmlFor="jobDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Job date
            </label>

            <div className="relative">
              <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                id="jobDate"
                type="date"
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                value={form.jobDate}
                onChange={(event) =>
                  onChange(
                    "jobDate",
                    event.target.value
                  )
                }
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 ${
                  errors.jobDate
                    ? "border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-100"
                }`}
              />
            </div>

            {errors.jobDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.jobDate}
              </p>
            )}
          </div>

          {/* Time */}
          <div>
            <label
              htmlFor="jobTime"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Preferred time
            </label>

            <div className="relative">
              <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                id="jobTime"
                type="time"
                value={form.jobTime}
                onChange={(event) =>
                  onChange(
                    "jobTime",
                    event.target.value
                  )
                }
                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 ${
                  errors.jobTime
                    ? "border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-100"
                }`}
              />
            </div>

            {errors.jobTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.jobTime}
              </p>
            )}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label
            htmlFor="timeframe"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Time of day
          </label>

          <select
            id="timeframe"
            value={form.timeframe}
            onChange={(event) =>
              onChange(
                "timeframe",
                event.target.value as Timeframe
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            <option value="ANYTIME">
              Anytime
            </option>

            <option value="MORNING">
              Morning (6AM - 12PM)
            </option>

            <option value="AFTERNOON">
              Afternoon (12PM - 5PM)
            </option>

            <option value="EVENING">
              Evening (5PM - 9PM)
            </option>
          </select>
        </div>

        {/* Duration + urgency */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Duration */}
          <div>
            <label
              htmlFor="durationHours"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Estimated duration
            </label>

            <div className="relative">
              <input
                id="durationHours"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={form.durationHours}
                onChange={(event) =>
                  onChange(
                    "durationHours",
                    event.target.value
                  )
                }
                placeholder="e.g. 2.5"
                className={`w-full rounded-xl border bg-white py-3 pl-4 pr-16 text-sm outline-none focus:ring-2 ${
                  errors.durationHours
                    ? "border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-100"
                }`}
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                hours
              </span>
            </div>

            {errors.durationHours && (
              <p className="mt-1 text-sm text-red-600">
                {errors.durationHours}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div>
            <label
              htmlFor="urgency"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Urgency
            </label>

            <select
              id="urgency"
              value={form.urgency}
              onChange={(event) =>
                onChange(
                  "urgency",
                  event.target.value as Urgency
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="IMMEDIATE">
                Immediate
              </option>

              <option value="URGENT">
                Urgent
              </option>

              <option value="NORMAL">
                Normal
              </option>

              <option value="FLEXIBLE">
                Flexible
              </option>
            </select>
          </div>
        </div>

        {/* Flexible */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={form.isFlexible}
            onChange={(event) =>
              onFlexibleChange(
                event.target.checked
              )
            }
            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />

          <span>
            <span className="block text-sm font-medium text-gray-800">
              I'm flexible with the schedule
            </span>

            <span className="mt-1 block text-xs text-gray-500">
              Workers can suggest a different time if necessary.
            </span>
          </span>
        </label>
      </div>
    </section>
  );
};

export default JobScheduleForm;