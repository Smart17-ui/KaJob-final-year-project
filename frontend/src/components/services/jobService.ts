import type {
  CreateJobData,
  CreateJobResponse,
  MyJobsResponse,
  MyJob,
  JobReviewsResponse,
} from "../../shared/types/job";

const API_BASE_URL = "http://127.0.0.1:8000/api";

/* =========================================================
   CREATE JOB
   ========================================================= */

export const createJob = async (
  data: CreateJobData
): Promise<CreateJobResponse> => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/jobs/create/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      Object.values(result || {})[0] ||
      "Failed to create job.";

    throw new Error(String(errorMessage));
  }

  return result;
};

/* =========================================================
   GET MY JOBS
   ========================================================= */

export const getMyJobs =
  async (): Promise<MyJobsResponse> => {
    const token =
      localStorage.getItem("access_token");

    const response = await fetch(
      `${API_BASE_URL}/jobs/my-jobs/`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result?.detail ||
        result?.error ||
        "Failed to load your jobs.";

      throw new Error(String(errorMessage));
    }

    return result;
  };

/* =========================================================
   GET JOB DETAILS
   ========================================================= */

export const getJobDetails = async (
  jobId: number
): Promise<MyJob> => {
  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      "Failed to load job details.";

    throw new Error(String(errorMessage));
  }

  return result.job;
};

/* =========================================================
   GET JOB BY ID
   Returns the complete API response.
   Used when we need additional job detail information,
   such as review status.
   ========================================================= */

export const getJobById = async (
  jobId: number
) => {
  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      "Failed to load job details.";

    throw new Error(String(errorMessage));
  }

  return result;
};

/* =========================================================
   GET JOB REVIEWS
   ========================================================= */

export const getJobReviews = async (
  jobId: number
): Promise<JobReviewsResponse> => {
  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/reviews/job/${jobId}/`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      "Failed to load job reviews.";

    throw new Error(String(errorMessage));
  }

  return result;
};

/* =========================================================
   CANCEL JOB
   ========================================================= */

export const cancelJob = async (
  jobId: number
) => {
  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/cancel/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify({}),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      Object.values(result || {})[0] ||
      "Failed to cancel job.";

    throw new Error(String(errorMessage));
  }

  return result;
};

/* =========================================================
   DELETE JOB
   ========================================================= */

export const deleteJob = async (
  jobId: number
) => {
  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/delete/`,
    {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      Object.values(result || {})[0] ||
      "Failed to delete job.";

    throw new Error(String(errorMessage));
  }

  return result;
};

/* =========================================================
   CONFIRM JOB COMPLETION
   ========================================================= */

export const confirmJob = async (
  jobId: number
) => {
  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/confirm/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify({}),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.detail ||
      result?.error ||
      Object.values(result || {})[0] ||
      "Failed to confirm job completion.";

    throw new Error(String(errorMessage));
  }

  return result;
};