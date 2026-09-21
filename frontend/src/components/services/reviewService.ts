
// src/services/reviewService.ts

const API_BASE_URL = "http://127.0.0.1:8000/api";

/* =========================================================
   TYPES
========================================================= */

export interface Review {
  id: number;
  job: number;
  job_title: string;
  reviewer?: number;
  reviewer_name: string;
  reviewee?: number;
  reviewee_name?: string;
  rating: number;
  rating_display: string;
  comment: string;
  job_completed: boolean;
  direction:
    | "CLIENT_TO_WORKER"
    | "WORKER_TO_CLIENT";
  created_at: string;
  updated_at?: string;
}

export interface RatingStats {
  average_rating: number;
  total_reviews: number;
  completed_jobs: number;
  incomplete_jobs: number;
  completion_rate: number;
  rating_distribution: {
    "0": number;
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export interface UnratedJob {
  job_id: number;
  job_title: string;
  worker_name: string;
  completed_at: string;
}

export interface CreateReviewData {
  job_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
}

/* =========================================================
   RESPONSE TYPES
========================================================= */

interface ReviewListResponse {
  count: number;
  results: Review[];
}

interface UnratedJobsResponse {
  count: number;
  message?: string;
  results: UnratedJob[];
}

interface CreateReviewResponse {
  message: string;
  review: Review;
}

/* =========================================================
   AUTHENTICATION
========================================================= */

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

/* =========================================================
   RESPONSE HANDLER
========================================================= */

const handleResponse = async <T>(
  response: Response
): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error ||
      data?.detail ||
      (typeof data === "object" && data
        ? Object.values(data).flat().join(" ")
        : null) ||
      "Something went wrong. Please try again.";

    throw new Error(errorMessage);
  }

  return data as T;
};

/* =========================================================
   CREATE REVIEW
========================================================= */

/**
 * Create a review for a completed job.
 */
export const createReview = async (
  reviewData: CreateReviewData
): Promise<CreateReviewResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/reviews/create/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    }
  );

  return handleResponse<CreateReviewResponse>(
    response
  );
};

/* =========================================================
   MY REVIEWS
========================================================= */

/**
 * Get reviews received by the currently
 * authenticated user.
 */
export const getMyReviews =
  async (): Promise<ReviewListResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/reviews/my-reviews/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<ReviewListResponse>(
      response
    );
  };

/**
 * Get reviews given by the currently
 * authenticated user.
 */
export const getMyReviewsGiven =
  async (): Promise<ReviewListResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/reviews/my-reviews-given/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<ReviewListResponse>(
      response
    );
  };

/* =========================================================
   WORKER REVIEWS
========================================================= */

/**
 * Get all reviews received by a specific worker.
 */
export const getWorkerReviews = async (
  workerId: number
): Promise<ReviewListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/reviews/worker/${workerId}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<ReviewListResponse>(
    response
  );
};

/**
 * Get rating and completion statistics
 * for a specific worker.
 */
export const getWorkerRatingStats = async (
  workerId: number
): Promise<RatingStats> => {
  const response = await fetch(
    `${API_BASE_URL}/reviews/stats/${workerId}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<RatingStats>(response);
};

/* =========================================================
   MY RATING STATS
========================================================= */

/**
 * Get rating statistics for the currently
 * authenticated user.
 */
export const getMyRatingStats =
  async (): Promise<RatingStats> => {
    const response = await fetch(
      `${API_BASE_URL}/reviews/my-stats/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<RatingStats>(response);
  };

/* =========================================================
   JOB REVIEWS
========================================================= */

/**
 * Get reviews associated with a specific job.
 */
export const getJobReviews = async (
  jobId: number
): Promise<ReviewListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/reviews/job/${jobId}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<ReviewListResponse>(
    response
  );
};

/* =========================================================
   UNRATED JOBS
========================================================= */

/**
 * Get completed jobs that the current user
 * has not reviewed yet.
 */
export const getUnratedJobs =
  async (): Promise<UnratedJobsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/reviews/unrated-jobs/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    return handleResponse<UnratedJobsResponse>(
      response
    );
  };
