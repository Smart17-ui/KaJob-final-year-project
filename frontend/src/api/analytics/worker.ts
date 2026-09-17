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
  };

  performance: {
    average_rating: number;
    total_reviews: number;
    completion_rate: number;
  };

  recent_jobs: WorkerRecentJob[];

  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
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

/* =========================================================
   NORMALIZATION HELPERS
   ========================================================= */

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeRecentJob = (
  job: WorkerRecentJob
): WorkerRecentJob => ({
  ...job,
  budget: toNumber(job.budget),
});

const normalizeJobHistoryItem = (
  job: WorkerJobHistoryItem
): WorkerJobHistoryItem => ({
  ...job,
  budget: toNumber(job.budget),
  rating:
    job.rating === null || job.rating === undefined
      ? null
      : toNumber(job.rating),
});

const normalizeAnalytics = (
  data: WorkerAnalytics
): WorkerAnalytics => ({
  ...data,

  overview: {
    ...data.overview,
    total_applications: toNumber(
      data.overview.total_applications
    ),
    accepted_applications: toNumber(
      data.overview.accepted_applications
    ),
    acceptance_rate: toNumber(
      data.overview.acceptance_rate
    ),
  },

  jobs: {
    ...data.jobs,
    total: toNumber(data.jobs.total),
    active: toNumber(data.jobs.active),
    in_progress: toNumber(data.jobs.in_progress),
    completed: toNumber(data.jobs.completed),
    cancelled: toNumber(data.jobs.cancelled),
  },

  earnings: {
    ...data.earnings,
    total: toNumber(data.earnings.total),
    average_per_job: toNumber(
      data.earnings.average_per_job
    ),
  },

  performance: {
    ...data.performance,
    average_rating: toNumber(
      data.performance.average_rating
    ),
    total_reviews: toNumber(
      data.performance.total_reviews
    ),
    completion_rate: toNumber(
      data.performance.completion_rate
    ),
  },

  recent_jobs: (data.recent_jobs ?? []).map(
    normalizeRecentJob
  ),

  rating_distribution: {
    1: toNumber(data.rating_distribution?.[1]),
    2: toNumber(data.rating_distribution?.[2]),
    3: toNumber(data.rating_distribution?.[3]),
    4: toNumber(data.rating_distribution?.[4]),
    5: toNumber(data.rating_distribution?.[5]),
  },
});

const normalizeJobHistoryResponse = (
  data: WorkerJobHistoryResponse
): WorkerJobHistoryResponse => ({
  ...data,
  results: (data.results ?? []).map(
    normalizeJobHistoryItem
  ),
});

const normalizeEarningsTrendResponse = (
  data: WorkerEarningsTrendResponse
): WorkerEarningsTrendResponse => ({
  ...data,

  total_earnings: toNumber(
    data.total_earnings
  ),

  data: (data.data ?? []).map((item) => ({
    ...item,
    earnings: toNumber(item.earnings),
    jobs_completed: toNumber(
      item.jobs_completed
    ),
  })),
});

/* =========================================================
   WORKER ANALYTICS
   ========================================================= */

export const getWorkerAnalytics =
  async (): Promise<WorkerAnalytics> => {
    const data = await apiClient(
      "/worker/"
    ) as WorkerAnalytics;

    return normalizeAnalytics(data);
  };

/* =========================================================
   WORKER JOB HISTORY
   ========================================================= */

export const getWorkerJobHistory =
  async (
    status?: string
  ): Promise<WorkerJobHistoryResponse> => {
    const endpoint = status
      ? `/worker/jobs/?status=${encodeURIComponent(
          status
        )}`
      : "/worker/jobs/";

    const data = await apiClient(
      endpoint
    ) as WorkerJobHistoryResponse;

    return normalizeJobHistoryResponse(data);
  };

/* =========================================================
   WORKER EARNINGS TREND
   ========================================================= */

export const getWorkerEarningsTrend =
  async (
    period: "week" | "month" | "quarter" = "month"
  ): Promise<WorkerEarningsTrendResponse> => {
    const data = await apiClient(
      `/worker/earnings-trend/?period=${period}`
    ) as WorkerEarningsTrendResponse;

    return normalizeEarningsTrendResponse(data);
  };