import type {
  CreateJobData,
  CreateJobResponse,
  MyJobsResponse,
  MyJob,
  JobReviewsResponse,
} from "../../shared/types/job";

const API_BASE_URL =
  "http://127.0.0.1:8000/api";

/**
 * Create a new job
 *
 * POST /api/jobs/create/
 */
export async function createJob(
  data: CreateJobData
): Promise<CreateJobResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/create/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(data),
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    if (result?.detail) {
      throw new Error(result.detail);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    if (
      result &&
      typeof result === "object"
    ) {
      const firstError =
        Object.values(result)[0];

      if (Array.isArray(firstError)) {
        throw new Error(
          String(firstError[0])
        );
      }

      if (
        typeof firstError === "string"
      ) {
        throw new Error(firstError);
      }
    }

    throw new Error(
      "Failed to create job. Please try again."
    );
  }

  return result as CreateJobResponse;
}

/**
 * Get jobs posted by the current user
 *
 * GET /api/my-jobs/
 */
export async function getMyJobs(): Promise<MyJobsResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/my-jobs/`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    if (result?.detail) {
      throw new Error(result.detail);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    if (
      result &&
      typeof result === "object"
    ) {
      const firstError =
        Object.values(result)[0];

      if (Array.isArray(firstError)) {
        throw new Error(
          String(firstError[0])
        );
      }

      if (
        typeof firstError === "string"
      ) {
        throw new Error(firstError);
      }
    }

    throw new Error(
      "Failed to load your jobs."
    );
  }

  return result as MyJobsResponse;
}

/**
 * Get details for a specific job
 *
 * GET /api/jobs/{job_id}/
 *
 * The API returns:
 *
 * {
 *   "job": {
 *     ...
 *   }
 * }
 */
export async function getJobDetails(
  jobId: number
): Promise<MyJob> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    if (result?.detail) {
      throw new Error(result.detail);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    if (
      result &&
      typeof result === "object"
    ) {
      const firstError =
        Object.values(result)[0];

      if (Array.isArray(firstError)) {
        throw new Error(
          String(firstError[0])
        );
      }

      if (
        typeof firstError === "string"
      ) {
        throw new Error(firstError);
      }
    }

    throw new Error(
      "Failed to load job details."
    );
  }

  /*
   * The backend wraps the job inside
   * a "job" property.
   *
   * Backend:
   *
   * {
   *   "job": {
   *     "id": 6,
   *     "status": "OPEN",
   *     "status_display": "Open"
   *   }
   * }
   *
   * We return result.job so that
   * JobDetails.tsx receives:
   *
   * {
   *   id: 6,
   *   status: "OPEN",
   *   status_display: "Open"
   * }
   */
  return result.job as MyJob;
}

/**
 * Get reviews for a specific job
 *
 * GET /api/reviews/job/{job_id}/
 */
export async function getJobReviews(
  jobId: number
): Promise<JobReviewsResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/reviews/job/${jobId}/`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    if (result?.detail) {
      throw new Error(result.detail);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    if (
      result &&
      typeof result === "object"
    ) {
      const firstError =
        Object.values(result)[0];

      if (Array.isArray(firstError)) {
        throw new Error(
          String(firstError[0])
        );
      }

      if (
        typeof firstError === "string"
      ) {
        throw new Error(firstError);
      }
    }

    throw new Error(
      "Failed to load job reviews."
    );
  }

  return result as JobReviewsResponse;
}

/**
 * Cancel a job
 *
 * POST /api/jobs/{job_id}/cancel/
 */
export async function cancelJob(
  jobId: number
): Promise<{
  message: string;
  job: {
    id: number;
    status: string;
    status_display: string;
  };
}> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/cancel/`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({}),
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    if (result?.detail) {
      throw new Error(result.detail);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    if (
      result &&
      typeof result === "object"
    ) {
      const firstError =
        Object.values(result)[0];

      if (Array.isArray(firstError)) {
        throw new Error(
          String(firstError[0])
        );
      }

      if (
        typeof firstError === "string"
      ) {
        throw new Error(firstError);
      }
    }

    throw new Error(
      "Failed to cancel the job."
    );
  }

  return result;
}

/**
 * Delete a job
 *
 * DELETE /api/jobs/{job_id}/delete/
 *
 * This performs a soft delete.
 */
export async function deleteJob(
  jobId: number
): Promise<{
  message: string;
}> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/delete/`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    if (result?.detail) {
      throw new Error(result.detail);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    if (
      result &&
      typeof result === "object"
    ) {
      const firstError =
        Object.values(result)[0];

      if (Array.isArray(firstError)) {
        throw new Error(
          String(firstError[0])
        );
      }

      if (
        typeof firstError === "string"
      ) {
        throw new Error(firstError);
      }
    }

    throw new Error(
      "Failed to delete the job."
    );
  }

  return result;
}