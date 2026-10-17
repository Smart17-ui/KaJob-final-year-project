
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { getWorkerJobDetails } from "@/api/jobs";
import {
  getMyApplications,
  withdrawApplication,
} from "@/components/services/applicationService";
import type { JobApplication } from "@/shared/types/application";

import Avatar from "@/components/shared/Avatar";
import ApplicationStatusSidebar from "@/components/my-applications/ApplicationStatusSidebar";
import FeedbackModal from "@/components/pop/FeedbackModal/FeedbackModal";

type ApplicationStatus =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

type FeedbackType = "success" | "error" | "info";

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobAvailable: boolean;
  clientName?: string | null;
  clientPhotoUrl?: string | null;
}

interface FeedbackState {
  isOpen: boolean;
  type: FeedbackType;
  title: string;
  message: string;
}

const getApplicationStatus = (
  status: string
): ApplicationStatus => {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "ACCEPTED") return "ACCEPTED";
  if (normalizedStatus === "REJECTED") return "REJECTED";

  if (
    normalizedStatus === "WITHDRAWN" ||
    normalizedStatus === "CANCELLED" ||
    normalizedStatus === "CANCELED"
  ) {
    return "WITHDRAWN";
  }

  return "PENDING";
};

const formatDate = (date?: string): string => {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-ZM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (
  _status: ApplicationStatus
): string => {
  return "border-slate-200 bg-slate-50 text-slate-700";
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
    case "WITHDRAWN":
      return "↩";
    default:
      return "•";
  }
};

const MyApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<
    Application[]
  >([]);

  const [filter, setFilter] =
    useState<ApplicationStatus>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [applicationToCancel, setApplicationToCancel] =
    useState<Application | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await getMyApplications();
      const results = response?.results ?? [];

      const mappedApplications = await Promise.all(
        results.map(
          async (
            application: JobApplication
          ): Promise<Application> => {
            const status = getApplicationStatus(
              String(application.status ?? "")
            );

            let jobAvailable = true;
            let clientName: string | null = null;
            let clientPhotoUrl: string | null = null;

            try {
              const jobDetails = await getWorkerJobDetails(
                Number(application.job)
              );

              const job: any =
                (jobDetails as any)?.job ?? jobDetails;

              clientName =
                job?.client_name ??
                job?.client?.full_name ??
                null;

              clientPhotoUrl =
                job?.client_photo_url ??
                job?.client?.profile_photo_url ??
                null;
            } catch {
              jobAvailable = false;
            }

            return {
              id: Number(application.id),
              jobId: Number(application.job),
              jobTitle:
                application.job_title || "Untitled Job",
              status,
              appliedAt: application.applied_at,
              jobAvailable,
              clientName,
              clientPhotoUrl,
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

  const filteredApplications = useMemo(() => {
    if (filter === "ALL") return applications;

    return applications.filter(
      (application) => application.status === filter
    );
  }, [applications, filter]);

  const counts = useMemo(
    () => ({
      ALL: applications.length,
      PENDING: applications.filter(
        (application) => application.status === "PENDING"
      ).length,
      ACCEPTED: applications.filter(
        (application) => application.status === "ACCEPTED"
      ).length,
      REJECTED: applications.filter(
        (application) => application.status === "REJECTED"
      ).length,
      WITHDRAWN: applications.filter(
        (application) => application.status === "WITHDRAWN"
      ).length,
    }),
    [applications]
  );

  const handleViewApplication = (applicationId: number) => {
    navigate(
      `/worker/dashboard/applications/${applicationId}`
    );
  };

  const handleCancelApplication = async () => {
    if (!applicationToCancel) return;

    try {
      setIsCancelling(true);

      await withdrawApplication(applicationToCancel.id);

      setApplicationToCancel(null);
      await loadApplications();

      setFeedback({
        isOpen: true,
        type: "success",
        title: "Application Cancelled",
        message:
          "Your application has been successfully withdrawn.",
      });
    } catch (error) {
      console.error(
        "Failed to withdraw application:",
        error
      );

      setApplicationToCancel(null);

      setFeedback({
        isOpen: true,
        type: "error",
        title: "Unable to Cancel Application",
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel your application. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseFeedback = () => {
    setFeedback((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  return (
    <>
      <div className="min-w-0 pb-8">
        {/* HEADER */}

        <section className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <span className="text-lg font-bold text-emerald-600">
                A
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                My Applications
              </h1>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Track the jobs you've applied for.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading your applications...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-emerald-600">
                !
              </div>

              <h2 className="mt-3 text-lg font-semibold text-slate-900">
                Unable to load applications
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={loadApplications}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* FILTERS */}

            <div className="sm:w-60 sm:shrink-0">
              <ApplicationStatusSidebar
                status={filter}
                setStatus={setFilter}
                counts={counts}
              />
            </div>

            {/* APPLICATION LIST */}

            <main className="min-w-0 flex-1">
              {filteredApplications.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                  <div className="max-w-sm px-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                      <span className="text-lg font-bold text-emerald-600">
                        A
                      </span>
                    </div>

                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                      No applications found
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {filter === "ALL"
                        ? "You haven't applied for any jobs yet."
                        : `You don't have any ${filter.toLowerCase()} applications.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredApplications.map((application) => (
                    <article
                      key={application.id}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        transition
                        hover:border-slate-300
                        hover:shadow-md
                        sm:p-5
                      "
                    >
                      {/* APPLICATION HEADER */}

                      <div className="flex items-start gap-3">
                        <Avatar
                          photoUrl={application.clientPhotoUrl}
                          name={application.clientName}
                          size="md"
                        />

                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-base font-semibold text-slate-900">
                            {application.jobTitle}
                          </h2>

                          <p className="mt-1 text-xs text-slate-500">
                            {application.clientName
                              ? `Posted by ${application.clientName} · `
                              : ""}
                            Applied{" "}
                            {formatDate(application.appliedAt)}
                          </p>
                        </div>

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
                            ${getStatusClasses(application.status)}
                          `}
                        >
                          <span className="text-sm leading-none text-emerald-600">
                            {getStatusIndicator(application.status)}
                          </span>

                          {application.status}
                        </span>
                      </div>

                      {/* STATUS MESSAGE */}

                      {application.status === "ACCEPTED" && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-sm font-medium text-slate-800">
                            Your application was accepted.
                          </p>

                          <p className="mt-0.5 text-xs text-slate-600">
                            Check My Work for the next steps.
                          </p>
                        </div>
                      )}

                      {application.status === "REJECTED" && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-sm font-medium text-slate-800">
                            This application was not accepted.
                          </p>
                        </div>
                      )}

                      {application.status === "PENDING" && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-sm font-medium text-slate-800">
                            Your application is waiting for the client to respond.
                          </p>
                        </div>
                      )}

                      {application.status === "WITHDRAWN" && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            You withdrew this application.
                          </p>
                        </div>
                      )}

                      {/* APPLICATION FOOTER */}

                      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {application.jobAvailable
                              ? "Available"
                              : "Unavailable"}
                          </span>

                          <span>Job details</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {application.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() =>
                                setApplicationToCancel(application)
                              }
                              className="
                                flex-1
                                rounded-xl
                                border
                                border-slate-200
                                px-3.5
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:border-slate-300
                                hover:bg-slate-50
                                hover:text-slate-900
                                sm:flex-none
                              "
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewApplication(application.id)
                            }
                            className="
                              inline-flex
                              flex-1
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-slate-900
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-slate-800
                              sm:flex-none
                            "
                          >
                            View Application
                            <span className="text-emerald-400">
                              →
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* CANCEL CONFIRMATION */}

      {applicationToCancel && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-end
            justify-center
            bg-slate-900/40
            sm:items-center
            sm:p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-t-3xl
              bg-white
              p-6
              pb-[calc(env(safe-area-inset-bottom)+24px)]
              shadow-xl
              sm:rounded-2xl
              sm:pb-6
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-emerald-600">
                !
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Cancel this application?
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  You are about to cancel your application for{" "}
                  <span className="font-semibold text-slate-900">
                    {applicationToCancel.jobTitle}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setApplicationToCancel(null)}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
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
                  bg-slate-900
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800
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
