
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PlayIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getJobById,
  getMyJobs,
  getWorkerJobDetails,
  hideJobAssignment,
  markJobComplete,
  startJob,
} from "@/api/jobs";

import type { Job, JobStatus } from "@/shared/types/job";
import ReviewModal from "@/components/reviews/ReviewModal";

import WorkStatusSidebar, {
  type WorkFilter,
  type WorkStatusType,
} from "@/components/dashboard/my-work/WorkStatusSidebar";

/* =========================================================
   TYPES
========================================================= */

type WorkStatus = WorkStatusType;
type Filter = WorkFilter;

type Work = {
  id: number;
  job: Job;
  status: WorkStatus;
  workerHasReviewedClient: boolean;
  assignmentId: number | null;
  isHiddenByWorker: boolean;
  canHideAssignment: boolean;
  canUnhideAssignment: boolean;
};

type ReviewJob = {
  jobId: number;
  clientId: number;
  clientName: string;
  jobTitle: string;
};

type JobWithClient = Job & {
  client?: {
    id: number;
    full_name?: string;
    email?: string;
    phone_number?: string;
    is_verified?: boolean;
    rating?: number;
    reviews_count?: number;
    jobs_posted?: number;
    member_since?: string;
  };
  worker_has_reviewed_client?: boolean;
};

type WorkerDetailResponse = {
  job?: Job;
  assignment_id?: number | null;
  is_hidden_by_worker?: boolean;
  can_hide_assignment?: boolean;
  can_unhide_assignment?: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

const getWorkStatus = (status: JobStatus | string): WorkStatus => {
  switch (status.toUpperCase().trim()) {
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "AWAITING_CONFIRMATION":
      return "Awaiting Confirmation";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Assigned";
  }
};

const WORK_JOB_STATUSES: JobStatus[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "AWAITING_CONFIRMATION",
  "COMPLETED",
  "CANCELLED",
];

const formatBudget = (budget: number | string): string => {
  const numericBudget = Number(budget);

  if (Number.isNaN(numericBudget)) {
    return `K${budget}`;
  }

  return `K${numericBudget.toLocaleString("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date?: string | null): string => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time?: string | null): string => {
  if (!time) return "Not specified";

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (
  duration?: number | string | null
): string => {
  if (
    duration === null ||
    duration === undefined ||
    duration === ""
  ) {
    return "Not specified";
  }

  const value = Number(duration);

  if (Number.isNaN(value)) {
    return String(duration);
  }

  return `${value} hour${value === 1 ? "" : "s"}`;
};

const mapJobToWork = (
  job: Job,
  workerHasReviewedClient = false,
  assignmentId: number | null = null,
  isHiddenByWorker = false,
  canHideAssignment = false,
  canUnhideAssignment = false
): Work => ({
  id: job.id,
  job,
  status: getWorkStatus(job.status),
  workerHasReviewedClient,
  assignmentId,
  isHiddenByWorker,
  canHideAssignment,
  canUnhideAssignment,
});

/* =========================================================
   MY WORK
========================================================= */

const MyWork = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>("All");
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<
    "start" | "complete" | "delete" | null
  >(null);

  const [actionError, setActionError] = useState<string | null>(
    null
  );
  const [actionSuccess, setActionSuccess] = useState<string | null>(
    null
  );

  const [workToDelete, setWorkToDelete] = useState<Work | null>(
    null
  );
  const [reviewJob, setReviewJob] = useState<ReviewJob | null>(
    null
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  /* =======================================================
     LOAD MY WORK
  ======================================================= */

  const loadMyWork = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyJobs();
      const jobs = response?.results ?? [];

      const workerJobs = jobs.filter((job) =>
        WORK_JOB_STATUSES.includes(job.status)
      );

      const mappedWorks = await Promise.all(
        workerJobs.map(async (job) => {
          let assignmentId: number | null = null;
          let isHiddenByWorker = false;
          let canHideAssignment = false;
          let canUnhideAssignment = false;
          let enrichedJob = job;

          try {
            const response = await getWorkerJobDetails(job.id);
            const detail = response as
              | WorkerDetailResponse
              | undefined;

            assignmentId = detail?.assignment_id ?? null;
            isHiddenByWorker = Boolean(
              detail?.is_hidden_by_worker
            );
            canHideAssignment = Boolean(
              detail?.can_hide_assignment
            );
            canUnhideAssignment = Boolean(
              detail?.can_unhide_assignment
            );

            if (detail?.job) {
              enrichedJob = detail.job;
            }
          } catch (err) {
            console.error(
              `Failed to load assignment details for job ${job.id}:`,
              err
            );
          }

          if (isHiddenByWorker) {
            return null;
          }

          if (enrichedJob.status === "COMPLETED") {
            try {
              const detailResponse = await getJobById(
                enrichedJob.id
              );
              const detailedJob = detailResponse?.job as
                | JobWithClient
                | undefined;

              return mapJobToWork(
                enrichedJob,
                Boolean(
                  detailedJob?.worker_has_reviewed_client
                ),
                assignmentId,
                isHiddenByWorker,
                canHideAssignment,
                canUnhideAssignment
              );
            } catch (err) {
              console.error(
                `Failed to load review status for job ${enrichedJob.id}:`,
                err
              );

              return mapJobToWork(
                enrichedJob,
                false,
                assignmentId,
                isHiddenByWorker,
                canHideAssignment,
                canUnhideAssignment
              );
            }
          }

          return mapJobToWork(
            enrichedJob,
            false,
            assignmentId,
            isHiddenByWorker,
            canHideAssignment,
            canUnhideAssignment
          );
        })
      );

      setWorks(
        mappedWorks.filter(
          (work): work is Work => work !== null
        )
      );
    } catch (err) {
      console.error("Failed to load my work:", err);
      setError(
        "We couldn't load your work. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyWork();
  }, []);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleViewJobDetails = (jobId: number) => {
    navigate(`/worker/dashboard/jobs/${jobId}`);
  };

  const handleGetDirections = (jobId: number) => {
    navigate(`/worker/dashboard/directions/${jobId}`);
  };

  const handleOpenRecycleBin = () => {
    navigate("/worker/dashboard/recycle-bin");
  };

  /* =======================================================
     DELETE WORK
  ======================================================= */

  const handleDeleteWork = (work: Work) => {
    if (
      work.status !== "Completed" &&
      work.status !== "Cancelled"
    ) {
      return;
    }

    if (!work.assignmentId) {
      setActionError(
        "We couldn't identify this work assignment. Please refresh the page and try again."
      );
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setWorkToDelete(work);
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;

    const work = workToDelete;

    if (!work.assignmentId) {
      setWorkToDelete(null);
      setActionError(
        "We couldn't identify this work assignment. Please refresh the page and try again."
      );
      return;
    }

    try {
      setActionLoading("delete");
      setActionError(null);
      setActionSuccess(null);

      await hideJobAssignment(work.assignmentId);

      setWorks((currentWorks) =>
        currentWorks.filter(
          (currentWork) =>
            currentWork.assignmentId !== work.assignmentId
        )
      );

      setWorkToDelete(null);
      setActionSuccess("Work was moved to the Recycle Bin.");
    } catch (err) {
      console.error("Failed to delete work:", err);
      setActionError(
        "We couldn't move this work to the Recycle Bin. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDeleteWork = () => {
    if (actionLoading === "delete") return;
    setWorkToDelete(null);
  };

  /* =======================================================
     REVIEW CLIENT
  ======================================================= */

  const handleReviewClient = async (work: Work) => {
    if (
      work.status !== "Completed" ||
      work.workerHasReviewedClient
    ) {
      return;
    }

    try {
      setActionError(null);
      setActionSuccess(null);

      const response = await getJobById(work.id);
      const detailedJob = response?.job as
        | JobWithClient
        | undefined;

      if (!detailedJob) {
        throw new Error(
          "The server did not return the completed job details."
        );
      }

      if (detailedJob.worker_has_reviewed_client) {
        setWorks((currentWorks) =>
          currentWorks.map((currentWork) =>
            currentWork.id === work.id
              ? {
                  ...currentWork,
                  workerHasReviewedClient: true,
                }
              : currentWork
          )
        );
        return;
      }

      const clientId = detailedJob.client?.id;

      if (!clientId) {
        throw new Error(
          "The server did not return the client information for this job."
        );
      }

      setReviewJob({
        jobId: detailedJob.id,
        clientId,
        clientName:
          detailedJob.client?.full_name ||
          detailedJob.client_name ||
          "Client",
        jobTitle: detailedJob.title || work.job.title,
      });

      setIsReviewModalOpen(true);
    } catch (err) {
      console.error("Failed to prepare client review:", err);

      setActionError(
        err instanceof Error
          ? err.message
          : "We couldn't load the client information. Please try again."
      );
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewJob(null);
  };

  const handleReviewSuccess = async () => {
    await loadMyWork();
    setIsReviewModalOpen(false);
    setReviewJob(null);
  };

  /* =======================================================
     START WORK
  ======================================================= */

  const handleStartWork = async (jobId: number) => {
    try {
      setActionLoading("start");
      setActionError(null);
      setActionSuccess(null);

      const response = await startJob(jobId);

      if (response?.job) {
        const updatedWork = mapJobToWork(response.job);

        setWorks((currentWorks) =>
          currentWorks.map((work) =>
            work.id === jobId
              ? {
                  ...updatedWork,
                  assignmentId: work.assignmentId,
                  isHiddenByWorker: work.isHiddenByWorker,
                  canHideAssignment: work.canHideAssignment,
                  canUnhideAssignment: work.canUnhideAssignment,
                  workerHasReviewedClient:
                    work.workerHasReviewedClient,
                }
              : work
          )
        );
      }

      setActionSuccess(
        "Work has started. The job is now in progress."
      );
    } catch (err) {
      console.error("Failed to start work:", err);
      setActionError(
        "We couldn't start this work. Please make sure you are ready to begin and try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =======================================================
     COMPLETE WORK
  ======================================================= */

  const handleMarkComplete = async (jobId: number) => {
    try {
      setActionLoading("complete");
      setActionError(null);
      setActionSuccess(null);

      const response = await markJobComplete(jobId);

      if (response?.job) {
        const updatedWork = mapJobToWork(response.job);

        setWorks((currentWorks) =>
          currentWorks.map((work) =>
            work.id === jobId
              ? {
                  ...updatedWork,
                  assignmentId: work.assignmentId,
                  isHiddenByWorker: work.isHiddenByWorker,
                  canHideAssignment: work.canHideAssignment,
                  canUnhideAssignment: work.canUnhideAssignment,
                  workerHasReviewedClient:
                    work.workerHasReviewedClient,
                }
              : work
          )
        );
      }

      setActionSuccess(
        "Work marked as complete. The client now needs to confirm the completion."
      );
    } catch (err) {
      console.error("Failed to mark work complete:", err);
      setActionError(
        "We couldn't mark this work as complete. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =======================================================
     FILTERS AND COUNTS
  ======================================================= */

  const filteredWorks = useMemo(() => {
    if (filter === "All") return works;

    return works.filter((work) => work.status === filter);
  }, [filter, works]);

  const counts = useMemo(
    () => ({
      All: works.length,
      Assigned: works.filter(
        (work) => work.status === "Assigned"
      ).length,
      "In Progress": works.filter(
        (work) => work.status === "In Progress"
      ).length,
      "Awaiting Confirmation": works.filter(
        (work) => work.status === "Awaiting Confirmation"
      ).length,
      Completed: works.filter(
        (work) => work.status === "Completed"
      ).length,
      Cancelled: works.filter(
        (work) => work.status === "Cancelled"
      ).length,
    }),
    [works]
  );

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-col lg:h-[calc(100vh-152px)]">
        {/* HEADER */}
        <div className="shrink-0 pb-5 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  My Work
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500 sm:leading-normal">
                  Manage your assigned work and track each job
                  through completion.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenRecycleBin}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
            >
              <TrashIcon className="h-5 w-5 text-emerald-600" />
              Recycle Bin
            </button>
          </div>
        </div>

        {/* ACTION FEEDBACK */}
        {(actionSuccess || actionError) && (
          <section className="mb-4 shrink-0">
            {actionSuccess && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-slate-700">
                    {actionSuccess}
                  </p>
                </div>
              </div>
            )}

            {actionError && (
              <div className="mt-2 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <XCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-slate-700">
                    {actionError}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* PAGE ERROR */}
        {error && (
          <section className="mb-4 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-700">{error}</p>
              <button
                type="button"
                onClick={loadMyWork}
                className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Try again
              </button>
            </div>
          </section>
        )}

        {/* MAIN CONTENT */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
          {/* STATUS SIDEBAR — ALWAYS VISIBLE */}
          <aside className="w-full shrink-0 lg:-mt-4 lg:w-60">
            <WorkStatusSidebar
              filter={filter}
              setFilter={setFilter}
              counts={counts}
            />
          </aside>

          {/* WORK CONTENT */}
          <main className="min-h-0 min-w-0 flex-1 overflow-visible pr-0 lg:overflow-x-hidden lg:overflow-y-auto lg:pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {loading ? (
              <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div>
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Loading your work...
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please wait while we fetch your work.
                  </p>
                </div>
              </section>
            ) : error ? (
              <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <div className="max-w-md">
                  <BriefcaseIcon className="mx-auto h-10 w-10 text-emerald-600" />
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    Unable to load your work
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={loadMyWork}
                    className="mt-5 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Try again
                  </button>
                </div>
              </section>
            ) : works.length === 0 ? (
              <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="max-w-md">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    No work yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Jobs you are assigned to will appear here. Once
                    a client accepts your application, you can
                    manage the work from this page.
                  </p>
                </div>
              </section>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {filter === "All" ? "All Work" : filter}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {filteredWorks.length}{" "}
                    {filteredWorks.length === 1 ? "job" : "jobs"}
                  </p>
                </div>

                {filteredWorks.length === 0 ? (
                  <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                    <BriefcaseIcon className="mx-auto h-10 w-10 text-emerald-600" />
                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                      No work found
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      There are no jobs matching the selected status.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFilter("All")}
                      className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Show all work
                    </button>
                  </section>
                ) : (
                  <div className="space-y-3 pb-6">
                    {filteredWorks.map((work) => (
                      <WorkCard
                        key={work.id}
                        work={work}
                        onViewJobDetails={() =>
                          handleViewJobDetails(work.id)
                        }
                        onGetDirections={() =>
                          handleGetDirections(work.id)
                        }
                        onStartWork={() =>
                          handleStartWork(work.id)
                        }
                        onMarkComplete={() =>
                          handleMarkComplete(work.id)
                        }
                        onReviewClient={() =>
                          handleReviewClient(work)
                        }
                        onDeleteWork={() =>
                          handleDeleteWork(work)
                        }
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {workToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-work-title"
          onClick={cancelDeleteWork}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <TrashIcon className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="min-w-0">
                <h2
                  id="delete-work-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Move to Recycle Bin?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Are you sure you want to move{" "}
                  <span className="font-semibold text-slate-900">
                    "{workToDelete.job.title}"
                  </span>{" "}
                  to the Recycle Bin?
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  You can restore this work later from the Recycle Bin.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDeleteWork}
                disabled={actionLoading === "delete"}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteWork}
                disabled={actionLoading === "delete"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4 text-emerald-400" />
                {actionLoading === "delete"
                  ? "Moving..."
                  : "Move to Recycle Bin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT REVIEW MODAL */}
      {reviewJob && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          jobId={reviewJob.jobId}
          revieweeId={reviewJob.clientId}
          revieweeName={reviewJob.clientName}
          revieweeRole="client"
          jobTitle={reviewJob.jobTitle}
          onClose={closeReviewModal}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
};

/* =========================================================
   WORK CARD
========================================================= */

type WorkCardProps = {
  work: Work;
  onViewJobDetails: () => void;
  onGetDirections: () => void;
  onStartWork: () => void;
  onMarkComplete: () => void;
  onReviewClient: () => void;
  onDeleteWork: () => void;
  actionLoading: "start" | "complete" | "delete" | null;
};

const WorkCard = ({
  work,
  onViewJobDetails,
  onGetDirections,
  onStartWork,
  onMarkComplete,
  onReviewClient,
  onDeleteWork,
  actionLoading,
}: WorkCardProps) => {
  const job = work.job;
  const isCancelled = work.status === "Cancelled";

  const canRateClient =
    work.status === "Completed" &&
    !work.workerHasReviewedClient;

  const canDelete =
    work.status === "Completed" ||
    work.status === "Cancelled";

  return (
    <article
      onClick={onViewJobDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewJobDetails();
        }
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:p-5"
    >
      {/* CARD HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            {isCancelled ? (
              <XCircleIcon className="h-6 w-6 text-emerald-600" />
            ) : (
              <BriefcaseIcon className="h-6 w-6 text-emerald-600" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                {job.title}
              </h3>
              <WorkStatus status={work.status} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>{job.category_name || "General Work"}</span>
              {job.posted_at && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>Posted {formatDate(job.posted_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 sm:text-right">
          <p className="text-lg font-bold text-slate-900">
            {formatBudget(job.budget)}
          </p>
          <p className="text-xs text-slate-400">Agreed Amount</p>
        </div>
      </div>

      {/* CANCELLED NOTICE */}
      {isCancelled && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                This job was cancelled
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600">
                This assignment is no longer active and has been
                moved to your cancelled work history.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DESCRIPTION */}
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {job.description || "No description provided."}
      </p>

      {/* JOB INFORMATION */}
      <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Client:{" "}
            <span className="font-medium text-slate-700">
              {job.client_name || "Client"}
            </span>
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <MapPinIcon className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate">
            {job.general_location || "Location not specified"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Date: {formatDate(job.job_date)}</span>
        </div>

        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Duration: {formatDuration(job.duration_hours)}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <WorkStatus status={work.status} />

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {work.status === "Assigned" && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onGetDirections();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <MapPinIcon className="h-4 w-4 text-emerald-600" />
                Get Directions
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewJobDetails();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BriefcaseIcon className="h-4 w-4 text-emerald-600" />
                View Details
              </button>

              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={(event) => {
                  event.stopPropagation();
                  onStartWork();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlayIcon className="h-4 w-4 text-emerald-400" />
                {actionLoading === "start"
                  ? "Starting..."
                  : "Start Work"}
              </button>
            </>
          )}

          {work.status === "In Progress" && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewJobDetails();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BriefcaseIcon className="h-4 w-4 text-emerald-600" />
                View Details
              </button>

              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkComplete();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                {actionLoading === "complete"
                  ? "Submitting..."
                  : "Mark Complete"}
              </button>
            </>
          )}

          {work.status === "Awaiting Confirmation" && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onViewJobDetails();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <BriefcaseIcon className="h-4 w-4 text-emerald-600" />
              View Details
            </button>
          )}

          {work.status === "Completed" && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewJobDetails();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BriefcaseIcon className="h-4 w-4 text-emerald-600" />
                View Details
              </button>

              {canRateClient && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onReviewClient();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                  Rate Client
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteWork();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4 text-emerald-600" />
                  {actionLoading === "delete"
                    ? "Deleting..."
                    : "Delete"}
                </button>
              )}
            </>
          )}

          {work.status === "Cancelled" && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewJobDetails();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <BriefcaseIcon className="h-4 w-4 text-emerald-600" />
                View Details
              </button>

              {canDelete && (
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteWork();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4 text-emerald-600" />
                  {actionLoading === "delete"
                    ? "Deleting..."
                    : "Delete"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
};

/* =========================================================
   WORK STATUS BADGE
========================================================= */

type WorkStatusProps = {
  status: WorkStatus;
};

const WorkStatus = ({ status }: WorkStatusProps) => {
  const Icon =
    status === "Completed"
      ? CheckCircleIcon
      : status === "Cancelled"
        ? XCircleIcon
        : status === "Assigned"
          ? PlayIcon
          : ClockIcon;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
      <Icon className="h-4 w-4 text-emerald-600" />
      {status}
    </span>
  );
};

export default MyWork;
