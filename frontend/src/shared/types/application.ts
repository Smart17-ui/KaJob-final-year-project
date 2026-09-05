export type JobApplication = {
  id: number;
  job_title: string;
  worker_name: string;
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

export type ApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";