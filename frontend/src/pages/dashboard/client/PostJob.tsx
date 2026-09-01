import {
  useState,
  type FormEvent,
} from "react";

import {
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

type JobForm = {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  deadline: string;
};

type FormErrors = {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  budget?: string;
  deadline?: string;
};

const initialForm: JobForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  budget: "",
  deadline: "",
};

const PostJob = () => {
  const [form, setForm] =
    useState<JobForm>(initialForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================
     UPDATE FORM
  ========================= */

  function updateField(
    field: keyof JobForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setSuccessMessage("");
  }

  /* =========================
     VALIDATION
  ========================= */

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        "Job title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Job description is required.";
    }

    if (!form.category) {
      nextErrors.category =
        "Please select a category.";
    }

    if (!form.location.trim()) {
      nextErrors.location =
        "Location is required.";
    }

    if (!form.budget.trim()) {
      nextErrors.budget =
        "Budget is required.";
    }

    if (!form.deadline) {
      nextErrors.deadline =
        "Please select a deadline.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  /* =========================
     SUBMIT
  ========================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    /*
     * Backend connection will be added later.
     *
     * Example later:
     *
     * await createJob(form);
     */

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    console.log(
      "JOB DATA:",
      form
    );

    setIsSubmitting(false);

    setSuccessMessage(
      "Job created successfully."
    );

    setForm(initialForm);
  }

  /* =========================
     CANCEL
  ========================= */

  function handleCancel() {
    setForm(initialForm);
    setErrors({});
    setSuccessMessage("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
            <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Post a Job
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Tell workers what you need help with.
            </p>
          </div>

        </div>
      </section>

      {/* =========================
          SUCCESS MESSAGE
      ========================= */}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white"
        noValidate
      >

        {/* =========================
            BASIC INFORMATION
        ========================= */}

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-base font-semibold text-slate-900">
            Job Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provide the basic details of your job.
          </p>

        </div>

        <div className="space-y-6 p-6">

          {/* JOB TITLE */}

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Job title
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Need someone to paint my house"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 ${
                errors.title
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />

            {errors.title && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* CATEGORY */}

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Category
            </label>

            <select
              id="category"
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-emerald-500/20 ${
                errors.category
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            >
              <option value="">
                Select a category
              </option>

              <option value="CLEANING">
                Cleaning
              </option>

              <option value="CONSTRUCTION">
                Construction
              </option>

              <option value="DELIVERY">
                Delivery
              </option>

              <option value="GARDENING">
                Gardening
              </option>

              <option value="MOVING">
                Moving
              </option>

              <option value="REPAIRS">
                Repairs
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>

            {errors.category && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Job description
            </label>

            <div className="relative">

              <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

              <textarea
                id="description"
                rows={6}
                placeholder="Describe the work you need done, including important requirements..."
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className={`w-full resize-none rounded-lg border py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.description
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />

            </div>

            {errors.description && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* =========================
              LOCATION + BUDGET
          ========================= */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* LOCATION */}

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Location
              </label>

              <div className="relative">

                <MapPinIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Lusaka"
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  className={`w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 ${
                    errors.location
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-200 focus:border-emerald-500"
                  }`}
                />

              </div>

              {errors.location && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {errors.location}
                </p>
              )}
            </div>

            {/* BUDGET */}

            <div>
              <label
                htmlFor="budget"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Budget
              </label>

              <div className="relative">

                <CurrencyDollarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="budget"
                  type="text"
                  placeholder="e.g. K500"
                  value={form.budget}
                  onChange={(event) =>
                    updateField(
                      "budget",
                      event.target.value
                    )
                  }
                  className={`w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 ${
                    errors.budget
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-200 focus:border-emerald-500"
                  }`}
                />

              </div>

              {errors.budget && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {errors.budget}
                </p>
              )}
            </div>

          </div>

          {/* DEADLINE */}

          <div>

            <label
              htmlFor="deadline"
              className="mb-2 block text-sm font-semibold text-slate-900"
            >
              Deadline
            </label>

            <div className="relative">

              <CalendarDaysIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  updateField(
                    "deadline",
                    event.target.value
                  )
                }
                className={`w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.deadline
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />

            </div>

            {errors.deadline && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errors.deadline}
              </p>
            )}

          </div>

        </div>

        {/* =========================
            FORM ACTIONS
        ========================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Posting..."
              : "Post Job"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default PostJob;