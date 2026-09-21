import {
  useState,
  type FormEvent,
} from "react";

import PostJobLayout from "./PostJobLayout";

import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";

import { createJob } from "@/components/services/jobService.js";

import { getCurrentUser } from "@/shared/auth";

import type {
  CreateJobData,
  FormErrors,
  JobCategory,
  JobForm,
  SkillOption,
} from "@/shared/types/job";

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
  const user = getCurrentUser();

  const isAuthenticated = Boolean(user);
  const isVerified = user?.is_verified === true;

  const [form, setForm] =
    useState<JobForm>(initialForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [feedback, setFeedback] =
    useState<FeedbackState>({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
    });

  const categories: JobCategory[] = [
    {
      id: 1,
      name: "111",
    },
  ];

  const skills: SkillOption[] = [];

  /* =========================================================
     FORM HELPERS
  ========================================================= */

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

  function updateSkills(
    skillIds: number[]
  ) {
    setForm((current) => ({
      ...current,
      requiredSkills: skillIds,
    }));

    setErrors((current) => ({
      ...current,
      requiredSkills: undefined,
    }));

    closeFeedback();
  }

  function updateFlexible(
    value: boolean
  ) {
    setForm((current) => ({
      ...current,
      isFlexible: value,
    }));

    closeFeedback();
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

    closeFeedback();
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

    closeFeedback();
  }

  /* =========================================================
     FEEDBACK
  ========================================================= */

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

  /* =========================================================
     VALIDATION
  ========================================================= */

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

    /* =======================================================
       BUDGET
    ======================================================= */

    if (!form.budget.trim()) {
      nextErrors.budget =
        "Budget is required.";
    } else {
      const budget = Number(form.budget);

      if (
        Number.isNaN(budget) ||
        budget <= 0
      ) {
        nextErrors.budget =
          "Budget must be greater than 0.";
      } else {
        const digitCount =
          form.budget.replace(
            /\D/g,
            ""
          ).length;

        if (digitCount > 10) {
          nextErrors.budget =
            "Budget cannot contain more than 10 digits.";
        }
      }
    }

    /* =======================================================
       DATE
    ======================================================= */

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

    /* =======================================================
       DURATION
    ======================================================= */

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

    /* =======================================================
       LOCATION
    ======================================================= */

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

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    closeFeedback();

    if (!isAuthenticated) {
      showFeedback(
        "warning",
        "Login required",
        "You need to be logged in before you can post a job."
      );

      return;
    }

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
      const payload: CreateJobData = {
        title: form.title.trim(),
        description: form.description.trim(),
        budget: Number(form.budget),

        category_id: Number(
          form.categoryId
        ),

        general_location:
          form.location.trim(),

        /*
         * Round coordinates to 6 decimal places
         * before sending them to the backend.
         *
         * This prevents JavaScript floating-point
         * values such as:
         *
         * -15.414486999999998
         *
         * from being sent to Django.
         */
        latitude:
          form.latitude !== null
            ? Number(
                form.latitude.toFixed(6)
              )
            : null,

        longitude:
          form.longitude !== null
            ? Number(
                form.longitude.toFixed(6)
              )
            : null,

        job_date: form.jobDate,

        job_time: form.jobTime
          ? `${form.jobTime}:00`
          : undefined,

        is_flexible: form.isFlexible,

        duration_hours:
          form.durationHours
            ? Number(form.durationHours)
            : undefined,

        urgency: form.urgency,

        required_skills:
          form.requiredSkills,
      };

      const result =
        await createJob(payload);

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

  /* =========================================================
     AUTH GUARDS
  ========================================================= */

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">
          You need to be logged in to post a job.
        </p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">
          Verify your account before posting a job.
        </p>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      <form
        id="post-job-form"
        onSubmit={handleSubmit}
      >
        <PostJobLayout
          form={form}
          errors={errors}
          categories={categories}
          skills={skills}
          isSubmitting={isSubmitting}
          onChange={updateField}
          onFlexibleChange={updateFlexible}
          onSkillsChange={updateSkills}
          onLocationChange={updateLocation}
          onAddressChange={updateAddress}
        />
      </form>

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={closeFeedback}
      />
    </>
  );
};

export default PostJob;