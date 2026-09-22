import { useEffect, useState } from "react";

import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import {
  REPORT_CATEGORY_LABELS,
  type ReportCategory,
  type ReportableJob,
} from "@/shared/types/report";

import { createReport } from "@/components/services/reportService";

/* =========================================================
   PROPS
========================================================= */

interface ComplaintFormModalProps {
  isOpen: boolean;

  /*
   * Job is required for a job-related complaint
   * but optional for a general complaint.
   */
  job?: ReportableJob | null;

  currentRole: "CLIENT" | "WORKER";

  /*
   * Determines whether the complaint is:
   *
   * JOB:
   * Related to a specific job.
   *
   * GENERAL:
   * Not related to a specific job.
   */
  complaintType: "JOB" | "GENERAL";

  onClose: () => void;

  /*
   * Called when the user clicks Done after
   * a successful submission.
   */
  onSubmitted: () => void;
}

/* =========================================================
   CATEGORY OPTIONS
========================================================= */

const categoryOptions: ReportCategory[] = [
  "THEFT",
  "VIOLENCE",
  "HARASSMENT",
  "FRAUD",
  "PROPERTY_DAMAGE",
  "NO_SHOW",
  "POOR_CONDUCT",
  "OTHER",
];

/* =========================================================
   COMPLAINT FORM MODAL
========================================================= */

export default function ComplaintFormModal({
  isOpen,
  job,
  currentRole,
  complaintType,
  onClose,
  onSubmitted,
}: ComplaintFormModalProps) {
  const [category, setCategory] =
    useState<ReportCategory | "">("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  const [referenceNumber, setReferenceNumber] =
    useState("");

  /* =========================================================
     RESET FORM WHEN MODAL OPENS
  ========================================================= */

  useEffect(() => {
    if (isOpen) {
      setCategory("");
      setDescription("");
      setError("");
      setIsSubmitting(false);
      setIsSuccess(false);
      setReferenceNumber("");
    }
  }, [isOpen]);

  /* =========================================================
     ESC KEY
  ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !isSubmitting &&
        !isSuccess
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    isSubmitting,
    isSuccess,
    onClose,
  ]);

  /* =========================================================
     DO NOT RENDER WHEN CLOSED
  ========================================================= */

  if (!isOpen) {
    return null;
  }

  /* =========================================================
     SUBMIT REPORT
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    /* -------------------------------------------------------
       JOB VALIDATION
    ------------------------------------------------------- */

    if (complaintType === "JOB" && !job) {
      setError(
        "Please select a job before submitting a job-related complaint."
      );

      return;
    }

    /* -------------------------------------------------------
       CATEGORY VALIDATION
    ------------------------------------------------------- */

    if (!category) {
      setError(
        "Please select a complaint category."
      );

      return;
    }

    /* -------------------------------------------------------
       DESCRIPTION VALIDATION
    ------------------------------------------------------- */

    const trimmedDescription =
      description.trim();

    if (!trimmedDescription) {
      setError(
        "Please describe the issue."
      );

      return;
    }

    if (trimmedDescription.length < 20) {
      setError(
        "Please provide at least 20 characters describing the issue."
      );

      return;
    }

    if (trimmedDescription.length > 2000) {
      setError(
        "The description cannot exceed 2000 characters."
      );

      return;
    }

    /* -------------------------------------------------------
       SUBMIT
    ------------------------------------------------------- */

    try {
      setIsSubmitting(true);

      let response;

      /* -----------------------------------------------------
         JOB-RELATED REPORT
      ----------------------------------------------------- */

      if (complaintType === "JOB" && job) {
        response = await createReport({
          job_id: job.id,
          category,
          description: trimmedDescription,
        });
      }

      /* -----------------------------------------------------
         GENERAL REPORT
      ----------------------------------------------------- */

      if (complaintType === "GENERAL") {
        response = await createReport({
          category,
          description: trimmedDescription,
        });
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      if (response) {
        setReferenceNumber(
          response.report.reference_number
        );

        setIsSuccess(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit report."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     HANDLE OUTSIDE CLICK
  ========================================================= */

  const handleOverlayClick = (
    event: React.MouseEvent
  ) => {
    if (
      event.target === event.currentTarget &&
      !isSubmitting &&
      !isSuccess
    ) {
      onClose();
    }
  };

  /* =========================================================
     OTHER PARTY LABEL
  ========================================================= */

  const otherPartyLabel =
    currentRole === "CLIENT"
      ? "Worker"
      : "Client";

  /* =========================================================
     MODAL TITLE
  ========================================================= */

  const modalTitle =
    complaintType === "JOB"
      ? `Report ${otherPartyLabel}`
      : "Submit a General Complaint";

  /* =========================================================
     MODAL DESCRIPTION
  ========================================================= */

  const modalDescription =
    complaintType === "JOB"
      ? "Tell us what happened with this job."
      : "Tell us about an issue that is not related to a specific job.";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={handleOverlayClick}
    >
      {/* =====================================================
          MODAL CARD
      ===================================================== */}

      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* ===================================================
            SUCCESS STATE
        =================================================== */}

        {isSuccess ? (
          <div className="px-6 py-10 text-center">
            {/* SUCCESS ICON */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircleIcon className="h-9 w-9 text-green-600" />
            </div>

            {/* SUCCESS TITLE */}

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Report submitted successfully
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Your complaint has been received and will be
              reviewed by the KaJob support team.
            </p>

            {/* REFERENCE NUMBER */}

            {referenceNumber && (
              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reference number
                </p>

                <p className="mt-1 text-base font-bold text-slate-900">
                  {referenceNumber}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Keep this reference number for future follow-up.
                </p>
              </div>
            )}

            {/* DONE BUTTON */}

            <button
              type="button"
              onClick={onSubmitted}
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2
                    id="complaint-modal-title"
                    className="text-lg font-semibold text-slate-900"
                  >
                    {modalTitle}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {modalDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close complaint form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                {/* =============================================
                    JOB DETAILS
                ============================================= */}

                {complaintType === "JOB" && job && (
                  <>
                    {/* JOB */}

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Job
                      </label>

                      <div className="mt-2 rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {job.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Job #{job.id}
                        </p>
                      </div>
                    </div>

                    {/* OTHER PARTY */}

                    <div className="mt-5">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {otherPartyLabel}
                      </label>

                      <div className="mt-2 rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {job.other_party?.full_name ||
                            `No ${otherPartyLabel.toLowerCase()} information available`}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* =============================================
                    GENERAL COMPLAINT NOTICE
                ============================================= */}

                {complaintType === "GENERAL" && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      General complaint
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      This complaint is not linked to a specific
                      job. Please provide enough detail for the
                      support team to understand and investigate
                      the issue.
                    </p>
                  </div>
                )}

                {/* =============================================
                    CATEGORY
                ============================================= */}

                <div className="mt-5">
                  <label
                    htmlFor="complaint-category"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Complaint category
                  </label>

                  <select
                    id="complaint-category"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value as
                          | ReportCategory
                          | ""
                      )
                    }
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  >
                    <option value="">
                      Select a category...
                    </option>

                    {categoryOptions.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {
                            REPORT_CATEGORY_LABELS[
                              option
                            ]
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* =============================================
                    DESCRIPTION
                ============================================= */}

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="complaint-description"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Description
                    </label>

                    <span className="text-xs text-slate-400">
                      {description.length}/2000
                    </span>
                  </div>

                  <textarea
                    id="complaint-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    rows={6}
                    maxLength={2000}
                    placeholder="Please explain what happened..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Please provide at least 20 characters.
                  </p>
                </div>

                {/* =============================================
                    ERROR
                ============================================= */}

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />

                      <p className="text-sm leading-5 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ===============================================
                  FOOTER
              =============================================== */}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}