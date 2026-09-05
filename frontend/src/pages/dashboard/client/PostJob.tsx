import {
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import JobDetailsForm from "../../../components/post-job/JobDetailsForm";

import JobScheduleForm from "../../../components/post-job/JobScheduleForm";

import JobLocationPicker from "../../../components/post-job/JobLocationPicker";

import JobSkillsSelector from  "../../../components/post-job/JobSkillsSelector";

import { createJob } from "../../../components/services/jobService.js";

import type {
  CategoryOption,
  FormErrors,
  JobForm,
  SkillOption,
} from "../types/job";

const initialForm: JobForm = {
  title: "",
  description: "",
  categoryId: "",
  budget: "",

  jobDate: "",
  jobTime: "",
  timeframe: "ANYTIME",
  durationHours: "",
  urgency: "NORMAL",
  isFlexible: false,

  location: "",
  latitude: null,
  longitude: null,
  locationAccuracy: null,

  requiredSkills: [],
};

const PostJob = () => {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<JobForm>(initialForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [
    createdJobId,
    setCreatedJobId,
  ] = useState<number | null>(null);

  /*
   * TEMPORARY CATEGORY DATA
   *
   * Replace this with categories fetched
   * from your backend once we confirm
   * the category endpoint.
   *
   * Your current database has category ID 1
   * with the name "111", so this is included
   * only for testing.
   */
  const categories: CategoryOption[] = [
    {
      id: 1,
      name: "111",
    },
  ];

  /*
   * Leave this empty until we confirm
   * your backend skills endpoint.
   *
   * Once we know the endpoint, these can
   * be fetched from the backend.
   */
  const skills: SkillOption[] = [];

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

    setErrorMessage("");
    setSuccessMessage("");
  }

  function updateLocation(
    latitude: number,
    longitude: number,
    accuracy: number | null = null
  ) {
    setForm((current) => ({
      ...current,
      latitude,
      longitude,
      locationAccuracy: accuracy,
    }));

    setErrors((current) => ({
      ...current,
      location: undefined,
    }));

    setErrorMessage("");
  }

  function updateAddress(
    location: string
  ) {
    setForm((current) => ({
      ...current,
      location,
    }));

    setErrors((current) => ({
      ...current,
      location: undefined,
    }));

    setErrorMessage("");
  }

  function updateSkills(
    skillIds: number[]
  ) {
    setForm((current) => ({
      ...current,
      requiredSkills: skillIds,
    }));
  }

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

    if (!form.categoryId) {
      nextErrors.categoryId =
        "Please select a category.";
    }

    const budget = Number(
      form.budget
    );

    if (!form.budget.trim()) {
      nextErrors.budget =
        "Budget is required.";
    } else if (
      Number.isNaN(budget) ||
      budget <= 0
    ) {
      nextErrors.budget =
        "Budget must be greater than 0.";
    }

    if (form.jobDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(
        `${form.jobDate}T00:00:00`
      );

      if (selectedDate < today) {
        nextErrors.jobDate =
          "Job date cannot be in the past.";
      }
    }

    if (form.durationHours) {
      const duration = Number(
        form.durationHours
      );

      if (
        Number.isNaN(duration) ||
        duration <= 0 ||
        duration > 24
      ) {
        nextErrors.durationHours =
          "Duration must be between 0 and 24 hours.";
      }
    }

    if (
      form.latitude === null ||
      form.longitude === null
    ) {
      nextErrors.location =
        "Please select a job location.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim(),

        budget: Number(form.budget),

        category_id: Number(
          form.categoryId
        ),

        general_location:
          form.location.trim() ||
          undefined,

        latitude:
          form.latitude ?? undefined,

        longitude:
          form.longitude ?? undefined,

        job_date:
          form.jobDate || undefined,

        job_time:
          form.jobTime
            ? `${form.jobTime}:00`
            : undefined,

        timeframe:
          form.timeframe,

        is_flexible:
          form.isFlexible,

        duration_hours:
          form.durationHours
            ? Number(
                form.durationHours
              )
            : undefined,

        urgency:
          form.urgency,

        required_skills:
          form.requiredSkills.length > 0
            ? form.requiredSkills
            : undefined,
      };

      const result =
        await createJob(payload);

      setCreatedJobId(
        result.job.id
      );

      setSuccessMessage(
        result.message ||
          "Job posted successfully!"
      );

      setForm(initialForm);
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(
          error.message
        );
      } else {
        setErrorMessage(
          "Something went wrong while posting the job."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (isSubmitting) {
      return;
    }

    setForm(initialForm);
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setCreatedJobId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Post a job
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Tell workers what you need help with and find the right person for the job.
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 shrink-0 text-green-600" />

              <div className="flex-1">
                <p className="font-medium text-green-800">
                  {successMessage}
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  {createdJobId && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${createdJobId}`
                        )
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                    >
                      View job
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMessage(
                        ""
                      );
                      setCreatedJobId(
                        null
                      );
                    }}
                    className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
                  >
                    Post another job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

              <div>
                <p className="font-medium text-red-800">
                  Unable to post job
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Job details */}
          <JobDetailsForm
            form={form}
            errors={errors}
            categories={categories}
            onChange={updateField}
          />

          {/* Schedule */}
          <JobScheduleForm
            form={form}
            errors={errors}
            onChange={updateField}
            onFlexibleChange={(value) =>
              setForm((current) => ({
                ...current,
                isFlexible: value,
              }))
            }
          />

          {/* Location */}
          <JobLocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            accuracy={
              form.locationAccuracy
            }
            location={form.location}
            onLocationChange={
              updateLocation
            }
            onAddressChange={
              updateAddress
            }
            error={errors.location}
          />

          {/* Skills */}
          <JobSkillsSelector
            skills={skills}
            selectedSkills={
              form.requiredSkills
            }
            onChange={updateSkills}
          />

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Posting job..."
                : "Post job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;