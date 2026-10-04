import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import {
  getWorkerAssignments,
  getJobById,
  unhideJobAssignment,
} from "@/api/jobs";

import type { Job } from "@/shared/types/job";

// ============================================
// TYPES
// ============================================

type DeletedWork = {
  job: Job;
  assignmentId: number;
};

// ============================================
// RECYCLE BIN PAGE
// ============================================

const RecycleBin = () => {
  const navigate = useNavigate();

  const [deletedWorks, setDeletedWorks] = useState<DeletedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // ============================================
  // LOAD DELETED WORK
  // ============================================

  const loadDeletedWorks = async () => {
    try {
      setLoading(true);
      setError("");

      // Unlike getMyJobs(), this endpoint includes
      // assignments hidden by the worker.
      const response = await getWorkerAssignments();

      const hiddenAssignments = response.results.filter(
        (assignment) =>
          assignment.is_hidden_by_worker
      );

      const deleted: DeletedWork[] = [];

      for (const assignment of hiddenAssignments) {
        try {
          const jobResponse = await getJobById(
            assignment.job
          );

          deleted.push({
            job: jobResponse.job ?? jobResponse,
            assignmentId: assignment.id,
          });
        } catch (err) {
          console.error(
            `Failed to load job ${assignment.job}:`,
            err
          );
        }
      }

      setDeletedWorks(deleted);
    } catch (err) {
      console.error(
        "Failed to load Recycle Bin:",
        err
      );

      setError(
        "We couldn't load your deleted work. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadDeletedWorks();
  }, []);

  // ============================================
  // RESTORE
  // ============================================

  const handleRestore = async (
    work: DeletedWork
  ) => {
    try {
      setRestoringId(work.assignmentId);
      setError("");

      await unhideJobAssignment(
        work.assignmentId
      );

      // Remove it from the Recycle Bin immediately.
      setDeletedWorks((current) =>
        current.filter(
          (item) =>
            item.assignmentId !==
            work.assignmentId
        )
      );
    } catch (err) {
      console.error(
        "Failed to restore work:",
        err
      );

      setError(
        "We couldn't restore this work. Please try again."
      );
    } finally {
      setRestoringId(null);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          <span>Loading Recycle Bin...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Recycle Bin
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Work you've deleted from My Work is kept here.
          </p>
        </div>

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() =>
            navigate("/worker/dashboard/my-work")
          }
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to My Work
        </button>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ========================================
          EMPTY STATE
      ======================================== */}

      {deletedWorks.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <TrashIcon className="h-8 w-8 text-gray-400" />
          </div>

          <h2 className="text-lg font-medium text-gray-900">
            Recycle Bin is empty
          </h2>

          <p className="mt-1 max-w-md text-sm text-gray-500">
            Deleted completed or cancelled work will appear
            here. You can restore it whenever you want.
          </p>
        </div>
      ) : (
        /* ========================================
           DELETED WORK LIST
        ======================================== */

        <div className="space-y-4">
          {deletedWorks.map((work) => {
            const job = work.job;

            return (
              <div
                key={work.assignmentId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* JOB INFORMATION */}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          job.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {job.status_display ??
                          job.status}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {job.description}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-500 sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-gray-700">
                          Budget:
                        </span>{" "}
                        K{job.budget}
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">
                          Location:
                        </span>{" "}
                        {job.location_display ??
                          job.general_location ??
                          "Not specified"}
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">
                          Date:
                        </span>{" "}
                        {job.job_display_date ??
                          job.job_date ??
                          "Not specified"}
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">
                          Deleted from:
                        </span>{" "}
                        My Work
                      </div>
                    </div>
                  </div>

                  {/* RESTORE BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRestore(work)
                    }
                    disabled={
                      restoringId ===
                      work.assignmentId
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 ${
                        restoringId ===
                        work.assignmentId
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    {restoringId ===
                    work.assignmentId
                      ? "Restoring..."
                      : "Restore"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecycleBin;