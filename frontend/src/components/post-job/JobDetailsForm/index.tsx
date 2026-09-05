import type {
  CategoryOption,
  FormErrors,
  JobForm,
} from "../../types/job";

import {
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

type JobDetailsFormProps = {
  form: JobForm;
  errors: FormErrors;

  categories: CategoryOption[];

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
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Job details
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Tell workers what you need help with.
        </p>
      </div>

      <div className="space-y-6">
        {/* Job title */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Job title
          </label>

          <div className="relative">
            <BriefcaseIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

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
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-green-600 focus:ring-green-100"
              }`}
            />
          </div>

          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Category
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
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
              errors.categoryId
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-green-600 focus:ring-green-100"
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
            <p className="mt-2 text-xs text-gray-500">
              No categories are currently available.
            </p>
          )}

          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.categoryId}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <div className="relative">
            <DocumentTextIcon className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" />

            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(event) =>
                onChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe the work that needs to be done..."
              className={`w-full resize-none rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${
                errors.description
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-green-600 focus:ring-green-100"
              }`}
            />
          </div>

          <div className="mt-1 flex justify-between">
            {errors.description ? (
              <p className="text-sm text-red-600">
                {errors.description}
              </p>
            ) : (
              <span />
            )}

            <span className="text-xs text-gray-400">
              {form.description.length}/1000
            </span>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Budget
          </label>

          <div className="relative">
            <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={form.budget}
              onChange={(event) =>
                onChange(
                  "budget",
                  event.target.value
                )
              }
              placeholder="e.g. 500"
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-16 text-sm outline-none transition focus:ring-2 ${
                errors.budget
                  ? "border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-green-600 focus:ring-green-100"
              }`}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              ZMW
            </span>
          </div>

          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">
              {errors.budget}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobDetailsForm;