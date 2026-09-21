import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import StarRating from "./StarRating";
import { createReview } from "../services/reviewService";

interface ReviewModalProps {
  isOpen: boolean;
  jobId: number;
  workerId: number;
  workerName: string;
  jobTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReviewModal = ({
  isOpen,
  jobId,
  workerId,
  workerName,
  jobTitle,
  onClose,
  onSuccess,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
      setIsSubmitting(false);
      setErrorMessage("");
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!submitted) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [submitted, onClose, onSuccess]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    setErrorMessage("");

    if (rating === 0) {
      setErrorMessage(
        "Please select a rating before submitting."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createReview({
        job_id: jobId,
        reviewee_id: workerId,
        rating,
        comment: comment.trim(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Failed to submit review:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Failed to submit your review. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        className="
          relative
          w-full
          max-w-[440px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <StarIcon className="h-4 w-4 text-emerald-600" />
              </div>

              <h2
                id="review-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                Rate your experience
              </h2>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Your feedback helps build trust on KaJob.
            </p>
          </div>

          {!submitted && (
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="
                -mr-1
                -mt-1
                rounded-lg
                p-1.5
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="Close review"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {submitted ? (
          /* Success */
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Thank you!
            </h3>

            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-5 text-slate-500">
              Your review has been submitted successfully.
              Thanks for helping make KaJob a trusted community.
            </p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="px-5 py-5">
              {/* Job summary */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    Completed job
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                    {jobTitle || "Job"}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    Completed by{" "}
                    <span className="font-medium text-slate-700">
                      {workerName}
                    </span>
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mt-5 text-center">
                <h3 className="text-sm font-semibold text-slate-900">
                  How was your experience?
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Rate the work completed by {workerName}.
                </p>

                <div className="mt-3 flex justify-center">
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                  />
                </div>

                <div className="mt-2 h-5">
                  {rating > 0 && (
                    <p className="text-xs font-semibold text-amber-600">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Below average"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="review-modal-comment"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Additional feedback
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    {comment.length}/1000
                  </span>
                </div>

                <textarea
                  id="review-modal-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  rows={3}
                  maxLength={1000}
                  placeholder="Tell us briefly about your experience..."
                  className="
                    mt-1.5
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3.5
                    py-2.5
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div
                  role="alert"
                  className="
                    mt-3
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-3.5
                    py-2.5
                    text-xs
                    text-red-700
                  "
                >
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="
                  rounded-lg
                  px-3.5
                  py-2
                  text-xs
                  font-semibold
                  text-slate-500
                  transition
                  hover:bg-slate-200
                  hover:text-slate-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  rating === 0
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-emerald-600
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-emerald-700
                  hover:shadow
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
