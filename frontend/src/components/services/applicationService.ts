import type {
  JobApplicationsResponse,
  UpdateApplicationStatusResponse,
} from "../../shared/types/application";

const API_BASE_URL =
  "http://127.0.0.1:8000/api";

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
      throw new Error(
        result.error
      );
    }

    if (result?.detail) {
      throw new Error(
        result.detail
      );
    }

    throw new Error(
      "Failed to load job applications."
    );
  }

  return result as JobApplicationsResponse;
}

/*
 * =========================
 * UPDATE APPLICATION STATUS
 * =========================
 *
 * PATCH /api/applications/{id}/status/
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
    `${API_BASE_URL}/applications/${applicationId}/status/`,
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
      throw new Error(
        result.error
      );
    }

    if (result?.detail) {
      throw new Error(
        result.detail
      );
    }

    throw new Error(
      "Failed to update application status."
    );
  }

  return result as UpdateApplicationStatusResponse;
}