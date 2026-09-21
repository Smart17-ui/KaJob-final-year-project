// src/components/reviews/ReviewForm.tsx

import { FormEvent, useState } from "react";
import { CheckCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import StarRating from "./StarRating";
import { createReview } from "../services/reviewService";

interface ReviewFormProps {
  jobId: number;
  revieweeId: number;
  revieweeName: string;
  jobTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({
  jobId,
  revieweeId,
  revieweeName,
  jobTitle,
  onSuccess,
  onCancel,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (rating === 0) {
      setError("Please select a rating before submitting your review.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createReview({
        job_id: jobId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim(),
      });

      setSuccess(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex flex-col items-center text-center">
          <CheckCircleIcon className="h-12 w-12 text-emerald-600" />

          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            Review submitted
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-600">
            Thank you for reviewing {revieweeName}. Your feedback has been
            submitted successfully.
          </p>

          <button
            type="button"
            onClick={onSuccess}
            className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Leave a review
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Share your experience with {revieweeName}.
        </p>

        {jobTitle && (
          <p className="mt-2 text-sm font-medium text-slate-700">
            Job: {jobTitle}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Your rating
        </label>

        <div className="mt-3 flex items-center gap-3">
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
          />

          {rating > 0 && (
            <span className="text-sm font-medium text-slate-600">
              {rating} out of 5
            </span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-slate-700"
        >
          Comment
          <span className="ml-1 font-normal text-slate-400">
            (optional)
          </span>
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          maxLength={1000}
          placeholder={`Tell us about your experience with ${revieweeName}...`}
          className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <div className="mt-1 flex justify-end">
          <span className="text-xs text-slate-400">
            {comment.length}/1000
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-4 w-4" />
              Submit Review
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;