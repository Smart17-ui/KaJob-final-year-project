import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { getWorkerJobDetails } from "@/api/jobs";
import {
  getMyApplications,
} from "@/components/services/applicationService";
import type {
  JobApplication,
} from "@/shared/types/application";

import ApplicationStatusSidebar from "@/components/my-applications/ApplicationStatusSidebar";
import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";

// ============================================
// TYPES
// ============================================

type ApplicationStatus =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

type FeedbackType =
  | "success"
  | "error"
  | "info";

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobAvailable: boolean;
}

interface FeedbackState {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
}

// ============================================
// HELPERS
// ============================================

const getApplicationStatus = (
  status: string
): ApplicationStatus => {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "ACCEPTED") {
    return "ACCEPTED";
  }

  if (normalizedStatus === "REJECTED") {
    return "REJECTED";
  }

  return "PENDING";
};

const formatDate = (date?: string): string => {
  if (!date) {
    return "Date not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString(
    "en-ZM",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const getStatusClasses = (
  status: ApplicationStatus
): string => {
  switch (status) {
    case "ACCEPTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
};

const getStatusIndicator = (
  status: ApplicationStatus
): string => {
  switch (status) {
    case "ACCEPTED":
      return "✓";

    case "REJECTED":
      return "×";

    case "PENDING":
      return "•";

    default:
      return "•";
  }
};

// ============================================
// COMPONENT
// ============================================

const MyApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [filter, setFilter] =
    useState<ApplicationStatus>("ALL");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [applicationToCancel, setApplicationToCancel] =
    useState<Application | null>(null);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [feedback, setFeedback] =
    useState<FeedbackState>({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
    });

  // ============================================
  // LOAD APPLICATIONS
  // ============================================

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await getMyApplications();

      const results = response?.results ?? [];

      const mappedApplications =
        await Promise.all(
          results.map(
            async (
              application: JobApplication
            ): Promise<Application> => {
              const status =
                getApplicationStatus(
                  String(application.status ?? "")
                );

              let jobAvailable = true;

              try {
                await getWorkerJobDetails(
                  Number(application.job)
                );
              } catch {
                jobAvailable = false;
              }

              return {
                id: Number(application.id),
                jobId: Number(application.job),
                jobTitle:
                  application.job_title ||
                  "Untitled Job",
                status,
                appliedAt:
                  application.applied_at,
                jobAvailable,
              };
            }
          )
        );

      mappedApplications.sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() -
          new Date(a.appliedAt).getTime()
      );

      setApplications(mappedApplications);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load your applications."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // ============================================
  // FILTERED APPLICATIONS
  // ============================================

  const filteredApplications = useMemo(() => {
    if (filter === "ALL") {
      return applications;
    }

    return applications.filter(
      (application) =>
        application.status === filter
    );
  }, [applications, filter]);

  // ============================================
  // APPLICATION COUNTS
  // ============================================

  const counts = useMemo(
    () => ({
      ALL: applications.length,

      PENDING: applications.filter(
        (application) =>
          application.status === "PENDING"
      ).length,

      ACCEPTED: applications.filter(
        (application) =>
          application.status === "ACCEPTED"
      ).length,

      REJECTED: applications.filter(
        (application) =>
          application.status === "REJECTED"
      ).length,
    }),
    [applications]
  );

  // ============================================
  // VIEW APPLICATION
  // ============================================

  const handleViewApplication = (
    applicationId: number
  ) => {
    navigate(
      `/worker/dashboard/applications/${applicationId}`
    );
  };

  // ============================================
  // CANCEL APPLICATION
  // ============================================

  const handleCancelApplication = async () => {
    if (!applicationToCancel) {
      return;
    }

    try {
      setIsCancelling(true);

      /*
       * There is currently no cancel-application
       * endpoint in applicationService.ts.
       *
       * This will be connected once the backend
       * endpoint is implemented.
       */

      console.log(
        "Cancel application:",
        applicationToCancel.id
      );

      setApplicationToCancel(null);

      setFeedback({
        isOpen: true,
        type: "info",
        title: "Coming Soon",
        message:
          "Application cancellation will be available once the backend endpoint is added.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // ============================================
  // CLOSE FEEDBACK
  // ============================================

  const handleCloseFeedback = () => {
    setFeedback((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <div
        className="
          flex
          h-[calc(100vh-136px)]
          min-h-0
          min-w-0
          flex-col
          sm:h-[calc(100vh-144px)]
          lg:h-[calc(100vh-152px)]
        "
      >
        {/* ========================================
            HEADER
        ======================================== */}

        <section className="shrink-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <span className="text-lg font-bold text-emerald-600">
                A
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Applications
              </h1>

              <p className="mt-0.5 text-sm text-gray-500">
                Track the jobs you've applied for.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================
            CONTENT
        ======================================== */}

        {isLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading your applications...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600">
                !
              </div>

              <h2 className="mt-3 text-lg font-semibold text-gray-900">
                Unable to load applications
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadApplications}
                className="
                  mt-5
                  rounded-xl
                  bg-gray-900
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 gap-6">
            {/* ====================================
                SIDEBAR
            ==================================== */}

            <aside className="-mt-4 w-60 shrink-0">
              <ApplicationStatusSidebar
                status={filter}
                setStatus={setFilter}
                counts={counts}
              />
            </aside>

            {/* ====================================
                APPLICATION LIST
            ==================================== */}

            <main
              className="
                min-h-0
                min-w-0
                flex-1
                overflow-y-auto
                overflow-x-hidden
                pr-2
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {filteredApplications.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white">
                  <div className="max-w-sm px-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                      <span className="text-lg font-bold text-gray-400">
                        A
                      </span>
                    </div>

                    <h2 className="mt-4 text-base font-semibold text-gray-900">
                      No applications found
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      {filter === "ALL"
                        ? "You haven't applied for any jobs yet."
                        : `You don't have any ${filter.toLowerCase()} applications.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map(
                    (application) => (
                      <article
                        key={application.id}
                        className="
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-5
                          shadow-sm
                          transition
                          hover:border-gray-300
                          hover:shadow-md
                        "
                      >
                        {/* TOP */}

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-base font-semibold text-gray-900">
                                {application.jobTitle}
                              </h2>

                              <span
                                className={`
                                  inline-flex
                                  shrink-0
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  border
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-semibold
                                  ${getStatusClasses(
                                    application.status
                                  )}
                                `}
                              >
                                <span className="text-sm leading-none">
                                  {getStatusIndicator(
                                    application.status
                                  )}
                                </span>

                                {application.status}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                              Applied{" "}
                              {formatDate(
                                application.appliedAt
                              )}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                            #{application.id}
                          </span>
                        </div>

                        {/* STATUS MESSAGE */}

                        {application.status ===
                          "ACCEPTED" && (
                          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <p className="text-sm font-medium text-emerald-800">
                              Your application was accepted.
                            </p>

                            <p className="mt-0.5 text-xs text-emerald-700">
                              Check My Work for
                              the next steps.
                            </p>
                          </div>
                        )}

                        {application.status ===
                          "REJECTED" && (
                          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-800">
                              This application was not accepted.
                            </p>
                          </div>
                        )}

                        {application.status ===
                          "PENDING" && (
                          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                            <p className="text-sm font-medium text-amber-800">
                              Your application is waiting for the client to respond.
                            </p>
                          </div>
                        )}

                        {/* FOOTER */}

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span
                              className={
                                application.jobAvailable
                                  ? "font-semibold text-emerald-600"
                                  : "font-semibold text-gray-400"
                              }
                            >
                              {application.jobAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>

                            <span>
                              Job details
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {application.status ===
                              "PENDING" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setApplicationToCancel(
                                    application
                                  )
                                }
                                className="
                                  rounded-xl
                                  border
                                  border-gray-200
                                  px-3.5
                                  py-2
                                  text-sm
                                  font-medium
                                  text-gray-600
                                  transition
                                  hover:border-red-200
                                  hover:bg-red-50
                                  hover:text-red-600
                                "
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleViewApplication(
                                  application.id
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-gray-900
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-gray-800
                              "
                            >
                              <span>→</span>
                              View Application
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ==========================================
          CANCEL CONFIRMATION
      ========================================== */}

      {applicationToCancel && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-xl
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg font-bold text-amber-600">
                !
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Cancel this application?
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  You are about to cancel your
                  application for{" "}
                  <span className="font-semibold text-gray-900">
                    {applicationToCancel.jobTitle}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() =>
                  setApplicationToCancel(null)
                }
                className="
                  rounded-xl
                  border
                  border-gray-200
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                Keep Application
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelApplication}
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isCancelling
                  ? "Cancelling..."
                  : "Cancel Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          FEEDBACK MODAL
      ========================================== */}

      <FeedbackModal
        isOpen={feedback.isOpen}
        onClose={handleCloseFeedback}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />
    </>
  );
};

export default MyApplications;