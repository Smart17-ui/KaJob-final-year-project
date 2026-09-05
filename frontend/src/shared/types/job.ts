export type MyJob = {
  id: number;
  title: string;
  budget: string;

  client_name: string;
  category_name: string;

  general_location: string;

  status: string;
  status_display: string;

  posted_at: string;

  search_radius_km: number;

  is_urgent: boolean;
  urgency_display: string;

  job_display_date: string;

  duration_hours?: string | null;
};

export type MyJobsResponse = {
  count: number;
  results: MyJob[];
};

/**
 * Review for a specific job
 */
export type JobReview = {
  id: number;
  rating: number;
  rating_display: string;
  comment: string;
  job_completed: boolean;
  reviewer_name: string;
  created_at: string;
};

/**
 * Reviews response
 *
 * GET /api/reviews/job/{job_id}/
 */
export type JobReviewsResponse = {
  count: number;
  results: JobReview[];
};

/**
 * Cancel job response
 *
 * POST /api/jobs/{job_id}/cancel/
 */
export type CancelJobResponse = {
  message: string;

  job: {
    id: number;
    status: string;
    status_display: string;
  };
};

/**
 * Delete job response
 *
 * DELETE /api/jobs/{job_id}/delete/
 */
export type DeleteJobResponse = {
  message: string;
};

export type Timeframe =
  | "MORNING"
  | "AFTERNOON"
  | "EVENING"
  | "ANYTIME";

export type Urgency =
  | "IMMEDIATE"
  | "URGENT"
  | "NORMAL"
  | "FLEXIBLE";

export type CategoryOption = {
  id: number;
  name: string;
};

export type SkillOption = {
  id: number;
  name: string;
};

export type JobForm = {
  title: string;
  description: string;
  categoryId: string;
  budget: string;

  jobDate: string;
  jobTime: string;
  timeframe: Timeframe;
  durationHours: string;
  urgency: Urgency;
  isFlexible: boolean;

  location: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;

  requiredSkills: number[];
};

export type FormErrors = {
  title?: string;
  description?: string;
  categoryId?: string;
  budget?: string;
  jobDate?: string;
  jobTime?: string;
  durationHours?: string;
  location?: string;
};

export type CreateJobData = {
  title: string;
  description: string;
  budget: number;
  category_id: number;

  general_location?: string;
  latitude?: number;
  longitude?: number;

  job_date?: string;
  job_time?: string;

  timeframe?: Timeframe;
  is_flexible?: boolean;
  duration_hours?: number;

  urgency?: Urgency;
  required_skills?: number[];
};

export type CreateJobResponse = {
  message: string;

  job: {
    id: number;
    title: string;
    description: string;
    budget: string;

    client: number;
    client_name: string;

    category: number;
    category_name: string;

    assigned_worker_name: string | null;

    general_location: string;
    exact_location: string;

    map_url: string;
    directions_url: string;
    place_id: string;

    latitude: string;
    longitude: string;

    search_radius_km: number;

    job_date: string | null;
    job_time: string | null;

    timeframe: string;
    timeframe_display: string;

    is_flexible: boolean;
    duration_hours: string | null;

    urgency: string;
    urgency_display: string;

    job_display_date: string;
    job_display_time: string;

    is_urgent: boolean;

    status: string;
    status_display: string;

    posted_at: string;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
};