import apiClient from "./client";

import type {
  CreateJobData,
  Job,
  JobsResponse,
  JobResponse,
  WorkerJobResponse,
  UpdateJobData,
} from "../shared/types/job";

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

export const getWorkerJobDetails = async (
  jobId: number
): Promise<WorkerJobResponse> => {
  return apiClient(`/jobs/${jobId}/worker/`);
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

export const deleteJob = async (
  jobId: number
): Promise<{ message: string }> => {
  return apiClient(`/jobs/${jobId}/delete/`, {
    method: "DELETE",
  });
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
// COMPLETE JOB
// POST /api/jobs/{job_id}/complete/
// ============================================

export const completeJob = async (
  jobId: number
): Promise<JobResponse> => {
  return apiClient(`/jobs/${jobId}/complete/`, {
    method: "POST",
  });
};

// ============================================
// GET MY JOBS
// GET /api/my-jobs/
// ============================================

export const getMyJobs = async (): Promise<JobsResponse> => {
  return apiClient("/my-jobs/");
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
    params.append("category", String(filters.category));
  }

  if (filters.min_budget !== undefined) {
    params.append("min_budget", String(filters.min_budget));
  }

  if (filters.max_budget !== undefined) {
    params.append("max_budget", String(filters.max_budget));
  }

  const query = params.toString();

  return apiClient(
    `/jobs/filter/${query ? `?${query}` : ""}`
  );
};