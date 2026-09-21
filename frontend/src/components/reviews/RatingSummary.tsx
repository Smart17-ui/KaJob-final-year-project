
// src/components/reviews/RatingSummary.tsx

import {
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import type { RatingStats } from "../services/reviewService";

interface RatingSummaryProps {
  stats: RatingStats;
  showCompletionStats?: boolean;
}

const RatingSummary = ({
  stats,
  showCompletionStats = true,
}: RatingSummaryProps) => {
  const averageRating = Number(stats.average_rating || 0);
  const totalReviews = Number(stats.total_reviews || 0);
  const completionRate = Number(stats.completion_rate || 0);

  const distribution = stats.rating_distribution || {
    "0": 0,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  const getPercentage = (count: number) => {
    if (totalReviews === 0) {
      return 0;
    }

    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        {/* Average rating */}
        <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <span className="text-4xl font-bold text-slate-900">
            {averageRating.toFixed(1)}
          </span>

          <div className="mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {totalReviews}{" "}
            {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating distribution */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              distribution[
                rating.toString() as keyof typeof distribution
              ] || 0;

            const percentage = getPercentage(count);

            return (
              <div
                key={rating}
                className="flex items-center gap-3"
              >
                <div className="flex w-10 shrink-0 items-center gap-1">
                  <span className="text-sm font-medium text-slate-600">
                    {rating}
                  </span>

                  <StarIcon className="h-4 w-4 text-amber-400" />
                </div>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-8 text-right text-xs text-slate-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showCompletionStats && (
        <div className="mt-6 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Completion rate
              </p>

              <p className="text-lg font-semibold text-slate-900">
                {completionRate.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Completed jobs
            </p>

            <p className="text-lg font-semibold text-slate-900">
              {stats.completed_jobs}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {stats.incomplete_jobs} incomplete
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingSummary;