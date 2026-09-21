// src/components/reviews/StarRating.tsx

import { StarIcon } from "@heroicons/react/24/solid";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
}

const StarRating = ({
  rating,
  onRatingChange,
  size = "md",
  readOnly = false,
  showValue = false,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const handleRatingChange = (value: number) => {
    if (readOnly || !onRatingChange) {
      return;
    }

    onRatingChange(value);
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        role={!readOnly ? "radiogroup" : undefined}
        aria-label={
          readOnly
            ? `Rating: ${rating} out of 5`
            : "Select a rating from 1 to 5"
        }
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= rating;

          if (readOnly) {
            return (
              <StarIcon
                key={star}
                className={`${sizeClasses[size]} ${
                  isActive ? "text-amber-400" : "text-slate-200"
                }`}
                aria-hidden="true"
              />
            );
          }

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="rounded-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              role="radio"
              aria-checked={rating === star}
            >
              <StarIcon
                className={`${sizeClasses[size]} ${
                  isActive ? "text-amber-400" : "text-slate-300"
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
