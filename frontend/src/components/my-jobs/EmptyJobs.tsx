import {
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

type EmptyJobsProps = {
  onPostJob: () => void;
};

const EmptyJobs = ({
  onPostJob,
}: EmptyJobsProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
        <BriefcaseIcon className="h-7 w-7 text-green-600" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        No jobs yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        You haven't posted or been assigned
        any jobs yet.
      </p>

      <button
        type="button"
        onClick={onPostJob}
        className="mt-6 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        Post a job
      </button>
    </div>
  );
};

export default EmptyJobs;