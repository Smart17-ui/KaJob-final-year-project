export type Urgency =
  | "IMMEDIATE"
  | "URGENT"
  | "NORMAL"
  | "FLEXIBLE";

export type JobStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED";

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

/* =========================================================
   JOB FORM
   ========================================================= */

export interface JobForm {
  title: string;
  description: string;
  categoryId: string;
  budget: string;

  jobDate: string;
  jobTime: string;
  durationHours: string;
  urgency: Urgency;

  isFlexible: boolean;

  location: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;

  requiredSkills: number[];
}

/* =========================================================
   FORM ERRORS
   ========================================================= */

export interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  budget?: string;

  jobDate?: string;
  jobTime?: string;
  durationHours?: string;
  urgency?: string;

  location?: string;

  [key: string]: string | undefined;
}

/* =========================================================
   CATEGORIES & SKILLS
   ========================================================= */

export interface JobCategory {
  id: number;
  name: string;
  description?: string;
}

export interface SkillOption {
  id: number;
  name: string;
}

/* =========================================================
   CLIENT PROFILE
   ========================================================= */

export interface JobClient {
  id: number;

  full_name: string | null;

  email: string | null;

  phone_number: string | null;

  is_verified: boolean;

  rating: number | string | null;

  reviews_count: number | null;

  jobs_posted: number | null;

  member_since: string | null;
}

/* =========================================================
   JOB
   ========================================================= */

export interface Job {
  id: number;

  title: string;

  description: string;

  budget: number | string;

  category_id?: number | null;

  category_name?: string | null;

  general_location?: string | null;

  exact_location?: string | null;

  location_display?: string | null;

  latitude?: number | string | null;

  longitude?: number | string | null;

  location_accuracy?: number | string | null;

  job_date?: string | null;

  job_time?: string | null;

  duration_hours?: number | string | null;

  timeframe?: string | null;

  timeframe_display?: string | null;

  urgency?: Urgency;

  urgency_display?: string | null;

  is_flexible?: boolean;

  required_skills?: string[];

  status: JobStatus;

  status_display?: string | null;

  /*
   * ---------------------------------------------------------
   * CLIENT
   * ---------------------------------------------------------
   *
   * The general job-details endpoint now returns both the
   * simple client fields and the complete nested client
   * profile.
   */

  client_id?: number | null;

  client_name?: string | null;

  client_email?: string | null;

  client_phone?: string | null;

  client?: JobClient | null;

  /*
   * ---------------------------------------------------------
   * WORKER
   * ---------------------------------------------------------
   */

  worker_id?: number | null;

  worker_name?: string | null;

  worker?: Worker | null;

  /*
   * ---------------------------------------------------------
   * DATES
   * ---------------------------------------------------------
   */

  posted_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  assigned_at?: string | null;

  /*
   * ---------------------------------------------------------
   * DISPLAY / STATUS HELPERS
   * ---------------------------------------------------------
   */

  is_urgent?: boolean;

  job_display_date?: string | null;

  job_display_time?: string | null;

  assignment_status?: string | null;

  application_status?: ApplicationStatus | string | null;

  /*
   * ---------------------------------------------------------
   * LOCATION / MAP
   * ---------------------------------------------------------
   */

  search_radius_km?: number | null;

  map_url?: string | null;

  directions_url?: string | null;

  place_id?: string | null;

  /*
   * ---------------------------------------------------------
   * ACCESS
   * ---------------------------------------------------------
   */

  can_view_full_details?: boolean;
}

/* =========================================================
   MY JOB
   ========================================================= */

export type MyJob = Job;

/* =========================================================
   CREATE JOB
   ========================================================= */

export interface CreateJobData {
  title: string;

  description: string;

  budget: number;

  category_id: number;

  general_location: string;

  latitude?: number | null;

  longitude?: number | null;

  job_date: string;

  job_time?: string;

  is_flexible: boolean;

  duration_hours?: number;

  urgency: Urgency;

  required_skills: number[];
}

/* =========================================================
   CREATE JOB RESPONSE
   ========================================================= */

export interface CreateJobResponse {
  message?: string;

  job: Job;
}

/* =========================================================
   UPDATE JOB
   ========================================================= */

export interface UpdateJobData {
  title?: string;

  description?: string;

  budget?: number;

  category_id?: number;

  general_location?: string;

  latitude?: number | null;

  longitude?: number | null;

  job_date?: string;

  job_time?: string;

  is_flexible?: boolean;

  duration_hours?: number;

  urgency?: Urgency;

  required_skills?: number[];
}

/* =========================================================
   JOB RESPONSE
   ========================================================= */

export interface JobResponse {
  message?: string;

  job: Job;
}

/* =========================================================
   JOBS RESPONSE
   ========================================================= */

export interface JobsResponse {
  results?: Job[];

  jobs?: Job[];

  count?: number;

  next?: string | null;

  previous?: string | null;
}

/* =========================================================
   MY JOBS RESPONSE
   ========================================================= */

export interface MyJobsResponse {
  results: MyJob[];

  count?: number;

  next?: string | null;

  previous?: string | null;
}

/* =========================================================
   JOB REVIEWS
   ========================================================= */

export interface JobReview {
  id: number;

  job_id?: number;

  reviewer_id?: number;

  reviewer_name?: string;

  rating: number;

  rating_display?: string;

  comment?: string;

  created_at?: string;
}

export interface JobReviewsResponse {
  results?: JobReview[];

  reviews?: JobReview[];

  count?: number;

  average_rating?: number;
}

/* =========================================================
   WORKER JOB RESPONSE
   ========================================================= */

export interface WorkerJobResponse {
  job: Job;

  can_view_full_details?: boolean;

  assignment_status?: string | null;

  application_status?: ApplicationStatus | null;
}

/* =========================================================
   JOB APPLICATION
   ========================================================= */

export interface JobApplication {
  id: number;

  jobId: number;

  jobTitle?: string;

  workerId?: number;

  workerName?: string;

  status: ApplicationStatus;

  statusDisplay?: string;

  appliedAt?: string;

  jobAvailable?: boolean;
}

/* =========================================================
   WORKER
   ========================================================= */

export interface Worker {
  id: number;

  full_name: string;

  email?: string;

  phone_number?: string;

  bio?: string | null;

  average_rating?: number | null;

  jobs_completed?: number | null;

  skills?: string[];

  availability_status?: string | null;
}

/* =========================================================
   CLIENT APPLICANT
   ========================================================= */

export interface ClientApplicant {
  application_id: number;

  application_status: ApplicationStatus;

  applied_at?: string;

  distance_km?: number | null;

  distance_display?: string | null;

  worker: Worker;
}

/* =========================================================
   JOB FILTERS
   ========================================================= */

export interface JobFilters {
  category?: number;

  min_budget?: number;

  max_budget?: number;

  urgency?: Urgency;
}

/* =========================================================
   JOB STATUS LABELS
   ========================================================= */

export const JOB_STATUS_LABELS: Record<
  JobStatus,
  string
> = {
  OPEN: "Open",

  ASSIGNED: "Assigned",

  IN_PROGRESS: "In Progress",

  AWAITING_CONFIRMATION: "Awaiting Confirmation",

  COMPLETED: "Completed",

  CANCELLED: "Cancelled",
};

/* =========================================================
   APPLICATION STATUS LABELS
   ========================================================= */

export const APPLICATION_STATUS_LABELS: Record<
  ApplicationStatus,
  string
> = {
  PENDING: "Pending",

  ACCEPTED: "Accepted",

  REJECTED: "Rejected",

  WITHDRAWN: "Withdrawn",
};