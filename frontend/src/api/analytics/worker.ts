import apiClient from "@/api/client";

export type WorkerAnalytics = {
  overview: {
    total_applications: number;
    accepted_applications: number;
    acceptance_rate: number;
  };

  jobs: {
    total: number;
    active: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };

  earnings: {
    total: number;
    average_per_job: number;
    highest_paying: number;
    lowest_paying: number;
  };

  performance: {
    average_rating: number;
    total_reviews: number;
    completion_rate: number;
    positive_reviews: number;
    negative_reviews: number;
  };

  recent_jobs: WorkerRecentJob[];

  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };

  summary: {
    total_applications: number;
    total_jobs_completed: number;
    total_earnings: number;
    average_rating: number;
    total_reviews: number;
    completion_rate: number;
  };
};

export type WorkerRecentJob = {
  job_id: number;
  title: string;
  client_name: string;
  budget: number;
  status: string;
  status_display: string;
  assigned_at: string | null;
  completed_at: string | null;
};

export type WorkerJobHistoryItem = {
  job_id: number;
  title: string;
  description: string;
  category: string;
  client_name: string;
  budget: number;
  status: string;
  status_display: string;
  assigned_at: string | null;
  completed_at: string | null;
  rating: number | null;
  review_comment: string | null;
};

export type WorkerJobHistoryResponse = {
  count: number;
  results: WorkerJobHistoryItem[];
};

export type WorkerEarningsTrendItem = {
  date: string;
  earnings: number;
  jobs_completed: number;
};

export type WorkerEarningsTrendResponse = {
  period: string;
  start_date: string;
  end_date: string;
  total_earnings: number;
  data: WorkerEarningsTrendItem[];
};

export const getWorkerAnalytics =
  async (): Promise<WorkerAnalytics> => {
    return apiClient(
      "/worker/"
    ) as Promise<WorkerAnalytics>;
  };

export const getWorkerJobHistory =
  async (
    status?: string
  ): Promise<WorkerJobHistoryResponse> => {
    const endpoint = status
      ? `/worker/jobs/?status=${encodeURIComponent(
          status
        )}`
      : "/worker/jobs/";

    return apiClient(
      endpoint
    ) as Promise<WorkerJobHistoryResponse>;
  };

export const getWorkerEarningsTrend =
  async (
    period: "week" | "month" | "quarter" = "month"
  ): Promise<WorkerEarningsTrendResponse> => {
    return apiClient(
      `/worker/earnings-trend/?period=${period}`
    ) as Promise<WorkerEarningsTrendResponse>;
  };