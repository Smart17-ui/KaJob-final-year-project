// src/components/reviews/ReviewCard.tsx

import { UserCircleIcon } from "@heroicons/react/24/outline";
import StarRating from "./StarRating";
import type { Review } from "../services/reviewService";

interface ReviewCardProps {
  review: Review;
  showJobTitle?: boolean;
}

const ReviewCard = ({
  review,
  showJobTitle = true,
}: ReviewCardProps) => {
  const formattedDate = new Date(review.created_at).toLocaleDateString(
    "en-ZM",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <UserCircleIcon className="h-8 w-8 text-slate-400" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {review.reviewer_name}
            </h3>

            {showJobTitle && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {review.job_title}
              </p>
            )}
          </div>
        </div>

        <span className="shrink-0 text-xs text-slate-400">
          {formattedDate}
        </span>
      </div>

      <div className="mt-4">
        <StarRating
          rating={review.rating}
          readOnly
          size="sm"
        />
      </div>

      {review.comment?.trim() && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          "{review.comment}"
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            review.job_completed
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {review.job_completed ? "Job completed" : "Job incomplete"}
        </span>
      </div>
    </article>
  );
};

export default ReviewCard;