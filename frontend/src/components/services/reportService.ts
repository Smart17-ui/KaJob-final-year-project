
import type {
  CreateReportData,
  CreateReportResponse,
  MyReportDetailResponse,
  MyReportsResponse,
  ReportableJobsResponse,
} from "../../shared/types/report";

const API_BASE_URL = "http://127.0.0.1:8000/api";

/* =========================================================
   API ERROR HELPER
   ========================================================= */

/**
 * Converts different Django REST Framework error
 * response formats into a readable error message.
 */
function getApiErrorMessage(
  result: any,
  fallbackMessage: string
): string {
  if (!result) {
    return fallbackMessage;
  }

  /* -------------------------------------------------------
     Simple error
     ------------------------------------------------------- */

  if (typeof result === "string") {
    return result;
  }

  if (typeof result.error === "string") {
    return result.error;
  }

  if (typeof result.detail === "string") {
    return result.detail;
  }

  if (typeof result.message === "string") {
    return result.message;
  }

  /* -------------------------------------------------------
     Django validation errors
     ------------------------------------------------------- */

  if (
    typeof result === "object" &&
    !Array.isArray(result)
  ) {
    const messages: string[] = [];

    Object.entries(result).forEach(
      ([field, value]) => {
        if (Array.isArray(value)) {
          value.forEach((message) => {
            if (typeof message === "string") {
              messages.push(
                `${formatFieldName(field)}: ${message}`
              );
            }
          });
        } else if (typeof value === "string") {
          messages.push(
            `${formatFieldName(field)}: ${value}`
          );
        }
      }
    );

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return fallbackMessage;
}

/* =========================================================
   FORMAT FIELD NAME
   ========================================================= */

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   GET REPORTABLE JOBS
   ========================================================= */

/**
 * GET /api/reports/reportable-jobs/
 *
 * Gets jobs that the currently authenticated
 * user is allowed to report.
 *
 * The backend determines the currently
 * selected/active role.
 *
 * WORKER:
 * - Only jobs the worker actually worked on.
 * - The worker can report the client.
 *
 * CLIENT:
 * - Only jobs posted by the client.
 * - The client can report the assigned worker.
 *
 * The frontend does not perform the security
 * filtering itself. The backend is responsible
 * for enforcing these permissions.
 */
export async function getReportableJobs(): Promise<ReportableJobsResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/reports/reportable-jobs/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  }

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}.`
      );
    }

    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        result,
        "Failed to load reportable jobs."
      )
    );
  }

  return result as ReportableJobsResponse;
}

/* =========================================================
   CREATE REPORT
   ========================================================= */

/**
 * POST /api/reports/
 *
 * Creates either:
 *
 * 1. A JOB-RELATED REPORT
 *
 * {
 *   job_id: 18,
 *   category: "POOR_CONDUCT",
 *   description: "..."
 * }
 *
 * 2. A GENERAL REPORT
 *
 * {
 *   category: "FRAUD",
 *   description: "..."
 * }
 *
 * job_id is optional.
 *
 * When job_id is not provided, the backend
 * treats the report as a general complaint.
 *
 * The backend determines the reported user
 * for job-related reports based on the
 * authenticated user's relationship with the job.
 */
export async function createReport(
  data: CreateReportData
): Promise<CreateReportResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  /*
   * Build the request body.
   *
   * For a job-related report:
   * job_id is included.
   *
   * For a general report:
   * job_id is omitted completely.
   */
  const requestBody = {
    ...(data.job_id !== undefined &&
    data.job_id !== null
      ? { job_id: data.job_id }
      : {}),
    category: data.category,
    description: data.description,
  };

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/reports/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  }

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(
        `Report submission failed with status ${response.status}.`
      );
    }

    throw new Error(
      "The server returned an invalid response."
    );
  }

  /* -------------------------------------------------------
     HANDLE BACKEND ERROR
     ------------------------------------------------------- */

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        result,
        `Failed to submit report. Server returned status ${response.status}.`
      )
    );
  }

  /* -------------------------------------------------------
     SUCCESS
     ------------------------------------------------------- */

  return result as CreateReportResponse;
}

/* =========================================================
   GET MY REPORTS
   ========================================================= */

/**
 * GET /api/reports/my/
 *
 * Gets all reports submitted by the
 * currently authenticated user.
 *
 * This can contain both:
 *
 * - Job-related reports
 * - General reports
 */
export async function getMyReports(): Promise<MyReportsResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/reports/my/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  }

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}.`
      );
    }

    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        result,
        "Failed to load your reports."
      )
    );
  }

  return result as MyReportsResponse;
}

/* =========================================================
   GET MY REPORT DETAILS
   ========================================================= */

/**
 * GET /api/reports/my/{reportId}/
 *
 * Gets the complete details of a report
 * submitted by the currently authenticated user.
 *
 * The report may be either:
 *
 * - Job-related
 * - General
 */
export async function getMyReportDetails(
  reportId: number
): Promise<MyReportDetailResponse> {
  const accessToken =
    localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error(
      "You are not authenticated. Please log in."
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/reports/my/${reportId}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  }

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}.`
      );
    }

    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        result,
        "Failed to load report details."
      )
    );
  }

  return result as MyReportDetailResponse;
}