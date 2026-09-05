import type { Dispatch, SetStateAction } from "react";

type JobFiltersProps = {
  status: string;

  setStatus: Dispatch<
    SetStateAction<string>
  >;
};

const JobFilters = ({
  status,
  setStatus,
}: JobFiltersProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Filter by status
          </p>
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        >
          <option value="ALL">
            All jobs
          </option>

          <option value="OPEN">
            Open
          </option>

          <option value="ASSIGNED">
            Assigned
          </option>

          <option value="IN_PROGRESS">
            In progress
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>
      </div>
    </div>
  );
};

export default JobFilters;