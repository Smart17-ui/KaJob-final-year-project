import apiClient from "@/api/client";

/* =========================
   TYPES
========================= */

export type ClientAnalytics = {
  jobs: {
    total: number;
    open: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };

  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };

  spending: {
    total: number;
    completed: number;
    in_progress: number;
    average_per_job: number;
  };

  workers: {
    total_hired: number;
    active: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    average_rating: number;
    total_reviews: number;
  };

  top_categories: ClientTopCategory[];

  recent_activity: ClientRecentActivity[];

  summary: {
    total_jobs: number;
    completion_rate: number;
    total_applications: number;
    total_workers_hired: number;
    total_spent: number;
  };
};

export type ClientTopCategory = {
  name: string;
  count: number;
};

export type ClientRecentActivity = {
  type:
    | "job_posted"
    | "application_received"
    | "worker_assigned";

  title?: string;
  job_title?: string;
  worker_name?: string;
  status: string;
  timestamp: string;
};

export type ClientTrendItem = {
  date: string;
  jobs_posted: number;
  applications_received: number;
  jobs_completed: number;
};

export type ClientTrendsResponse = {
  period: string;
  start_date: string;
  end_date: string;
  data: ClientTrendItem[];
};

/* =========================
   API
========================= */

export const getClientAnalytics =
  async (): Promise<ClientAnalytics> => {
    return apiClient(
      "/client/"
    ) as Promise<ClientAnalytics>;
  };

export const getClientTrends =
  async (
    period: "week" | "month" | "quarter" = "month"
  ): Promise<ClientTrendsResponse> => {
    return apiClient(
      `/client/trends/?period=${period}`
    ) as Promise<ClientTrendsResponse>;
  };