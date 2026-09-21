import { BriefcaseIcon } from "@heroicons/react/24/outline";

import JobCard from "./JobCard";

type Job = {
  id: number;
  title: string;
  description: string;
  budget: string;
  general_location: string;
  category_name: string | null;
  status: string;
  urgency: string;
  urgency_display: string;
  job_date: string | null;
  job_time?: string | null;
  is_flexible: boolean;
  duration_hours: string | null;
  posted_at: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_urgent?: boolean;
  required_skills?: string[];
};

type NearbyJob = {
  job: Job;
  distance_km: number;
  distance_display: string;
};

type JobsGridProps = {
  jobs: NearbyJob[];
  applyingJobId: number | null;
  cancellingJobId: number | null;
  appliedJobIds: Set<number>;
  radius: number;
  onViewJob: (item: NearbyJob) => void;
  onApply: (item: NearbyJob) => void;
  onCancel: (item: NearbyJob) => void;
  onSearchWider: () => void;
  canSearchWider: boolean;
};

const JobsGrid = ({
  jobs,
  applyingJobId,
  cancellingJobId,
  appliedJobIds,
  radius,
  onViewJob,
  onApply,
  onCancel,
  onSearchWider,
  canSearchWider,
}: JobsGridProps) => {
  if (jobs.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
          <BriefcaseIcon className="h-6 w-6 text-gray-500" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-gray-900">
          No jobs found nearby
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          There are no available jobs within {radius} km.
        </p>

        <button
          type="button"
          onClick={onSearchWider}
          disabled={!canSearchWider}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canSearchWider
            ? "Search a wider area"
            : "Maximum radius reached"}
        </button>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((item) => (
        <JobCard
          key={item.job.id}
          item={item}
          applying={applyingJobId === item.job.id}
          cancelling={cancellingJobId === item.job.id}
          isApplied={appliedJobIds.has(item.job.id)}
          onViewJob={onViewJob}
          onApply={onApply}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

export default JobsGrid;
