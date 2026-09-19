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

// ============================================
// JOB FORM
// ============================================

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

// ============================================
// FORM ERRORS
// ============================================

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

// ============================================
// CATEGORY
// ============================================

export interface JobCategory {
  id: number;
  name: string;
  description?: string;
}

// ============================================
// SKILL
// ============================================

export interface SkillOption {
  id: number;
  name: string;
}

// ============================================
// JOB
// ============================================

export interface Job {
  id: number;

  title: string;
  description: string;

  budget: number | string;

  category_id?: number;
  category_name?: string;

  general_location?: string;
  exact_location?: string;

  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;

  job_date?: string | null;
  job_time?: string | null;

  duration_hours?: number | string | null;

  urgency?: Urgency;
  urgency_display?: string;

  is_flexible?: boolean;

  required_skills?: string[];

  status: JobStatus;
  status_display?: string;

  client_id?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;

  worker_id?: number | null;
  worker_name?: string | null;

  posted_at?: string;
  updated_at?: string;

  is_urgent?: boolean;

  job_display_date?: string;

  search_radius_km?: number;

  map_url?: string | null;
  directions_url?: string | null;
  place_id?: string | null;

  can_view_full_details?: boolean;
}

// ============================================
// CREATE JOB
// ============================================

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

// ============================================
// UPDATE JOB
// ============================================

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

// ============================================
// JOB RESPONSES
// ============================================

export interface JobResponse {
  message?: string;
  job: Job;
}

export interface JobsResponse {
  results?: Job[];
  jobs?: Job[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// ============================================
// WORKER JOB DETAILS
// ============================================

export interface WorkerJobResponse {
  job: Job;

  can_view_full_details: boolean;

  assignment_status?: string | null;

  application_status?: ApplicationStatus | null;
}

// ============================================
// JOB APPLICATION
// ============================================

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

// ============================================
// WORKER PROFILE
// ============================================

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

// ============================================
// CLIENT APPLICATION / APPLICANT
// ============================================

export interface ClientApplicant {
  application_id: number;

  application_status: ApplicationStatus;

  applied_at?: string;

  distance_km?: number | null;
  distance_display?: string | null;

  worker: Worker;
}

// ============================================
// FILTERS
// ============================================

export interface JobFilters {
  category?: number;
  min_budget?: number;
  max_budget?: number;
  urgency?: Urgency;
}

// ============================================
// JOB STATUS HELPERS
// ============================================

export const JOB_STATUS_LABELS: Record<
  JobStatus,
  string
> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  AWAITING_CONFIRMATION:
    "Awaiting Confirmation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const APPLICATION_STATUS_LABELS: Record<
  ApplicationStatus,
  string
> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};