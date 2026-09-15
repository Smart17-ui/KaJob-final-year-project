export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export type WorkerProfile = {
  bio: string | null;
  hourly_rate: string | null;
  average_rating: number | null;
  jobs_completed: number;
  skills: string[];
  availability_status: string | null;
};

export type JobApplication = {
  id: number;

  job: number;
  job_title: string;

  worker: number;
  worker_name: string;

  worker_profile?: WorkerProfile | null;

  status: string;
  status_display: string;

  applied_at: string;
  updated_at?: string;
};

export type JobApplicationsResponse = {
  count: number;
  results: JobApplication[];
};

export type UpdateApplicationStatusResponse = {
  message: string;

  application: {
    id: number;
    status: string;
    status_display: string;
  };
};