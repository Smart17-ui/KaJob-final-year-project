import type {
  JobCategory,
  FormErrors,
  JobForm,
} from "../../../shared/types/job";

import {
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

type JobDetailsFormProps = {
  form: JobForm;
  errors: FormErrors;
  categories: JobCategory[];
  onChange: (
    field: keyof JobForm,
    value: string
  ) => void;
};

const JobDetailsForm = ({
  form,
  errors,
  categories,
  onChange,
}: JobDetailsFormProps) => {
  return (
    <section>
      {/* =========================
          SECTION HEADER
          ========================= */}

      <div className="mb-7">
        <h2 className="text-lg font-semibold text-slate-900">
          Job details
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          Tell workers what you need help with.
        </p>
      </div>

      {/* =========================
          FORM FIELDS
          ========================= */}

      <div className="space-y-6">

        {/* =========================
            JOB TITLE
            ========================= */}

        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Job title
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <BriefcaseIcon
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                onChange(
                  "title",
                  event.target.value
                )
              }
              placeholder="e.g. Fix leaking kitchen pipe"
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
          </div>

          {errors.title && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        {/* =========================
            CATEGORY
            ========================= */}

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Category
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            id="category"
            value={form.categoryId}
            onChange={(event) =>
              onChange(
                "categoryId",
                event.target.value
              )
            }
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
              errors.categoryId
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            }`}
          >
            <option value="">
              Select a category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {categories.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">
              No categories are currently available.
            </p>
          )}

          {errors.categoryId && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.categoryId}
            </p>
          )}
        </div>

        {/* =========================
            DESCRIPTION
            ========================= */}

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Description
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <DocumentTextIcon
              className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400"
              aria-hidden="true"
            />

            <textarea
              id="description"
              rows={5}
              maxLength={1000}
              value={form.description}
              onChange={(event) =>
                onChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe the work that needs to be done..."
              className={`w-full resize-none rounded-xl border bg-white py-3 pl-10 pr-4 text-sm leading-6 text-slate-900 placeholder:text-slate-400 outline-none transition ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              }`}
            />
          </div>

          <div className="mt-1.5 flex items-start justify-between gap-4">
            {errors.description ? (
              <p className="text-sm text-red-600">
                {errors.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Include useful details about the work.
              </p>
            )}

            <span className="shrink-0 text-xs text-slate-400">
              {form.description.length}/1000
            </span>
          </div>
        </div>

        {/* =========================
            BUDGET
            ========================= */}

        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Budget
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <CurrencyDollarIcon
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              id="budget"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.budget}
              onChange={(event) => {
                const value =
                  event.target.value;

                // Allow only whole numbers.
                if (
                  value === "" ||
                  /^\d+$/.test(value)
                ) {
                  onChange(
                    "budget",
                    value
                  );
                }
              }}
              placeholder="e.g. 500"
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-16 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition ${
                errors.budget
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              }`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              ZMW
            </span>
          </div>

          {errors.budget ? (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.budget}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              Enter the whole amount you are willing to pay for the job.
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

export default JobDetailsForm;