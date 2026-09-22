import type {
  JobApplication,
  JobApplicationsResponse,
  UpdateApplicationStatusResponse,
} from "../../shared/types/application";

const API_BASE_URL =
  "http://127.0.0.1:8000/api";

/*
 * =========================
 * WORKER DETAILS TYPE
 * =========================
 *
 * Response from:
 *
 * GET /api/workers/{workerId}/
 *
 * Used by the client when viewing
 * an applicant's worker profile.
 */

export type WorkerDetails = {
  id: number;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  bio: string;
  average_rating: number | string;
  total_reviews: number;
  jobs_completed: number;
  skills: string[];
  availability_status: string;
  profile_photo: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  recent_reviews: {
    rating: number;
    comment: string;
    reviewer_name: string;
    created_at: string;
  }[];
  verified: boolean;
  member_since: string | null;
};

/*
 * =========================
 * GET WORKER DETAILS
 * =========================
 *
 * GET /api/workers/{workerId}/
 *
 * Gets the complete worker profile
 * for a specific worker.
 *
 * This is used by the client when
 * viewing an applicant before deciding
 * whether to accept or reject them.
 */

export async function getWorkerDetails(
  workerId: number
): Promise<WorkerDetails> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/workers/${workerId}/`,
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
    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.detail) {
      throw new Error(result.detail);
    }

    throw new Error(
      "Failed to load worker details."
    );
  }

  return result as WorkerDetails;
}

/*
 * =========================
 * GET JOB APPLICATIONS
 * =========================
 *
 * GET /api/jobs/{jobId}/applications/
 *
 * Gets all applications submitted
 * for a specific job.
 */

export async function getJobApplications(
  jobId: number
): Promise<JobApplicationsResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/applications/`,
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
    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.detail) {
      throw new Error(result.detail);
    }

    throw new Error(
      "Failed to load job applications."
    );
  }

  return result as JobApplicationsResponse;
}

/*
 * =========================
 * GET MY APPLICATIONS
 * =========================
 *
 * GET /api/jobs/my-applications/
 *
 * Gets all applications submitted
 * by the currently authenticated worker.
 *
 * This is used by Find Jobs to determine
 * which jobs the worker has already applied for.
 */

export async function getMyApplications(): Promise<JobApplicationsResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/my-applications/`,
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
    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.detail) {
      throw new Error(result.detail);
    }

    throw new Error(
      "Failed to load your applications."
    );
  }

  return result as JobApplicationsResponse;
}

/*
 * =========================
 * APPLY FOR JOB
 * =========================
 *
 * POST /api/jobs/{jobId}/apply/
 *
 * The authenticated worker applies
 * for the selected job.
 *
 * No application data is required
 * in the request body.
 */

export async function applyForJob(
  jobId: number
): Promise<{
  message: string;
  application: JobApplication;
}> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/apply/`,
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
    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.detail) {
      throw new Error(result.detail);
    }

    throw new Error(
      "Failed to apply for this job."
    );
  }

  return result as {
    message: string;
    application: JobApplication;
  };
}

/*
 * =========================
 * WITHDRAW APPLICATION
 * =========================
 *
 * POST /api/jobs/applications/{applicationId}/withdraw/
 *
 * Allows the authenticated worker to
 * withdraw their pending application.
 */

export async function withdrawApplication(
  applicationId: number
): Promise<{
  message: string;
  application?: JobApplication;
}> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/applications/${applicationId}/withdraw/`,
    {
      method: "POST",

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
    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.detail) {
      throw new Error(result.detail);
    }

    throw new Error(
      "Failed to withdraw your application."
    );
  }

  return result as {
    message: string;
    application?: JobApplication;
  };
}

/*
 * =========================
 * UPDATE APPLICATION STATUS
 * =========================
 *
 * PATCH /api/jobs/applications/{id}/status/
 *
 * Accept or reject an application.
 *
 * status:
 * - "accept"
 * - "reject"
 */

export async function updateApplicationStatus(
  applicationId: number,
  status: "accept" | "reject"
): Promise<UpdateApplicationStatusResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/jobs/applications/${applicationId}/status/`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
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
    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.detail) {
      throw new Error(result.detail);
    }

    throw new Error(
      "Failed to update application status."
    );
  }

  return result as UpdateApplicationStatusResponse;
}