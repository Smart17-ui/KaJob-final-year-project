export type JobStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED";

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

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | null;

export type AssignmentStatus =
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | null;

export interface Job {
  id: number;
  title: string;
  description?: string;
  budget: string | number;

  client?: number;
  client_name: string | null;

  category?: number;
  category_name: string | null;

  assigned_worker_name?: string | null;

  general_location: string;
  exact_location?: string | null;

  latitude?: number | string | null;
  longitude?: number | string | null;

  map_url?: string | null;
  directions_url?: string | null;
  place_id?: string | null;

  search_radius_km?: number;

  job_date?: string | null;
  job_time?: string | null;

  timeframe?: Timeframe;
  timeframe_display?: string;

  is_flexible?: boolean;

  duration_hours?: number | string | null;

  urgency?: Urgency;
  urgency_display?: string;

  job_display_date?: string;
  job_display_time?: string;

  is_urgent?: boolean;

  status: JobStatus;
  status_display?: string;

  posted_at: string;
  completed_at?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface JobsResponse {
  count: number;
  results: Job[];
}

export interface JobResponse {
  job: Job;
}

export interface WorkerJobResponse {
  job: WorkerJob;
  can_view_full_details: boolean;
  assignment_status: AssignmentStatus;
  application_status: ApplicationStatus;
}

export interface WorkerJob extends Job {
  client_name: string | null;
  client_phone: string | null;

  exact_location: string | null;
  map_url: string | null;
  directions_url: string | null;
  place_id: string | null;

  location_display: string;

  can_view_full_details: boolean;

  assignment_status: AssignmentStatus;
  application_status: ApplicationStatus;

  assigned_at: string | null;
}

export interface CreateJobData {
  title: string;
  description: string;
  budget: number;
  category_id: number;

  general_location?: string;
  exact_location?: string;

  latitude?: number | null;
  longitude?: number | null;

  place_id?: string;

  job_date?: string | null;
  job_time?: string | null;

  timeframe?: Timeframe;
  is_flexible?: boolean;

  duration_hours?: number | null;

  urgency?: Urgency;

  required_skills?: number[];
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  budget?: number;

  general_location?: string;
  exact_location?: string;

  latitude?: number | null;
  longitude?: number | null;

  job_date?: string | null;
  job_time?: string | null;

  timeframe?: Timeframe;
  is_flexible?: boolean;

  duration_hours?: number | null;

  urgency?: Urgency;

  required_skills?: number[];
}