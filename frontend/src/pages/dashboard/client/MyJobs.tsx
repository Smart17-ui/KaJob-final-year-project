import {
  BriefcaseIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import EmptyJobs from "../../../components/my-jobs/EmptyJobs";
import ClientJobCard from "../../../components/my-jobs/ClientJobCard";
import JobStatusSidebar from "../../../components/my-jobs/JobStatusSidebar";
import ConfirmationModal from "../../../components/pop/ConfirmationModal/ConfirmationModal";
import ReviewModal from "@/components/reviews/ReviewModal";

import {
  getJobById,
  getMyJobs,
  cancelJob,
  deleteJob,
  confirmJob,
} from "../../../components/services/jobService";

import type {
  MyJob,
  JobStatus,
} from "../../../shared/types/job";

type ConfirmationAction =
  | "cancel"
  | "delete"
  | "confirm"
  | null;

type JobStatusFilter =
  | "ALL"
  | JobStatus;

/* =========================================================
   CLIENT JOB WITH REVIEW STATUS
========================================================= */

type MyJobWithReviewStatus = MyJob & {
  clientHasReviewedWorker: boolean;
};

/* =========================================================
   REVIEW JOB
========================================================= */

interface ReviewJob {
  jobId: number;
  workerId: number;
  workerName: string;
  jobTitle: string;
}

/* =========================================================
   WORKER DETAIL
========================================================= */

type WorkerDetail = {
  id: number;
  full_name?: string;
  email?: string;
  phone_number?: string;
  is_verified?: boolean;
  rating?: number;
  reviews_count?: number;
  jobs_completed?: number;
  years_of_experience?: number;
  skills?: string[];
  bio?: string;
  availability_status?: string;
};

/* =========================================================
   FULL JOB DETAIL TYPE
========================================================= */

type JobWithWorker = MyJob & {
  worker?: WorkerDetail;
  worker_id?: number;
  worker_name?: string;
  client_has_reviewed_worker?: boolean;
};

/* =========================================================
   MY JOBS
========================================================= */

const MyJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] =
    useState<MyJobWithReviewStatus[]>([]);

  const [status, setStatus] =
    useState<JobStatusFilter>("ALL");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [actionError, setActionError] =
    useState("");

  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction>(null);

  const [selectedJobId, setSelectedJobId] =
    useState<number | null>(null);

  /* =======================================================
     REVIEW STATE
  ======================================================= */

  const [reviewJob, setReviewJob] =
    useState<ReviewJob | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] =
    useState(false);

  /* =======================================================
     LOAD MY JOBS
  ======================================================= */

  const loadJobs = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response =
        await getMyJobs();

      const jobsFromApi =
        response.results ?? [];

      /*
       * The My Jobs list endpoint does not contain
       * client_has_reviewed_worker.
       *
       * For completed jobs, fetch the normal job
       * detail endpoint:
       *
       * GET /api/jobs/{job_id}/
       *
       * The detail endpoint is the persistent source
       * of the client's review status.
       */
      const mappedJobs =
        await Promise.all(
          jobsFromApi.map(
            async (job) => {
              /*
               * Only completed jobs can have a
               * worker review.
               *
               * For every other status, the review
               * button must not appear anyway.
               */
              if (
                job.status !==
                "COMPLETED"
              ) {
                return {
                  ...job,
                  clientHasReviewedWorker:
                    false,
                };
              }

              try {
                /*
                 * Get the latest job details so we
                 * know whether this client already
                 * reviewed the worker.
                 */
                const detailResponse =
                  await getJobById(
                    job.id
                  );

                const detailedJob =
                  detailResponse?.job as
                    | JobWithWorker
                    | undefined;

                return {
                  ...job,
                  clientHasReviewedWorker:
                    Boolean(
                      detailedJob?.client_has_reviewed_worker
                    ),
                };
              } catch (detailError) {
                /*
                 * Keep the completed job visible even
                 * if the detail request fails.
                 *
                 * The Rate Worker button may appear
                 * in this case because we do not know
                 * the persistent review status.
                 */
                console.error(
                  `Failed to load review status for job ${job.id}:`,
                  detailError
                );

                return {
                  ...job,
                  clientHasReviewedWorker:
                    false,
                };
              }
            }
          )
        );

      setJobs(
        mappedJobs
      );
    } catch (error) {
      console.error(
        "Failed to load jobs:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(
          error.message
        );
      } else {
        setErrorMessage(
          "Failed to load your jobs."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadJobs();
  }, []);

  /* =======================================================
     STATUS COUNTS
  ======================================================= */

  const statusCounts = useMemo(() => {
    return {
      ALL: jobs.length,

      OPEN:
        jobs.filter(
          (job) =>
            job.status ===
            "OPEN"
        ).length,

      ASSIGNED:
        jobs.filter(
          (job) =>
            job.status ===
            "ASSIGNED"
        ).length,

      IN_PROGRESS:
        jobs.filter(
          (job) =>
            job.status ===
            "IN_PROGRESS"
        ).length,

      AWAITING_CONFIRMATION:
        jobs.filter(
          (job) =>
            job.status ===
            "AWAITING_CONFIRMATION"
        ).length,

      COMPLETED:
        jobs.filter(
          (job) =>
            job.status ===
            "COMPLETED"
        ).length,

      CANCELLED:
        jobs.filter(
          (job) =>
            job.status ===
            "CANCELLED"
        ).length,
    };
  }, [jobs]);

  /* =======================================================
     FILTERED JOBS
  ======================================================= */

  const filteredJobs =
    useMemo(() => {
      if (status === "ALL") {
        return jobs;
      }

      return jobs.filter(
        (job) =>
          job.status === status
      );
    }, [
      jobs,
      status,
    ]);

  /* =======================================================
     VIEW JOB
  ======================================================= */

  const handleViewJob = (
    jobId: number
  ) => {
    navigate(
      `/client/dashboard/jobs/${jobId}`
    );
  };

  /* =======================================================
     POST JOB
  ======================================================= */

  const handlePostJob = () => {
    navigate(
      "/client/dashboard/post-job"
    );
  };

  /* =======================================================
     OPEN CONFIRMATION
  ======================================================= */

  const openConfirmation = (
    action: Exclude<
      ConfirmationAction,
      null
    >,
    jobId: number
  ) => {
    setSelectedJobId(
      jobId
    );

    setConfirmationAction(
      action
    );

    setActionError("");
  };

  /* =======================================================
     CLOSE CONFIRMATION
  ======================================================= */

  const closeConfirmation = () => {
    if (
      actionLoading !== null
    ) {
      return;
    }

    setConfirmationAction(
      null
    );

    setSelectedJobId(
      null
    );
  };

  /* =======================================================
     CLOSE REVIEW MODAL
  ======================================================= */

  const closeReviewModal = () => {
    setIsReviewModalOpen(
      false
    );

    setReviewJob(
      null
    );
  };

  /* =======================================================
     RATE WORKER
  ======================================================= */

  const handleRateWorker = async (
    jobId: number
  ) => {
    /*
     * Find the job in the current local state.
     */
    const job =
      jobs.find(
        (currentJob) =>
          currentJob.id ===
          jobId
      );

    if (!job) {
      setActionError(
        "We couldn't find this job."
      );

      return;
    }

    /*
     * Only completed jobs can be reviewed.
     */
    if (
      job.status !==
      "COMPLETED"
    ) {
      return;
    }

    /*
     * Prevent the review flow from opening if
     * the client has already reviewed this worker.
     */
    if (
      job.clientHasReviewedWorker
    ) {
      return;
    }

    try {
      setActionError("");

      /*
       * Fetch the latest job information.
       *
       * This gives us:
       *
       * worker.id
       * worker.full_name
       * client_has_reviewed_worker
       */
      const response =
        await getJobById(
          jobId
        );

      const detailedJob =
        response?.job as
          | JobWithWorker
          | undefined;

      if (!detailedJob) {
        throw new Error(
          "The server did not return the completed job details."
        );
      }

      /*
       * Double-check the persistent server-side
       * review status.
       *
       * This protects against a stale My Jobs page.
       */
      if (
        detailedJob.client_has_reviewed_worker
      ) {
        setJobs(
          (currentJobs) =>
            currentJobs.map(
              (currentJob) =>
                currentJob.id ===
                jobId
                  ? {
                      ...currentJob,
                      clientHasReviewedWorker:
                        true,
                    }
                  : currentJob
            )
        );

        return;
      }

      /*
       * Get the worker ID.
       *
       * The current backend detail response returns
       * the worker as:
       *
       * worker: {
       *   id: 12,
       *   full_name: "Christopher Banda"
       * }
       *
       * Keep the older top-level fields as fallbacks
       * in case another endpoint still provides them.
       */
      const workerId =
        detailedJob.worker?.id ??
        detailedJob.worker_id ??
        job.worker_id;

      if (!workerId) {
        throw new Error(
          "The server did not return the worker information for this job."
        );
      }

      /*
       * Get the worker name.
       */
      const workerName =
        detailedJob.worker?.full_name ||
        detailedJob.worker_name ||
        job.worker_name ||
        "Worker";

      /*
       * Prepare the ReviewModal.
       */
      setReviewJob({
        jobId:
          detailedJob.id,
        workerId,
        workerName,
        jobTitle:
          detailedJob.title ||
          job.title,
      });

      setIsReviewModalOpen(
        true
      );
    } catch (error) {
      console.error(
        "Failed to prepare worker review:",
        error
      );

      setActionError(
        error instanceof Error
          ? error.message
          : "We couldn't load the worker information. Please try again."
      );
    }
  };

  /* =======================================================
     REVIEW SUCCESS
  ======================================================= */

  const handleReviewSuccess =
    async () => {
      /*
       * Reload the jobs from the backend.
       *
       * The new:
       *
       * client_has_reviewed_worker
       *
       * value will be converted into:
       *
       * clientHasReviewedWorker
       *
       * and the Rate Worker button will disappear.
       */
      await loadJobs();

      setIsReviewModalOpen(
        false
      );

      setReviewJob(
        null
      );
    };

  /* =======================================================
     CONFIRM / CANCEL / DELETE
  ======================================================= */

  const handleConfirmAction =
    async () => {
      if (
        selectedJobId === null ||
        confirmationAction === null
      ) {
        return;
      }

      const jobId =
        selectedJobId;

      const action =
        confirmationAction;

      try {
        setActionLoading(
          jobId
        );

        setActionError("");

        /* =================================================
           CANCEL
        ================================================= */

        if (
          action === "cancel"
        ) {
          await cancelJob(
            jobId
          );

          await loadJobs();

          setConfirmationAction(
            null
          );

          setSelectedJobId(
            null
          );
        }

        /* =================================================
           DELETE
        ================================================= */

        if (
          action === "delete"
        ) {
          await deleteJob(
            jobId
          );

          setJobs(
            (currentJobs) =>
              currentJobs.filter(
                (job) =>
                  job.id !==
                  jobId
              )
          );

          setConfirmationAction(
            null
          );

          setSelectedJobId(
            null
          );
        }

        /* =================================================
           CONFIRM COMPLETION
        ================================================= */

        if (
          action === "confirm"
        ) {
          /*
           * Save the job information before
           * refreshing the jobs list.
           *
           * We need the worker information
           * to open the review modal.
           */
          const jobBeingConfirmed =
            jobs.find(
              (job) =>
                job.id ===
                jobId
            );

          /*
           * Confirm the job on the backend.
           */
          await confirmJob(
            jobId
          );

          /*
           * Refresh the jobs list so the UI
           * immediately reflects COMPLETED.
           */
          await loadJobs();

          /*
           * Close the confirmation modal.
           */
          setConfirmationAction(
            null
          );

          setSelectedJobId(
            null
          );

          /*
           * Open the review modal after the
           * completion has been confirmed.
           *
           * Use the worker fields from the job
           * list when available.
           */
          if (
            jobBeingConfirmed?.worker_id &&
            jobBeingConfirmed.worker_name
          ) {
            setReviewJob({
              jobId:
                jobBeingConfirmed.id,
              workerId:
                jobBeingConfirmed.worker_id,
              workerName:
                jobBeingConfirmed.worker_name,
              jobTitle:
                jobBeingConfirmed.title,
            });

            setIsReviewModalOpen(
              true
            );
          }
        }
      } catch (error) {
        console.error(
          `Failed to ${action} job:`,
          error
        );

        if (
          error instanceof Error
        ) {
          setActionError(
            error.message
          );
        } else if (
          action === "cancel"
        ) {
          setActionError(
            "Failed to cancel the job. Please try again."
          );
        } else if (
          action === "delete"
        ) {
          setActionError(
            "Failed to delete the job. Please try again."
          );
        } else {
          setActionError(
            "Failed to confirm completion. Please try again."
          );
        }
      } finally {
        setActionLoading(
          null
        );
      }
    };

  /* =======================================================
     CONFIRMATION CONTENT
  ======================================================= */

  const confirmationContent =
    useMemo(() => {
      if (
        confirmationAction ===
        "cancel"
      ) {
        return {
          title:
            "Cancel this job?",
          message:
            "Are you sure you want to cancel this job? The job will no longer be available for the current workflow.",
          confirmLabel:
            "Cancel job",
          cancelLabel:
            "Keep job",
          variant:
            "warning" as const,
        };
      }

      if (
        confirmationAction ===
        "delete"
      ) {
        return {
          title:
            "Delete this job?",
          message:
            "This will permanently remove the job from your jobs list. This action cannot be undone.",
          confirmLabel:
            "Delete job",
          cancelLabel:
            "Keep job",
          variant:
            "danger" as const,
        };
      }

      if (
        confirmationAction ===
        "confirm"
      ) {
        return {
          title:
            "Confirm job completion?",
          message:
            "Please confirm that the worker has completed the job satisfactorily. Once confirmed, this job will be marked as completed.",
          confirmLabel:
            "Confirm completion",
          cancelLabel:
            "Not yet",
          variant:
            "warning" as const,
        };
      }

      return {
        title: "",
        message: "",
        confirmLabel:
          "Confirm",
        cancelLabel:
          "Cancel",
        variant:
          "warning" as const,
      };
    }, [
      confirmationAction,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div
        className="
          flex
          h-[calc(100vh-136px)]
          min-h-0
          flex-col
          sm:h-[calc(100vh-144px)]
          lg:h-[calc(100vh-152px)]
        "
      >
        <div className="shrink-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Jobs
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage the jobs you have posted.
              </p>
            </div>
          </div>
        </div>

        <section className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-green-600" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading your jobs...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch your jobs.
          </p>
        </section>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (errorMessage) {
    return (
      <div
        className="
          flex
          h-[calc(100vh-136px)]
          min-h-0
          flex-col
          sm:h-[calc(100vh-144px)]
          lg:h-[calc(100vh-152px)]
        "
      >
        <div className="shrink-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Jobs
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage the jobs you have posted.
              </p>
            </div>
          </div>
        </div>

        <section className="min-h-0 flex-1 rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="h-6 w-6 shrink-0 text-red-600" />

            <div className="flex-1">
              <h2 className="font-semibold text-red-800">
                Unable to load your jobs
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={
                  loadJobs
                }
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-red-700
                  shadow-sm
                  transition
                  hover:bg-red-50
                "
              >
                <ArrowPathIcon className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <div
        className="
          flex
          h-[calc(100vh-136px)]
          min-h-0
          flex-col
          sm:h-[calc(100vh-144px)]
          lg:h-[calc(100vh-152px)]
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <BriefcaseIcon className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Jobs
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage the jobs you have posted.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTION ERROR
        ================================================= */}

        {actionError && (
          <section className="mb-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-red-700">
                {actionError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setActionError("")
                }
                className="text-sm font-semibold text-red-700 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {jobs.length === 0 ? (
          <div className="min-h-0 flex-1">
            <EmptyJobs
              onPostJob={
                handlePostJob
              }
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-6">
            {/* =================================================
                STATUS SIDEBAR
            ================================================= */}

            <aside className="-mt-4 w-60 shrink-0">
              <JobStatusSidebar
                status={status}
                setStatus={setStatus}
                counts={statusCounts}
              />
            </aside>

            {/* =================================================
                JOB LIST
            ================================================= */}

            <main
              className="
                min-h-0
                min-w-0
                flex-1
                overflow-y-auto
                pr-2
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {status === "ALL"
                    ? "All Jobs"
                    : status ===
                      "OPEN"
                    ? "Open Jobs"
                    : status ===
                      "ASSIGNED"
                    ? "Assigned Jobs"
                    : status ===
                      "IN_PROGRESS"
                    ? "Jobs In Progress"
                    : status ===
                      "AWAITING_CONFIRMATION"
                    ? "Awaiting Confirmation"
                    : status ===
                      "COMPLETED"
                    ? "Completed Jobs"
                    : "Cancelled Jobs"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length ===
                  1
                    ? "job"
                    : "jobs"}
                </p>
              </div>

              {/* =================================================
                  NO FILTERED JOBS
              ================================================= */}

              {filteredJobs.length ===
              0 ? (
                <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                  <BriefcaseIcon className="mx-auto h-10 w-10 text-gray-300" />

                  <h2 className="mt-4 text-lg font-semibold text-gray-900">
                    No jobs found
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    There are no jobs matching the selected status.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setStatus(
                        "ALL"
                      )
                    }
                    className="
                      mt-5
                      rounded-xl
                      border
                      border-gray-300
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-gray-50
                    "
                  >
                    Show all jobs
                  </button>
                </section>
              ) : (
                /* =================================================
                   JOB CARDS
                ================================================= */

                <div className="space-y-3 pb-6">
                  {filteredJobs.map(
                    (job) => (
                      <ClientJobCard
                        key={
                          job.id
                        }
                        job={job}
                        onView={
                          handleViewJob
                        }
                        onCancel={
                          job.status ===
                          "ASSIGNED"
                            ? () =>
                                openConfirmation(
                                  "cancel",
                                  job.id
                                )
                            : undefined
                        }
                        onDelete={() =>
                          openConfirmation(
                            "delete",
                            job.id
                          )
                        }
                        onConfirmCompletion={() =>
                          openConfirmation(
                            "confirm",
                            job.id
                          )
                        }
                        onRate={
                          job.status ===
                            "COMPLETED" &&
                          !job.clientHasReviewedWorker
                            ? handleRateWorker
                            : undefined
                        }
                      />
                    )
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      <ConfirmationModal
        isOpen={
          confirmationAction !==
            null &&
          selectedJobId !==
            null
        }
        title={
          confirmationContent.title
        }
        message={
          confirmationContent.message
        }
        confirmLabel={
          confirmationContent.confirmLabel
        }
        cancelLabel={
          confirmationContent.cancelLabel
        }
        variant={
          confirmationContent.variant
        }
        isLoading={
          selectedJobId !== null &&
          actionLoading ===
            selectedJobId
        }
        onConfirm={
          handleConfirmAction
        }
        onCancel={
          closeConfirmation
        }
      />

      {/* =====================================================
          WORKER REVIEW MODAL
      ===================================================== */}

      {reviewJob && (
        <ReviewModal
          isOpen={
            isReviewModalOpen
          }
          jobId={
            reviewJob.jobId
          }
          revieweeId={
            reviewJob.workerId
          }
          revieweeName={
            reviewJob.workerName
          }
          revieweeRole="worker"
          jobTitle={
            reviewJob.jobTitle
          }
          onClose={
            closeReviewModal
          }
          onSuccess={
            handleReviewSuccess
          }
        />
      )}
    </>
  );
};

export default MyJobs;