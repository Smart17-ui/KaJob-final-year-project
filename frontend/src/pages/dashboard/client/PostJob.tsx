import {
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import JobDetailsForm from "../../../components/post-job/JobDetailsForm";
import JobScheduleForm from "../../../components/post-job/JobScheduleForm";
import JobLocationPicker from "../../../components/post-job/JobLocationPicker";
import JobSkillsSelector from "../../../components/post-job/JobSkillsSelector";

import FeedbackModal from "../../../components/pop/FeedbackModal/FeedbackModal";

import { createJob } from "../../../components/services/jobService.js";

import { getCurrentUser } from "@/shared/auth";

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
  durationHours: "",
  urgency: "NORMAL",
  isFlexible: false,

  location: "",
  latitude: null,
  longitude: null,
  locationAccuracy: null,

  requiredSkills: [],
};

type FeedbackState = {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

const PostJob = () => {
  const navigate = useNavigate();

  /*
   * =========================
   * AUTHENTICATION
   * =========================
   */

  const user = getCurrentUser();

  const isAuthenticated = Boolean(user);

  /*
   * The backend UserSerializer already returns
   * is_verified.
   *
   * Unverified users can still open this page,
   * but they cannot post a job.
   */

  const isVerified =
    user?.is_verified === true;

  /*
   * =========================
   * FORM STATE
   * =========================
   */

  const [form, setForm] =
    useState<JobForm>(initialForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * =========================
   * POPUP STATE
   * =========================
   */

  const [feedback, setFeedback] =
    useState<FeedbackState>({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
    });

  const [
    createdJobId,
    setCreatedJobId,
  ] = useState<number | null>(null);

  /*
   * =========================
   * TEMPORARY CATEGORY DATA
   * =========================
   *
   * Replace this with categories fetched
   * from your backend once we confirm
   * the category endpoint.
   */

  const categories: CategoryOption[] = [
    {
      id: 1,
      name: "111",
    },
  ];

  /*
   * =========================
   * TEMPORARY SKILLS DATA
   * =========================
   *
   * Leave this empty until we confirm
   * the backend skills endpoint.
   */

  const skills: SkillOption[] = [];

  /*
   * =========================
   * FORM FIELD UPDATE
   * =========================
   */

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

    closeFeedback();
  }

  /*
   * =========================
   * LOCATION UPDATE
   * =========================
   */

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

    closeFeedback();
  }

  /*
   * =========================
   * ADDRESS UPDATE
   * =========================
   */

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

    closeFeedback();
  }

  /*
   * =========================
   * SKILLS UPDATE
   * =========================
   */

  function updateSkills(
    skillIds: number[]
  ) {
    setForm((current) => ({
      ...current,
      requiredSkills: skillIds,
    }));
  }

  /*
   * =========================
   * FEEDBACK HELPERS
   * =========================
   */

  function closeFeedback() {
    setFeedback((current) => ({
      ...current,
      isOpen: false,
    }));
  }

  function showFeedback(
    type: FeedbackState["type"],
    title: string,
    message: string
  ) {
    setFeedback({
      isOpen: true,
      type,
      title,
      message,
    });
  }

  /*
   * =========================
   * VALIDATION
   * =========================
   */

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

  /*
   * =========================
   * SUBMIT JOB
   * =========================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    closeFeedback();

    /*
     * Extra authentication protection.
     */

    if (!isAuthenticated) {
      showFeedback(
        "warning",
        "Login required",
        "You need to be logged in before you can post a job."
      );

      return;
    }

    /*
     * Extra verification protection.
     */

    if (!isVerified) {
      showFeedback(
        "warning",
        "Verification required",
        "Verify your account before posting a job."
      );

      return;
    }

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

      const jobId =
        result.job.id;

      setCreatedJobId(jobId);

      setForm(initialForm);
      setErrors({});

      showFeedback(
        "success",
        "Job posted successfully",
        result.message ||
          "Your job has been posted successfully and is now available to workers."
      );
    } catch (error) {
      if (error instanceof Error) {
        showFeedback(
          "error",
          "Unable to post job",
          error.message
        );
      } else {
        showFeedback(
          "error",
          "Unable to post job",
          "Something went wrong while posting your job. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * =========================
   * CANCEL
   * =========================
   */

  function handleCancel() {
    if (isSubmitting) {
      return;
    }

    setForm(initialForm);
    setErrors({});
    setCreatedJobId(null);
    closeFeedback();
  }

  /*
   * =========================
   * POST ANOTHER JOB
   * =========================
   */

  function handlePostAnotherJob() {
    setForm(initialForm);
    setErrors({});
    setCreatedJobId(null);
    closeFeedback();
  }

  /*
   * =========================
   * VIEW CREATED JOB
   * =========================
   */

  function handleViewCreatedJob() {
    if (!createdJobId) {
      return;
    }

    closeFeedback();

    navigate(
      `/jobs/${createdJobId}`
    );
  }

  /*
   * =========================
   * NOT AUTHENTICATED
   * =========================
   */

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <LockClosedIcon className="h-7 w-7 text-amber-600" />
              </div>

              <h1 className="mt-5 text-2xl font-bold text-slate-900">
                Login required
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                You need to be logged in
                before you can post a job
                on KaJob.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>
        </div>

        <FeedbackModal
          isOpen={feedback.isOpen}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={closeFeedback}
        />
      </>
    );
  }

  /*
   * =========================
   * NOT VERIFIED
   * =========================
   *
   * The user remains on:
   *
   * /client/dashboard/post-job
   *
   * We do NOT redirect them.
   *
   * The Post Job tab remains active.
   */

  if (!isVerified) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <ShieldCheckIcon className="h-8 w-8 text-amber-600" />
              </div>

              <h1 className="mt-6 text-2xl font-bold text-slate-900">
                Verify your account
                to post a job
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                Your account needs to
                be verified before you
                can post a job on KaJob.
                Once your account is
                verified, you'll be able
                to create and publish
                jobs.
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/client/dashboard/settings"
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Verify account
                </button>
              </div>
            </div>
          </div>
        </div>

        <FeedbackModal
          isOpen={feedback.isOpen}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={closeFeedback}
        />
      </>
    );
  }

  /*
   * =========================
   * VERIFIED CLIENT
   * =========================
   *
   * Only verified clients reach
   * the actual Post Job form.
   */

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Post a job
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Tell workers what you need
              help with and find the right
              person for the job.
            </p>
          </div>

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

      {/* =========================
          FEEDBACK POPUP
          ========================= */}

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={closeFeedback}
        primaryAction={
          feedback.type === "success" &&
          createdJobId
            ? {
                label: "View job",
                onClick:
                  handleViewCreatedJob,
              }
            : undefined
        }
        secondaryAction={
          feedback.type === "success"
            ? {
                label: "Post another job",
                onClick:
                  handlePostAnotherJob,
              }
            : undefined
        }
      />
    </>
  );
};

export default PostJob;