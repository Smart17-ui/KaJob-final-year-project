import apiClient from "./client";

import type {
  CreateJobData,
  JobResponse,
  JobsResponse,
  UpdateJobData,
  WorkerJobResponse,
} from "../shared/types/job";

// ============================================
// TYPES
// ============================================

export interface WorkerAssignment {
  id: number;
  job: number;
  job_title: string;
  worker: number;
  worker_name: string;
  assigned_by: number;
  assigned_by_name: string;
  status: string;
  status_display: string;
  assigned_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  is_hidden_by_worker: boolean;
}

export interface WorkerAssignmentsResponse {
  count: number;
  results: WorkerAssignment[];
}

// ============================================
// GET ALL OPEN JOBS
// GET /api/jobs/
// ============================================

export const getOpenJobs = async (): Promise<JobsResponse> => {
  return apiClient("/jobs/");
};

// ============================================
// GET JOB BY ID
// GET /api/jobs/{job_id}/
// ============================================

export const getJobById = async (
  jobId: number
): Promise<JobResponse> => {
  return apiClient(`/jobs/${jobId}/`);
};

// ============================================
// GET JOB DETAILS FOR WORKER
// GET /api/jobs/{job_id}/worker/
// ============================================
//
// The backend returns assignment information
// inside the "job" object.
//
// MyWork expects these fields at the top level,
// so we normalize the response here.
//
// Backend response:
// {
//   "job": {
//     ...,
//     "assignment_id": 24,
//     "is_hidden_by_worker": false,
//     "can_hide_assignment": true,
//     "can_unhide_assignment": false
//   },
//   ...
// }
//
// Normalized frontend response:
// {
//   "job": {...},
//   "assignment_id": 24,
//   "is_hidden_by_worker": false,
//   "can_hide_assignment": true,
//   "can_unhide_assignment": false
// }

export const getWorkerJobDetails = async (
  jobId: number
): Promise<WorkerJobResponse> => {
  const response = await apiClient(
    `/jobs/${jobId}/worker/`
  );

  const data = response as WorkerJobResponse;

  const job = data.job;

  return {
    ...data,

    assignment_id:
      job?.assignment_id ?? null,

    is_hidden_by_worker:
      job?.is_hidden_by_worker ?? false,

    can_hide_assignment:
      job?.can_hide_assignment ?? false,

    can_unhide_assignment:
      job?.can_unhide_assignment ?? false,
  };
};

// ============================================
// CREATE JOB
// POST /api/jobs/create/
// ============================================

export const createJob = async (
  data: CreateJobData
): Promise<JobResponse> => {
  return apiClient("/jobs/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ============================================
// UPDATE JOB
// PUT /api/jobs/{job_id}/update/
// ============================================

export const updateJob = async (
  jobId: number,
  data: UpdateJobData
): Promise<JobResponse> => {
  return apiClient(`/jobs/${jobId}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ============================================
// DELETE JOB
// DELETE /api/jobs/{job_id}/delete/
// ============================================
//
// IMPORTANT:
// This is the actual backend delete operation.
//
// Client My Jobs Recycle Bin does NOT use this.
// The frontend Delete button uses hideJob() instead.

export const deleteJob = async (
  jobId: number
): Promise<{ message: string }> => {
  return apiClient(`/jobs/${jobId}/delete/`, {
    method: "DELETE",
  });
};

// ============================================
// HIDE CLIENT JOB
// POST /api/jobs/{job_id}/hide/
// ============================================
//
// Backend calls this "hide".
// Frontend presents it as "Delete".
//
// This moves the job out of the client's normal
// My Jobs view without permanently deleting it.

export const hideJob = async (
  jobId: number
): Promise<{ message: string }> => {
  return apiClient(
    `/jobs/${jobId}/hide/`,
    {
      method: "POST",
    }
  );
};

// ============================================
// RESTORE CLIENT JOB
// POST /api/jobs/{job_id}/unhide/
// ============================================
//
// Backend calls this "unhide".
// Frontend presents this as "Restore".
//
// This makes a previously hidden job visible
// in the client's normal My Jobs view again.

export const unhideJob = async (
  jobId: number
): Promise<{ message: string }> => {
  return apiClient(
    `/jobs/${jobId}/unhide/`,
    {
      method: "POST",
    }
  );
};

// ============================================
// GET CLIENT RECYCLE BIN
// GET /api/jobs/my-hidden-jobs/
// ============================================
//
// Returns jobs hidden by the authenticated client.
// Frontend presents these as deleted jobs.

export const getMyHiddenJobs = async (): Promise<JobsResponse> => {
  return apiClient("/jobs/my-hidden-jobs/");
};

// ============================================
// CANCEL JOB
// POST /api/jobs/{job_id}/cancel/
// ============================================

export const cancelJob = async (
  jobId: number
): Promise<JobResponse> => {
  return apiClient(`/jobs/${jobId}/cancel/`, {
    method: "POST",
  });
};

// ============================================
// WORKER STARTS WORK
// POST /api/jobs/{job_id}/start/
// ============================================
//
// The worker starts the assigned job.
// The job moves from ASSIGNED to IN_PROGRESS.

export const startJob = async (
  jobId: number
): Promise<JobResponse> => {
  return apiClient(`/jobs/${jobId}/start/`, {
    method: "POST",
  });
};

// ============================================
// WORKER MARKS WORK COMPLETE
// POST /api/jobs/{job_id}/mark-complete/
// ============================================
//
// The worker tells KaJob that the work is finished.
// The job moves to AWAITING_CONFIRMATION.
// The client must then confirm completion.

export const markJobComplete = async (
  jobId: number
): Promise<JobResponse> => {
  return apiClient(`/jobs/${jobId}/mark-complete/`, {
    method: "POST",
  });
};

// ============================================
// DELETE WORKER ASSIGNMENT
// POST /api/jobs/assignments/{assignment_id}/hide/
// ============================================
//
// Backend calls this "hide".
// Frontend presents it to the worker as "Delete".
//
// This removes the assignment from the worker's
// normal My Work view without deleting the actual
// job/assignment from the backend.

export const hideJobAssignment = async (
  assignmentId: number
): Promise<{ message: string }> => {
  return apiClient(
    `/jobs/assignments/${assignmentId}/hide/`,
    {
      method: "POST",
    }
  );
};

// ============================================
// RESTORE WORKER ASSIGNMENT
// POST /api/jobs/assignments/{assignment_id}/unhide/
// ============================================
//
// Backend calls this "unhide".
// Frontend presents this as "Restore".
//
// This makes a previously deleted assignment visible
// in the worker's normal My Work view again.

export const unhideJobAssignment = async (
  assignmentId: number
): Promise<{ message: string }> => {
  return apiClient(
    `/jobs/assignments/${assignmentId}/unhide/`,
    {
      method: "POST",
    }
  );
};

// ============================================
// GET ALL WORKER ASSIGNMENTS
// GET /api/jobs/assignments/worker/
// ============================================
//
// Unlike getMyJobs(), this endpoint includes assignments
// that the worker has hidden from My Work.
//
// Recycle Bin uses this endpoint to find deleted work.

export const getWorkerAssignments =
  async (): Promise<WorkerAssignmentsResponse> => {
    return apiClient("/jobs/assignments/worker/");
  };

// ============================================
// GET MY JOBS
// GET /api/jobs/my-jobs/
// ============================================

export const getMyJobs = async (): Promise<JobsResponse> => {
  return apiClient("/jobs/my-jobs/");
};

// ============================================
// GET MY ACTIVE WORK
// GET /api/jobs/my-active-jobs/
// ============================================

export const getMyActiveJobs = async (): Promise<JobsResponse> => {
  return apiClient("/jobs/my-active-jobs/");
};

// ============================================
// SEARCH JOBS
// GET /api/jobs/search/?q=...
// ============================================

export const searchJobs = async (
  query: string
): Promise<JobsResponse> => {
  return apiClient(
    `/jobs/search/?q=${encodeURIComponent(query)}`
  );
};

// ============================================
// FILTER JOBS
// GET /api/jobs/filter/
// ============================================

export interface JobFilterParams {
  category?: number;
  min_budget?: number;
  max_budget?: number;
}

export const filterJobs = async (
  filters: JobFilterParams
): Promise<JobsResponse> => {
  const params = new URLSearchParams();

  if (filters.category !== undefined) {
    params.append(
      "category",
      String(filters.category)
    );
  }

  if (filters.min_budget !== undefined) {
    params.append(
      "min_budget",
      String(filters.min_budget)
    );
  }

  if (filters.max_budget !== undefined) {
    params.append(
      "max_budget",
      String(filters.max_budget)
    );
  }

  const query = params.toString();

  return apiClient(
    `/jobs/filter/${query ? `?${query}` : ""}`
  );
};